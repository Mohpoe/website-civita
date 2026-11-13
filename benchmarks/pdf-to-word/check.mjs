import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCloudConvertAccount } from './providers/cloudconvert.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const envFile = join(ROOT, '.env');

if (existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const clientId = process.env.ADOBE_CLIENT_ID;
const clientSecret = process.env.ADOBE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.log('Adobe: kredensial belum diisi di .env');
} else {
  try {
    const res = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'openid,AdobeID,read_organizations',
      }),
    });

    if (res.ok) {
      const json = await res.json();
      console.log(`Adobe: OK (token berlaku ${Math.round((json.expires_in ?? 0) / 3600)} jam)`);
    } else {
      console.log(`Adobe: GAGAL ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
  } catch (error) {
    console.log(`Adobe: GAGAL ${error.message}`);
  }
}

try {
  const account = await getCloudConvertAccount(process.env.CLOUDCONVERT_API_KEY);
  const verified = account.email_verified === false ? ' — EMAIL BELUM DIVERIFIKASI' : '';
  console.log(
    `CloudConvert: OK — ${account.email ?? account.id}, ${account.credits} kredit ` +
      `(${Math.floor(account.credits / 4)} konversi PDF ke DOCX)${verified}`,
  );
} catch (error) {
  console.log(`CloudConvert: GAGAL ${error.message}`);
}
