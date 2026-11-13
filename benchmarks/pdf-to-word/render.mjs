import { createCanvas } from '@napi-rs/canvas';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const input = process.argv[2];
const outputFolder = process.argv[3] ? resolve(process.argv[3]) : join(ROOT, 'out', 'render');
const scale = Number(process.argv[4] ?? 1.6);

if (!input) {
  console.log('Pemakaian: node benchmarks/pdf-to-word/render.mjs <file.pdf> [folder-output] [skala]');
  process.exit(1);
}

await mkdir(outputFolder, { recursive: true });

const data = await readFile(resolve(input));
const doc = await pdfjsLib.getDocument({ data: new Uint8Array(data), useSystemFonts: true }).promise;
const base = basename(input).replace(/\.pdf$/i, '');

for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');

  await page.render({ canvasContext: context, viewport, canvas }).promise;

  const outputPath = join(outputFolder, `${base}-p${pageNumber}.png`);
  await writeFile(outputPath, canvas.toBuffer('image/png'));
  console.log(`${outputPath} (${canvas.width}x${canvas.height})`);
}
