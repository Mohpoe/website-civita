import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';

export async function extractPdfText(buffer) {
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise;

  const lines = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();

    const rows = new Map();
    for (const item of content.items) {
      if (typeof item.str !== 'string' || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      const row = rows.get(y) ?? [];
      row.push({ x: item.transform[4], text: item.str });
      rows.set(y, row);
    }

    const pageLines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => items.sort((a, b) => a.x - b.x).map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    lines.push(...pageLines);
  }

  const text = lines.join('\n');
  return {
    text,
    pages: doc.numPages,
    chars: text.length,
    words: tokenize(text).length,
  };
}

function decodeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, '&');
}

function tokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export async function analyzeDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('DOCX tidak memiliki word/document.xml');

  const xml = await documentFile.async('string');
  const text = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((match) => decodeXml(match[1]))
    .join(' ');

  const appFile = zip.file('docProps/app.xml');
  const appXml = appFile ? await appFile.async('string') : '';
  const pageCount = Number(appXml.match(/<Pages>(\d+)<\/Pages>/)?.[1]) || null;

  const media = Object.keys(zip.files).filter((name) => name.startsWith('word/media/') && !zip.files[name].dir);
  const columnMatches = [...xml.matchAll(/<w:cols\b[^>]*\bw:num="(\d+)"/g)].map((match) => Number(match[1]));
  const pageSize = xml.match(/<w:pgSz\b[^>]*\bw:w="(\d+)"[^>]*\bw:h="(\d+)"/);

  const words = tokenize(text);
  return {
    text,
    words: words.length,
    chars: text.length,
    pages: pageCount,
    tables: (xml.match(/<w:tbl\b/g) ?? []).length,
    paragraphs: (xml.match(/<w:p\b/g) ?? []).length,
    images: media.length,
    imageFiles: media,
    textBoxes: (xml.match(/<w:txbxContent>/g) ?? []).length,
    columns: columnMatches.length ? Math.max(...columnMatches) : 1,
    pageSize: pageSize ? { width: Number(pageSize[1]), height: Number(pageSize[2]) } : null,
  };
}

function countWords(words) {
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  return counts;
}

export function compareText(pdfText, docxText) {
  const source = tokenize(pdfText);
  const target = tokenize(docxText);

  if (source.length === 0) {
    return {
      dice: null,
      containment: null,
      matchedWords: 0,
      sourceWords: 0,
      outputWords: target.length,
      wordRatio: null,
      missingWords: [],
      extraWords: [],
      note: 'PDF tidak punya text layer; kemiripan teks tidak bisa dihitung otomatis.',
    };
  }

  const sourceCounts = countWords(source);
  const targetCounts = countWords(target);

  let matched = 0;
  for (const [word, count] of sourceCounts) {
    matched += Math.min(count, targetCounts.get(word) ?? 0);
  }

  const total = source.length + target.length;
  const dice = total === 0 ? 1 : (2 * matched) / total;
  const containment = source.length === 0 ? 1 : matched / source.length;

  const missing = [...sourceCounts.entries()]
    .map(([word, count]) => [word, count - (targetCounts.get(word) ?? 0)])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  const extra = [...targetCounts.entries()]
    .map(([word, count]) => [word, count - (sourceCounts.get(word) ?? 0)])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  return {
    dice: Number(dice.toFixed(4)),
    containment: Number(containment.toFixed(4)),
    matchedWords: matched,
    sourceWords: source.length,
    outputWords: target.length,
    wordRatio: source.length === 0 ? null : Number((target.length / source.length).toFixed(2)),
    missingWords: missing,
    extraWords: extra,
  };
}
