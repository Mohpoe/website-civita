import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9223;
const APP = process.env.E2E_BASE ?? "http://localhost:3100/pdf-to-word";
const SAMPLE = "benchmarks/pdf-to-word/samples/1-dari-word.pdf";
const SHOT = "benchmarks/pdf-to-word/out/turnstile-check.png";

const profile = await mkdtemp(join(tmpdir(), "civita-turnstile-"));
const browser = spawn(
  EDGE,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--window-size=1280,1000",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(check, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await sleep(500);
  }
  throw new Error(`timeout menunggu ${label}`);
}

let ws;
try {
  await waitFor(
    async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
        return res.ok;
      } catch {
        return false;
      }
    },
    20_000,
    "browser",
  );

  const targetRes = await fetch(
    `http://127.0.0.1:${PORT}/json/new?about:blank`,
    { method: "PUT" },
  );
  const target = await targetRes.json();

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("gagal membuka websocket CDP"));
  });

  let seq = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  };

  const send = (method, params = {}) => {
    const id = ++seq;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text);
    }
    return result.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: APP });

  await waitFor(
    () =>
      evaluate(
        "document.body && document.body.innerText.includes('Klik untuk memilih file PDF')",
      ),
    60_000,
    "halaman siap",
  );

  // Pastikan React sudah menghidrasi input sebelum event change dikirim;
  // teks dropzone sendiri sudah ada dari HTML server.
  await waitFor(
    () =>
      evaluate(`(() => {
        const input = document.querySelector('input[type=file]');
        return !!input && Object.keys(input).some((key) => key.startsWith('__reactFiber$'));
      })()`),
    30_000,
    "hidrasi React",
  );

  const base64 = (await readFile(SAMPLE)).toString("base64");

  const injected = await evaluate(`(async () => {
    const bin = atob(${JSON.stringify(base64)});
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    const input = document.querySelector('input[type=file]');
    if (!input) return 'input-tidak-ada';
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], 'uji-turnstile.pdf', { type: 'application/pdf' }));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'file-dipilih';
  })()`);
  console.log("injeksi file:", injected);

  let state = null;
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    state = await evaluate(`JSON.stringify({
      turnstile: !!window.turnstile,
      iframe: !!document.querySelector('iframe[src*="challenges.cloudflare.com"]'),
      script: !!document.getElementById('cf-turnstile-script'),
      error: Array.from(document.querySelectorAll('p')).some((el) => el.className.includes('text-destructive')),
      text: (document.body.innerText.match(/Verifikasi keamanan[\\s\\S]{0,120}/) ?? [''])[0]
    })`);
    const parsed = JSON.parse(state);
    if (parsed.iframe) break;
    await sleep(1000);
  }

  console.log("status widget:", state);

  const shot = await send("Page.captureScreenshot", { format: "png" });
  await writeFile(SHOT, Buffer.from(shot.data, "base64"));
  console.log("screenshot:", SHOT);
} finally {
  try {
    ws?.close();
  } catch {
    // abaikan
  }
  browser.kill("SIGKILL");
}
