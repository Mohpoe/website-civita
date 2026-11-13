const API_BASE = 'https://api.cloudconvert.com/v2';
const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 300_000;
export const CLOUDCONVERT_CREDITS_PER_CONVERSION = 4;

function errorText(status, body) {
  return `CloudConvert API ${status}: ${String(body).slice(0, 500)}`;
}

function authHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function getCloudConvertAccount(apiKey) {
  if (!apiKey) throw new Error('CLOUDCONVERT_API_KEY belum diisi.');

  const res = await fetch(`${API_BASE}/users/me`, { headers: authHeaders(apiKey) });
  const text = await res.text();
  if (!res.ok) throw new Error(errorText(res.status, text));
  return JSON.parse(text).data;
}

export function createCloudConvertProvider({ apiKey }) {
  if (!apiKey) throw new Error('CLOUDCONVERT_API_KEY belum diisi.');

  async function convert({ buffer, filename }) {
    const startedAt = performance.now();

    const jobRes = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { ...authHeaders(apiKey), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: {
          import: { operation: 'import/upload' },
          convert: {
            operation: 'convert',
            input: 'import',
            input_format: 'pdf',
            output_format: 'docx',
          },
          export: { operation: 'export/url', input: 'convert' },
        },
      }),
    });

    const jobText = await jobRes.text();
    if (!jobRes.ok) throw new Error(errorText(jobRes.status, jobText));
    const job = JSON.parse(jobText).data;

    const importTask = job.tasks.find((task) => task.name === 'import');
    const form = importTask?.result?.form;
    if (!form) throw new Error('CloudConvert tidak mengembalikan form upload.');

    const formData = new FormData();
    for (const [key, value] of Object.entries(form.parameters ?? {})) {
      formData.append(key, value);
    }
    formData.append('file', new Blob([buffer], { type: 'application/pdf' }), filename);

    const uploadRes = await fetch(form.url, { method: 'POST', body: formData });
    if (!uploadRes.ok) {
      throw new Error(errorText(uploadRes.status, await uploadRes.text()));
    }

    const deadline = Date.now() + MAX_WAIT_MS;
    let lastStatus = job.status ?? 'unknown';

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollRes = await fetch(`${API_BASE}/jobs/${job.id}?include=tasks`, {
        headers: authHeaders(apiKey),
      });
      const pollText = await pollRes.text();
      if (!pollRes.ok) throw new Error(errorText(pollRes.status, pollText));

      const polled = JSON.parse(pollText).data;
      lastStatus = polled.status ?? lastStatus;

      if (polled.status === 'finished') {
        const exportTask = polled.tasks.find((task) => task.name === 'export');
        const fileUrl = exportTask?.result?.files?.[0]?.url;
        if (!fileUrl) throw new Error('CloudConvert selesai tetapi URL hasil tidak ditemukan.');

        const downloadRes = await fetch(fileUrl);
        if (!downloadRes.ok) {
          throw new Error(errorText(downloadRes.status, await downloadRes.text()));
        }
        const output = Buffer.from(await downloadRes.arrayBuffer());
        const convertTask = polled.tasks.find((task) => task.name === 'convert');

        return {
          buffer: output,
          durationMs: Math.round(performance.now() - startedAt),
          credits: convertTask?.credits ?? CLOUDCONVERT_CREDITS_PER_CONVERSION,
          meta: {
            jobId: job.id,
            remoteSize: exportTask?.result?.files?.[0]?.size ?? output.length,
            credits: convertTask?.credits ?? CLOUDCONVERT_CREDITS_PER_CONVERSION,
          },
        };
      }

      if (polled.status === 'error') {
        const failed = polled.tasks?.find((task) => task.status === 'error');
        throw new Error(`CloudConvert job gagal: ${failed?.message ?? JSON.stringify(polled).slice(0, 500)}`);
      }
    }

    throw new Error(`CloudConvert job timeout setelah ${MAX_WAIT_MS / 1000} detik (status terakhir: ${lastStatus}).`);
  }

  return { name: 'cloudconvert', convert };
}
