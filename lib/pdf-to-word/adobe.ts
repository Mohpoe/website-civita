const TOKEN_URL = "https://ims-na1.adobelogin.com/ims/token/v3";
const API_BASE = "https://pdf-services.adobe.io";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type CachedToken = {
  value: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ADOBE_CLIENT_ID dan ADOBE_CLIENT_SECRET belum diisi.");
  }

  return { clientId, clientSecret };
}

function errorText(status: number, body: string): string {
  return `Adobe API ${status}: ${body.slice(0, 300)}`;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const { clientId, clientSecret } = getCredentials();

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "openid,AdobeID,read_organizations",
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(errorText(res.status, text));

  const json = JSON.parse(text) as { access_token: string; expires_in?: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };

  return cachedToken.value;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { clientId } = getCredentials();
  return {
    Authorization: `Bearer ${await getAccessToken()}`,
    "X-API-Key": clientId,
  };
}

/**
 * Upload PDF ke Adobe lalu buat job export ke DOCX.
 *
 * Fungsi ini sengaja hanya melakukan submit dan langsung mengembalikan URL
 * polling. Penyelesaian job dilakukan oleh route status supaya setiap request
 * tetap pendek dan aman di batas durasi Vercel Hobby.
 */
export async function submitPdfToDocx({
  buffer,
  fileName,
}: {
  buffer: Buffer;
  fileName: string;
}): Promise<{ pollUrl: string }> {
  const headers = await authHeaders();

  const assetRes = await fetch(`${API_BASE}/assets`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ mediaType: "application/pdf" }),
    signal: AbortSignal.timeout(15_000),
  });
  const assetText = await assetRes.text();
  if (!assetRes.ok) throw new Error(errorText(assetRes.status, assetText));

  const asset = JSON.parse(assetText) as { assetID: string; uploadUri: string };

  const uploadRes = await fetch(asset.uploadUri, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: new Uint8Array(buffer),
    signal: AbortSignal.timeout(45_000),
  });
  if (!uploadRes.ok) {
    throw new Error(errorText(uploadRes.status, await uploadRes.text()));
  }

  const jobRes = await fetch(`${API_BASE}/operation/exportpdf`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      assetID: asset.assetID,
      targetFormat: "docx",
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const jobText = await jobRes.text();
  if (!jobRes.ok) throw new Error(errorText(jobRes.status, jobText));

  const location = jobRes.headers.get("location");
  if (!location) {
    throw new Error(`Adobe tidak mengembalikan URL polling untuk ${fileName}.`);
  }

  return {
    pollUrl: location.startsWith("http") ? location : `${API_BASE}${location}`,
  };
}

export type AdobePollResult =
  | { status: "pending" }
  | { status: "done"; downloadUri: string; size?: number }
  | { status: "failed"; error: string };

export async function pollAdobeJob(pollUrl: string): Promise<AdobePollResult> {
  const res = await fetch(pollUrl, {
    headers: await authHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(errorText(res.status, text));

  const json = JSON.parse(text) as {
    status?: string;
    asset?: { downloadUri?: string; metadata?: { size?: number } };
    error?: unknown;
  };

  if (json.status === "done") {
    if (!json.asset?.downloadUri) {
      return { status: "failed", error: "Adobe tidak mengembalikan URL unduhan." };
    }
    return {
      status: "done",
      downloadUri: json.asset.downloadUri,
      size: json.asset.metadata?.size,
    };
  }

  if (json.status === "failed") {
    return {
      status: "failed",
      error: `Adobe gagal memproses dokumen: ${JSON.stringify(json.error ?? json).slice(0, 300)}`,
    };
  }

  return { status: "pending" };
}

export async function downloadAdobeAsset(downloadUri: string): Promise<Buffer> {
  const res = await fetch(downloadUri, {
    cache: "no-store",
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    throw new Error(errorText(res.status, await res.text()));
  }

  return Buffer.from(await res.arrayBuffer());
}

export const ADOBE_DOCX_MIME = DOCX_MIME;
