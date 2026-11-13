const TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token/v3';
const API_BASE = 'https://pdf-services.adobe.io';
const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 180_000;

function errorText(status, body) {
  return `Adobe API ${status}: ${String(body).slice(0, 500)}`;
}

export async function getAdobeAccessToken({ clientId, clientSecret }) {
  if (!clientId || !clientSecret) {
    throw new Error('ADOBE_CLIENT_ID dan ADOBE_CLIENT_SECRET belum diisi.');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'openid,AdobeID,read_organizations',
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(errorText(res.status, text));

  const json = JSON.parse(text);
  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in ?? 3600,
  };
}

export function createAdobeProvider({ clientId, clientSecret, ocrLang = 'en-US' }) {
  if (!clientId || !clientSecret) {
    throw new Error('ADOBE_CLIENT_ID dan ADOBE_CLIENT_SECRET belum diisi.');
  }

  let cachedToken = null;

  async function getToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
      return cachedToken.value;
    }

    const token = await getAdobeAccessToken({ clientId, clientSecret });
    cachedToken = {
      value: token.accessToken,
      expiresAt: Date.now() + token.expiresIn * 1000,
    };
    return cachedToken.value;
  }

  async function convert({ buffer, filename, ocr = false }) {
    const startedAt = performance.now();
    const token = await getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      'X-API-Key': clientId,
    };

    const assetRes = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaType: 'application/pdf' }),
    });
    const assetText = await assetRes.text();
    if (!assetRes.ok) throw new Error(errorText(assetRes.status, assetText));
    const asset = JSON.parse(assetText);

    const uploadRes = await fetch(asset.uploadUri, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: buffer,
    });
    if (!uploadRes.ok) {
      throw new Error(errorText(uploadRes.status, await uploadRes.text()));
    }

    const jobRes = await fetch(`${API_BASE}/operation/exportpdf`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetID: asset.assetID,
        targetFormat: 'docx',
        ...(ocr ? { ocrLang } : {}),
      }),
    });

    const jobText = await jobRes.text();
    if (!jobRes.ok) throw new Error(errorText(jobRes.status, jobText));

    const location = jobRes.headers.get('location');
    if (!location) throw new Error('Adobe tidak mengembalikan header Location untuk job.');

    const pollUrl = location.startsWith('http') ? location : `${API_BASE}${location}`;
    const deadline = Date.now() + MAX_WAIT_MS;
    let lastStatus = 'unknown';

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollRes = await fetch(pollUrl, { headers });
      const pollText = await pollRes.text();
      if (!pollRes.ok) throw new Error(errorText(pollRes.status, pollText));

      const poll = JSON.parse(pollText);
      lastStatus = poll.status ?? lastStatus;

      if (poll.status === 'done') {
        const downloadRes = await fetch(poll.asset.downloadUri);
        if (!downloadRes.ok) {
          throw new Error(errorText(downloadRes.status, await downloadRes.text()));
        }
        const output = Buffer.from(await downloadRes.arrayBuffer());

        return {
          buffer: output,
          durationMs: Math.round(performance.now() - startedAt),
          credits: 1,
          meta: {
            jobId: pollUrl.split('/').at(-2),
            remoteSize: poll.asset?.metadata?.size ?? output.length,
            ocr,
            ocrLang: ocr ? ocrLang : null,
          },
        };
      }

      if (poll.status === 'failed') {
        throw new Error(`Adobe job gagal: ${JSON.stringify(poll).slice(0, 500)}`);
      }
    }

    throw new Error(`Adobe job timeout setelah ${MAX_WAIT_MS / 1000} detik (status terakhir: ${lastStatus}).`);
  }

  return { name: 'adobe', convert };
}
