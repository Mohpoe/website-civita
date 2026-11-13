import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeDocx, compareText, extractPdfText } from './lib/metrics.mjs';
import { createAdobeProvider } from './providers/adobe.mjs';
import {
  CLOUDCONVERT_CREDITS_PER_CONVERSION,
  createCloudConvertProvider,
  getCloudConvertAccount,
} from './providers/cloudconvert.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const envFile = join(ROOT, '.env');

if (existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if (options.providers.length === 0) {
  console.error('Pilih minimal satu provider: adobe, cloudconvert, atau both.');
  process.exit(1);
}

await mkdir(options.out, { recursive: true });

const allFiles = (await readdir(options.samples))
  .filter((file) => extname(file).toLowerCase() === '.pdf')
  .filter((file) => !options.only || file.toLowerCase().includes(options.only.toLowerCase()))
  .sort();

if (allFiles.length === 0) {
  console.log(`Tidak ada PDF di ${options.samples}`);
  console.log('Letakkan sampel PDF di folder tersebut, lalu jalankan ulang perintah ini.');
  process.exit(0);
}

const files = allFiles.slice(0, options.limit);

console.log(`Sampel : ${files.length} PDF`);
console.log(`Provider: ${options.providers.join(', ')}`);
console.log(`Output  : ${options.out}\n`);

const providers = {};
if (options.providers.includes('adobe')) {
  providers.adobe = createAdobeProvider({
    clientId: process.env.ADOBE_CLIENT_ID,
    clientSecret: process.env.ADOBE_CLIENT_SECRET,
    ocrLang: options.ocrLang,
  });
}

let cloudConvertCapacity = Number.POSITIVE_INFINITY;
let cloudConvertUsed = 0;
let cloudConvertSkipReason = null;

if (options.providers.includes('cloudconvert')) {
  providers.cloudconvert = createCloudConvertProvider({ apiKey: process.env.CLOUDCONVERT_API_KEY });

  if (!options.force) {
    const account = await getCloudConvertAccount(process.env.CLOUDCONVERT_API_KEY);
    cloudConvertCapacity = Math.floor(account.credits / CLOUDCONVERT_CREDITS_PER_CONVERSION);

    if (account.email_verified === false) {
      cloudConvertCapacity = 0;
      cloudConvertSkipReason = 'Email CloudConvert belum diverifikasi.';
      console.log(
        `CloudConvert: email ${account.email ?? ''} belum diverifikasi. ` +
          'Verifikasi lewat tautan di inbox, lalu jalankan ulang.',
      );
    } else {
      console.log(
        `CloudConvert: ${account.email ?? account.id} — ${account.credits} kredit ` +
          `(kapasitas ${cloudConvertCapacity} konversi hari ini)`,
      );
      if (cloudConvertCapacity < files.length) {
        console.log(
          `Perhatian: hanya ${cloudConvertCapacity} file pertama yang akan diproses CloudConvert. ` +
            'Kredit gratis biasanya reset setiap hari.',
        );
      }
    }
    console.log('');
  }
}

const results = [];

for (const file of files) {
  const sourcePath = join(options.samples, file);
  const buffer = await readFile(sourcePath);

  let pdf;
  try {
    pdf = await extractPdfText(buffer);
  } catch (error) {
    console.warn(`[${file}] gagal membaca teks PDF: ${error.message}`);
    pdf = { text: '', pages: null, chars: 0, words: 0 };
  }

  const charsPerPage = pdf.pages ? pdf.chars / pdf.pages : 0;
  const likelyScan = pdf.pages !== null && charsPerPage < 80;
  const useOcr = options.ocrMode === 'force' || (options.ocrMode === 'auto' && likelyScan);

  for (const providerName of options.providers) {
    if (providerName === 'cloudconvert' && cloudConvertUsed >= cloudConvertCapacity) {
      results.push({
        file,
        provider: providerName,
        ok: false,
        skipped: true,
        likelyScan,
        error: cloudConvertSkipReason ?? 'Kredit CloudConvert tidak cukup pada run ini.',
        pdf: { pages: pdf.pages, words: pdf.words, chars: pdf.chars },
      });
      console.log(`- ${file} [cloudconvert] dilewati (${cloudConvertSkipReason ?? 'kredit habis'})`);
      continue;
    }

    const provider = providers[providerName];
    process.stdout.write(`- ${file} [${providerName}]${useOcr && providerName === 'adobe' ? ' [OCR]' : ''} ... `);

    try {
      const converted = await provider.convert({
        buffer,
        filename: file,
        ocr: useOcr,
      });

      const outputFile = `${file.replace(/\.pdf$/i, '')}.${providerName}.docx`;
      const outputPath = join(options.out, outputFile);
      await writeFile(outputPath, converted.buffer);

      const docx = await analyzeDocx(converted.buffer);
      const similarity = compareText(pdf.text, docx.text);
      const diceLabel = similarity.dice === null ? 'n/a' : similarity.dice.toFixed(3);

      if (providerName === 'cloudconvert') {
        cloudConvertUsed += converted.credits;
      }

      results.push({
        file,
        provider: providerName,
        ok: true,
        ocr: providerName === 'adobe' && (converted.meta?.ocr ?? useOcr),
        likelyScan,
        durationMs: converted.durationMs,
        outputFile,
        outputBytes: converted.buffer.length,
        credits: converted.credits,
        pdf: { pages: pdf.pages, words: pdf.words, chars: pdf.chars },
        docx: {
          pages: docx.pages,
          words: docx.words,
          chars: docx.chars,
          tables: docx.tables,
          paragraphs: docx.paragraphs,
          images: docx.images,
          columns: docx.columns,
          textBoxes: docx.textBoxes,
          pageSize: docx.pageSize,
        },
        similarity: {
          dice: similarity.dice,
          containment: similarity.containment,
          matchedWords: similarity.matchedWords,
          wordRatio: similarity.wordRatio,
          missingWords: similarity.missingWords,
          extraWords: similarity.extraWords,
        },
        meta: converted.meta,
      });

      console.log(
        `OK ${(converted.durationMs / 1000).toFixed(1)}s, ${(converted.buffer.length / 1024).toFixed(0)} KB, ` +
          `dice ${diceLabel}`,
      );
    } catch (error) {
      results.push({
        file,
        provider: providerName,
        ok: false,
        likelyScan,
        error: error.message,
        pdf: { pages: pdf.pages, words: pdf.words, chars: pdf.chars },
      });
      console.log(`GAGAL: ${error.message}`);
    }
  }
}

const resultsPath = join(options.out, 'results.json');
let allResults = results;

if (options.append && existsSync(resultsPath)) {
  const previous = JSON.parse(await readFile(resultsPath, 'utf8'));
  const key = (row) => `${row.file}::${row.provider}`;
  const replaced = new Set(results.map(key));
  allResults = [...previous.filter((row) => !replaced.has(key(row))), ...results];
}

await writeFile(resultsPath, JSON.stringify(allResults, null, 2));
await writeFile(join(options.out, 'results.csv'), toCsv(allResults));
await writeFile(join(options.out, 'SCORING.md'), toScoringSheet(allResults));

printSummary(allResults, options.append);

function parseArgs(argv) {
  const parsed = {
    providers: ['adobe'],
    samples: join(ROOT, 'samples'),
    out: join(ROOT, 'out'),
    ocrMode: 'off',
    ocrLang: 'en-US',
    only: null,
    limit: Number.POSITIVE_INFINITY,
    force: false,
    append: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--ocr') parsed.ocrMode = 'force';
    else if (arg === '--ocr=auto') parsed.ocrMode = 'auto';
    else if (arg === '--append') parsed.append = true;
    else if (arg === '--force') parsed.force = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else if (arg.startsWith('--provider=')) {
      const value = arg.slice('--provider='.length).trim();
      parsed.providers =
        value === 'both'
          ? ['adobe', 'cloudconvert']
          : value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
    } else if (arg.startsWith('--samples=')) {
      parsed.samples = resolve(arg.slice('--samples='.length));
    } else if (arg.startsWith('--out=')) {
      parsed.out = resolve(arg.slice('--out='.length));
    } else if (arg.startsWith('--only=')) {
      parsed.only = arg.slice('--only='.length);
    } else if (arg.startsWith('--limit=')) {
      parsed.limit = Number(arg.slice('--limit='.length));
    } else if (arg.startsWith('--ocr-lang=')) {
      parsed.ocrLang = arg.slice('--ocr-lang='.length);
    } else {
      console.error(`Argumen tidak dikenal: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }

  const valid = new Set(['adobe', 'cloudconvert']);
  for (const provider of parsed.providers) {
    if (!valid.has(provider)) {
      console.error(`Provider tidak dikenal: ${provider}`);
      process.exit(1);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`Pemakaian:
  node benchmarks/pdf-to-word/run.mjs [opsi]

Opsi:
  --provider=adobe|cloudconvert|both   Provider yang diuji (default: adobe)
  --samples=<folder>                   Folder PDF (default: benchmarks/pdf-to-word/samples)
  --out=<folder>                       Folder hasil (default: benchmarks/pdf-to-word/out)
  --only=<teks>                        Hanya file yang namanya mengandung teks ini
  --limit=<n>                          Maksimal jumlah file
  --ocr                                Paksa OCR Adobe untuk semua file
  --ocr=auto                           OCR hanya untuk PDF yang terdeteksi scan
  --ocr-lang=en-US                     Bahasa OCR Adobe
  --append                             Gabungkan hasil dengan results.json sebelumnya
  --force                              Lewati pengecekan kredit CloudConvert
`);
}

function toCsv(rows) {
  const header = [
    'file',
    'provider',
    'ok',
    'skipped',
    'ocr',
    'likely_scan',
    'duration_ms',
    'output_bytes',
    'credits',
    'pdf_pages',
    'pdf_words',
    'docx_words',
    'dice',
    'containment',
    'word_ratio',
    'tables',
    'images',
    'columns',
    'docx_pages',
    'error',
  ];

  const lines = rows.map((row) =>
    [
      row.file,
      row.provider,
      row.ok ? 'yes' : 'no',
      row.skipped ? 'yes' : 'no',
      row.ocr ? 'yes' : 'no',
      row.likelyScan ? 'yes' : 'no',
      row.durationMs ?? '',
      row.outputBytes ?? '',
      row.credits ?? '',
      row.pdf?.pages ?? '',
      row.pdf?.words ?? '',
      row.docx?.words ?? '',
      row.similarity?.dice ?? '',
      row.similarity?.containment ?? '',
      row.similarity?.wordRatio ?? '',
      row.docx?.tables ?? '',
      row.docx?.images ?? '',
      row.docx?.columns ?? '',
      row.docx?.pages ?? '',
      row.error ?? '',
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(','),
  );

  return [header.join(','), ...lines].join('\n');
}

function toScoringSheet(rows) {
  const successful = rows.filter((row) => row.ok);
  const body = successful
    .map(
      (row) =>
        `| ${row.file} | ${row.provider} | | | | | | | |`,
    )
    .join('\n');

  return `# Lembar penilaian manual

Buka file DOCX di folder \`out/\`, bandingkan dengan PDF aslinya, lalu beri skor 1–5.

- **Layout**: posisi kolom, margin, dan urutan konten mendekati aslinya.
- **Editabilitas**: teks bisa diedit tanpa membuat layout berantakan.
- **Tabel**: tabel tetap berupa tabel, bukan kumpulan teks lepas.
- **Font**: jenis, ukuran, dan hierarki heading wajar.
- **Gambar**: foto/ikon tetap ada dan tidak pecah.
- **OCR**: hanya untuk PDF scan; teks hasil scan terbaca benar.

| File | Provider | Layout | Editabilitas | Tabel | Font | Gambar | OCR | Catatan |
|---|---|---|---|---|---|---|---|---|
${body}
`;
}

function printSummary(rows, appended = false) {
  const successful = rows.filter((row) => row.ok);
  if (successful.length === 0) {
    console.log('\nTidak ada konversi yang berhasil.');
    return;
  }

  console.log(appended ? '\nRingkasan (gabungan)' : '\nRingkasan');
  console.table(
    successful.map((row) => ({
      file: row.file,
      provider: row.provider,
      ocr: row.ocr ? 'ya' : '-',
      detik: Number((row.durationMs / 1000).toFixed(1)),
      kb: Math.round(row.outputBytes / 1024),
      dice: row.similarity.dice ?? 'n/a',
      tabel: row.docx.tables,
      gambar: row.docx.images,
      kolom: row.docx.columns,
    })),
  );

  for (const provider of [...new Set(successful.map((row) => row.provider))]) {
    const subset = successful.filter((row) => row.provider === provider);
    const scored = subset.filter((row) => typeof row.similarity?.dice === 'number');
    if (scored.length === 0) {
      console.log(`${provider}: tidak ada skor teks otomatis (semua PDF tanpa text layer)`);
      continue;
    }
    const average = scored.reduce((sum, row) => sum + row.similarity.dice, 0) / scored.length;
    const unscored = subset.length - scored.length;
    console.log(
      `${provider}: rata-rata dice ${average.toFixed(3)} dari ${scored.length} file` +
        (unscored > 0 ? ` (${unscored} file tanpa text layer)` : ''),
    );
  }

  console.log(`\nDetail lengkap: ${join(options.out, 'results.json')}`);
  console.log(`Lembar skor  : ${join(options.out, 'SCORING.md')}`);
}
