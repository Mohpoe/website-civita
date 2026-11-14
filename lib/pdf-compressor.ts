import { PDFDocument, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

/**
 * Resolusi render halaman saat kompresi. Skala 2 berarti sekitar 144 DPI untuk
 * halaman A4, cukup tajam untuk teks namun tetap jauh lebih kecil daripada
 * scan 300 DPI.
 */
const RENDER_SCALE = 2;

/** Batas sisi canvas agar halaman berukuran sangat besar tidak kehabisan memori. */
const MAX_RENDER_SIDE = 4000;

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

export type CompressionMethod = "structure" | "raster";

export type CompressionResult = {
  bytes: Uint8Array;
  method: CompressionMethod;
};

/**
 * Bersihkan metadata dan optimalkan struktur PDF tanpa menyentuh halaman.
 * Hasilnya selalu PDF vektor asli, jadi teks tetap bisa dipilih dan dicari.
 */
export async function optimizePdfStructure(
  buffer: ArrayBuffer,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer);

  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  return pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}

/** Buang karakter yang tidak bisa dikodekan font standar PDF (WinAnsi). */
function sanitizeText(value: string): string {
  return value
    .replace(/[^\x20-\x7E\xA0-\xFF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type PdfTextItem = {
  str?: unknown;
  transform?: unknown;
  hasEOL?: unknown;
};

/**
 * Render setiap halaman menjadi JPEG sesuai kualitas preset, lalu susun ulang
 * menjadi PDF baru. Lapisan teks asli ditambahkan kembali secara tak terlihat
 * agar PDF hasil kompresi masih bisa dicari dan dibaca mesin ATS.
 */
export async function rasterizePdf(
  file: File,
  quality: number,
  onProgress?: (done: number, total: number) => void,
): Promise<Uint8Array> {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  const output = await PDFDocument.create();
  const textFont = await output.embedFont(StandardFonts.Helvetica);

  output.setTitle("");
  output.setAuthor("");
  output.setSubject("");
  output.setKeywords([]);
  output.setProducer("");
  output.setCreator("");

  const total = pdf.numPages;
  const jpegQuality = Math.min(1, Math.max(0.05, quality / 100));

  try {
    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const longestSide = Math.max(baseViewport.width, baseViewport.height);
      const renderScale =
        longestSide > MAX_RENDER_SIDE
          ? Math.max(0.5, MAX_RENDER_SIDE / longestSide)
          : RENDER_SCALE;
      const renderViewport = page.getViewport({ scale: renderScale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(renderViewport.width));
      canvas.height = Math.max(1, Math.ceil(renderViewport.height));

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D tidak tersedia di browser ini.");

      // JPEG tidak mendukung transparansi; latar putih menjaga hasil tetap bersih.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: renderViewport,
        canvas,
      }).promise;

      const jpegBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", jpegQuality);
      });
      if (!jpegBlob) throw new Error("Gagal mengubah halaman menjadi gambar.");

      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const image = await output.embedJpg(jpegBytes);
      const outputPage = output.addPage([
        baseViewport.width,
        baseViewport.height,
      ]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });

      // Lapisan teks tak terlihat: tampilan tetap gambar, tetapi teks tetap ada
      // di content stream sehingga pencarian dan pembacaan ATS tidak hilang.
      try {
        const textContent = await page.getTextContent();
        for (const rawItem of textContent.items) {
          const item = rawItem as PdfTextItem;
          if (typeof item.str !== "string") continue;

          const text =
            sanitizeText(item.str) + (item.hasEOL === true ? " " : "");
          if (!text.trim()) continue;

          const transform = Array.isArray(item.transform)
            ? item.transform.map(Number)
            : null;
          if (!transform || transform.length < 6) continue;

          const [a, b, c, d, e, f] = transform;
          if (![a, b, c, d, e, f].every(Number.isFinite)) continue;

          const size = Math.hypot(a, b) || Math.hypot(c, d) || 10;
          try {
            outputPage.drawText(text, {
              x: e,
              y: f,
              size,
              font: textFont,
              opacity: 0,
            });
          } catch {
            // Karakter di luar WinAnsi dilewati; teks lain tetap tersimpan.
          }
        }
      } catch (error) {
        console.warn("[pdf-compressor] lapisan teks dilewati:", error);
      }

      // Lepaskan memori canvas sebelum halaman berikutnya.
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();

      onProgress?.(pageNumber, total);
    }
  } finally {
    await loadingTask.destroy();
  }

  return output.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
}

/**
 * Pilih hasil terkecil antara optimasi struktur dan render ulang halaman.
 * Dengan begitu preset tidak pernah membuat file justru lebih besar daripada
 * versi vektor aslinya.
 */
export async function compressPdf(
  file: File,
  quality: number,
  onProgress?: (done: number, total: number) => void,
): Promise<CompressionResult> {
  const buffer = await file.arrayBuffer();
  const structureBytes = await optimizePdfStructure(buffer);

  let bestBytes = structureBytes;
  let method: CompressionMethod = "structure";

  try {
    const rasterBytes = await rasterizePdf(file, quality, onProgress);
    if (rasterBytes.byteLength < bestBytes.byteLength) {
      bestBytes = rasterBytes;
      method = "raster";
    }
  } catch (error) {
    console.warn("[pdf-compressor] render ulang dilewati:", error);
  }

  return { bytes: bestBytes, method };
}
