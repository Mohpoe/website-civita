import { readFile } from "node:fs/promises";
import { list } from "@vercel/blob";
import { uploadPresigned } from "@vercel/blob/client";

process.loadEnvFile(".env.local");

const BASE = process.env.E2E_BASE ?? "http://localhost:3100";
const SAMPLE = "benchmarks/pdf-to-word/samples/1-dari-word.pdf";
const FILE_NAME = "double-start.pdf";

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

const before = await api("/api/pdf-to-word/quota");
console.log("kuota awal:", JSON.stringify(before.json.quota));

const ticket = await api("/api/pdf-to-word/ticket", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }),
});
if (!ticket.res.ok) {
  console.log("ticket gagal:", ticket.res.status, JSON.stringify(ticket.json));
  process.exit(1);
}

const file = new File([await readFile(SAMPLE)], FILE_NAME, {
  type: "application/pdf",
});
const blob = await uploadPresigned(ticket.json.pathname, file, {
  access: "private",
  handleUploadUrl: `${BASE}/api/pdf-to-word/upload`,
  contentType: "application/pdf",
});
console.log("upload OK:", blob.pathname);

const body = JSON.stringify({ pathname: blob.pathname, fileName: FILE_NAME });
const startOnce = () =>
  api("/api/pdf-to-word/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

// Dua request bersamaan, meniru klik ganda.
const [a, b] = await Promise.all([startOnce(), startOnce()]);
console.log(`start A: ${a.res.status}`, JSON.stringify(a.json));
console.log(`start B: ${b.res.status}`, JSON.stringify(b.json));

const jobId = a.json.jobId ?? b.json.jobId;
if (!jobId) process.exit(1);

let status = null;
for (let attempt = 0; attempt < 60; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const poll = await api(`/api/pdf-to-word/status?jobId=${jobId}`);
  status = poll.json;
  if (status.status === "done" || status.status === "failed") break;
}
console.log("status akhir:", JSON.stringify(status));

const after = await api("/api/pdf-to-word/quota");
console.log("kuota akhir:", JSON.stringify(after.json.quota));

const ownerId = blob.pathname.split("/")[2];
const outputs = await list({
  prefix: `pdf-to-word/guest/${ownerId}/out/`,
  token: process.env.PRIVATE_BLOB_READ_WRITE_TOKEN,
});
console.log(
  "jumlah output untuk sesi ini:",
  outputs.blobs.length,
  outputs.blobs.map((item) => item.pathname),
);
