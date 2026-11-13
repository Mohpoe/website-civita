import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractPdfText } from './lib/metrics.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const folder = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'samples');

const files = (await readdir(folder)).filter((file) => extname(file).toLowerCase() === '.pdf').sort();

if (files.length === 0) {
  console.log(`Tidak ada PDF di ${folder}`);
  process.exit(0);
}

const rows = [];
for (const file of files) {
  const buffer = await readFile(join(folder, file));
  const pdf = await extractPdfText(buffer);
  const charsPerPage = pdf.pages ? Math.round(pdf.chars / pdf.pages) : 0;

  rows.push({
    file,
    halaman: pdf.pages,
    kata: pdf.words,
    'karakter/halaman': charsPerPage,
    'kemungkinan scan': charsPerPage < 80 ? 'ya' : 'tidak',
  });
}

console.table(rows);
