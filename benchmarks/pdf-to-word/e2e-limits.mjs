import { readFile, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { uploadPresigned } from "@vercel/blob/client";

const BASE = process.env.E2E_BASE ?? "http://localhost:3100";
const VALID = "benchmarks/pdf-to-word/samples/1-dari-word.pdf";
const BIG = "benchmarks/pdf-to-word/out/21-pages.pdf";

let cookie = "";

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(cookie ? { cookie } : {}) },
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { res, json };
}

async function ticket() {
  return api("/api/pdf-to-word/ticket", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }),
  });
}

async function uploadAndStart(sample, fileName) {
  const t = await ticket();
  if (!t.res.ok) return { step: "ticket", ...t };

  const file = new File([await readFile(sample)], fileName, {
    type: "application/pdf",
  });
  const blob = await uploadPresigned(t.json.pathname, file, {
    access: "private",
    handleUploadUrl: `${BASE}/api/pdf-to-word/upload`,
    contentType: "application/pdf",
  });

  const start = await api("/api/pdf-to-word/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pathname: blob.pathname, fileName }),
  });

  return { step: "start", ...start };
}

// Siapkan PDF 21 halaman untuk menguji batas halaman.
const bigDoc = await PDFDocument.create();
const font = await bigDoc.embedFont(StandardFonts.Helvetica);
for (let page = 1; page <= 21; page++) {
  const sheet = bigDoc.addPage();
  sheet.drawText(`Halaman ${page}`, { x: 50, y: 700, size: 20, font });
}
await writeFile(BIG, await bigDoc.save());

const before = await api("/api/pdf-to-word/quota");
console.log("kuota awal:", JSON.stringify(before.json.quota));

const tooMany = await uploadAndStart(BIG, "21-pages.pdf");
console.log(`\n[21 halaman] ${tooMany.step} ${tooMany.res.status}`);
console.log(JSON.stringify(tooMany.json, null, 2));

const afterReject = await api("/api/pdf-to-word/quota");
console.log("kuota setelah ditolak:", JSON.stringify(afterReject.json.quota));

const ok = await uploadAndStart(VALID, "1-dari-word.pdf");
console.log(`\n[valid] ${ok.step} ${ok.res.status}`);
console.log(JSON.stringify(ok.json, null, 2));

if (ok.res.ok) {
  let status = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const poll = await api(`/api/pdf-to-word/status?jobId=${ok.json.jobId}`);
    status = poll.json;
    if (status.status === "done" || status.status === "failed") break;
  }
  console.log("status akhir:", status.status);

  // Cookie baru (proses baru) seharusnya tidak bisa mengunduh job ini.
  const stranger = await fetch(`${BASE}${status.downloadUrl}`);
  console.log(`[akses tamu lain] ${stranger.status}`);
}

const blocked = await ticket();
console.log(`\n[kuota harian habis] ticket ${blocked.res.status}`);
console.log(JSON.stringify(blocked.json, null, 2));
