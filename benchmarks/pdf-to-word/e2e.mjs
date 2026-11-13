import { readFile } from "node:fs/promises";
import { uploadPresigned } from "@vercel/blob/client";

const BASE = process.env.E2E_BASE ?? "http://localhost:3100";
const SAMPLE = process.argv[2] ?? "benchmarks/pdf-to-word/samples/1-dari-word.pdf";
const FILE_NAME = SAMPLE.split(/[\\/]/).pop();

let cookie = "";

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(cookie ? { cookie } : {}),
    },
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

function log(label, res, json) {
  console.log(`\n[${label}] ${res.status}`);
  console.log(JSON.stringify(json, null, 2));
}

const quota = await api("/api/pdf-to-word/quota");
log("quota", quota.res, quota.json);

const ticket = await api("/api/pdf-to-word/ticket", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" }),
});
log("ticket", ticket.res, ticket.json);

if (!ticket.res.ok) process.exit(1);

const file = new File([await readFile(SAMPLE)], FILE_NAME, {
  type: "application/pdf",
});

const blob = await uploadPresigned(ticket.json.pathname, file, {
  access: "private",
  handleUploadUrl: `${BASE}/api/pdf-to-word/upload`,
  contentType: "application/pdf",
});
console.log("\n[upload] OK", blob.pathname);

const start = await api("/api/pdf-to-word/start", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ pathname: blob.pathname, fileName: FILE_NAME }),
});
log("start", start.res, start.json);

if (!start.res.ok) process.exit(1);

const jobId = start.json.jobId;
let status = null;

for (let attempt = 0; attempt < 120; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const poll = await api(`/api/pdf-to-word/status?jobId=${jobId}`);
  status = poll.json;
  console.log(`[status ${attempt}] ${status.status ?? poll.res.status}`);
  if (status.status === "done" || status.status === "failed") break;
}

console.log("\n[final]", JSON.stringify(status, null, 2));

if (status?.status === "done") {
  const res = await fetch(`${BASE}${status.downloadUrl}`, {
    headers: { cookie },
  });
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(
    `[download] ${res.status} ${res.headers.get("content-type")} ${buffer.length} bytes signature=${buffer.subarray(0, 2).toString()}`,
  );
}

const after = await api("/api/pdf-to-word/quota");
log("quota-after", after.res, after.json);
