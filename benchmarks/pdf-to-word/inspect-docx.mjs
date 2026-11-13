import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const folder = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'out');
const files = (await readdir(folder)).filter((file) => file.toLowerCase().endsWith('.docx')).sort();

for (const file of files) {
  const buffer = await readFile(join(folder, file));
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file('word/document.xml').async('string');
  const text = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((match) => match[1]).join(' ');

  const count = (pattern) => (xml.match(pattern) ?? []).length;
  const columns = [...xml.matchAll(/<w:cols\b[^>]*\bw:num="(\d+)"/g)].map((match) => match[1]).join(',');
  const media = Object.keys(zip.files).filter((name) => name.startsWith('word/media/') && !zip.files[name].dir);
  const xmlHash = createHash('sha256').update(xml).digest('hex').slice(0, 16);

  console.log(`\n### ${file}`);
  console.log(
    `chars=${text.length} tbl=${count(/<w:tbl\b/g)} tr=${count(/<w:tr\b/g)} tc=${count(/<w:tc\b/g)} ` +
      `drawing=${count(/<w:drawing\b/g)} txbx=${count(/<w:txbxContent>/g)} cols=${columns || '-'} ` +
      `media=${media.length} xmlHash=${xmlHash}`,
  );
  console.log(`text: ${text.replace(/\s+/g, ' ').slice(0, 220)}`);
}
