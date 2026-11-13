import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAdobeAccessToken } from './providers/adobe.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const envFile = join(ROOT, '.env');

if (existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const clientId = process.env.ADOBE_CLIENT_ID;
const clientSecret = process.env.ADOBE_CLIENT_SECRET;
const inputFolder = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'out');
const outputFolder = process.argv[3] ? resolve(process.argv[3]) : join(inputFolder, 'pdf');
const only = process.argv[4] ?? null;

await mkdir(outputFolder, { recursive: true });

const files = (await readdir(inputFolder))
  .filter((file) => file.toLowerCase().endsWith('.docx'))
  .filter((file) => !only || file.toLowerCase().includes(only.toLowerCase()))
  .sort();

if (files.length === 0) {
  console.log(`Tidak ada DOCX di ${inputFolder}`);
  process.exit(0);
}

const { accessToken } = await getAdobeAccessToken({ clientId, clientSecret });
const headers = {
  Authorization: `Bearer ${accessToken}`,
  'X-API-Key': clientId,
};

for (const file of files) {
  process.stdout.write(`- ${file} ... `);
  try {
    const buffer = await readFile(join(inputFolder, file));

    const assetRes = await fetch('https://pdf-services.adobe.io/assets', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    });
    const assetText = await assetRes.text();
    if (!assetRes.ok) throw new Error(`asset ${assetRes.status}: ${assetText.slice(0, 300)}`);
    const asset = JSON.parse(assetText);

    const uploadRes = await fetch(asset.uploadUri, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      body: buffer,
    });
    if (!uploadRes.ok) throw new Error(`upload ${uploadRes.status}`);

    const jobRes = await fetch('https://pdf-services.adobe.io/operation/createpdf', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetID: asset.assetID }),
    });
    const jobText = await jobRes.text();
    if (!jobRes.ok) throw new Error(`job ${jobRes.status}: ${jobText.slice(0, 300)}`);

    const location = jobRes.headers.get('location');
    if (!location) throw new Error('tidak ada header Location');

    const pollUrl = location.startsWith('http') ? location : `https://pdf-services.adobe.io${location}`;
    let done = null;

    for (let attempt = 0; attempt < 90; attempt++) {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 2000));
      const pollRes = await fetch(pollUrl, { headers });
      const poll = JSON.parse(await pollRes.text());

      if (poll.status === 'done') {
        done = poll;
        break;
      }
      if (poll.status === 'failed') throw new Error(`job gagal: ${JSON.stringify(poll).slice(0, 300)}`);
    }

    if (!done) throw new Error('timeout');

    const downloadRes = await fetch(done.asset.downloadUri);
    const output = Buffer.from(await downloadRes.arrayBuffer());
    const outputName = `${basename(file, '.docx')}.pdf`;
    await writeFile(join(outputFolder, outputName), output);
    console.log(`OK ${(output.length / 1024).toFixed(0)} KB`);
  } catch (error) {
    console.log(`GAGAL: ${error.message}`);
  }
}
