import { PDFDocument } from "@cantoo/pdf-lib";

/**
 * Dilempar saat PDF memerlukan password untuk dibuka.
 *
 * PDF dengan password pemilik saja (password buka kosong) tetap bisa diproses;
 * yang ditolak hanya PDF yang benar-benar meminta password saat dibuka.
 */
export class PdfPasswordRequiredError extends Error {
  constructor() {
    super("PDF dilindungi password.");
    this.name = "PdfPasswordRequiredError";
  }
}

export type PreparedPdf = {
  /** Buffer siap kirim ke Adobe, sudah bebas enkripsi bila perlu. */
  buffer: Buffer;
  /** Jumlah halaman. */
  pages: number;
  /** True bila PDF asli terenkripsi dan sudah dibuatkan salinan bersih. */
  decrypted: boolean;
};

function isEncryptedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const name = (error as { name?: unknown }).name;
  const message = (error as { message?: unknown }).message;

  return (
    name === "EncryptedPDFError" ||
    (typeof message === "string" && message.includes("is encrypted"))
  );
}

function needsPasswordError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message.includes("NEEDS PASSWORD");
}

/**
 * Siapkan PDF agar bisa diproses Adobe Export PDF.
 *
 * Banyak generator CV menyimpan PDF dengan password buka kosong tetapi
 * mematikan izin salin/edit. Adobe menolak PDF dengan permission apa pun
 * bernilai false (400 DOCUMENT_RESTRICTED), jadi PDF seperti itu didekripsi
 * lebih dulu lalu disusun ulang menjadi dokumen baru tanpa dictionary
 * `/Encrypt`.
 *
 * `pdf-lib` biasa tidak bisa mendekripsi. `@cantoo/pdf-lib` adalah fork yang
 * mendukungnya dan tetap memakai API yang sama.
 */
export async function preparePdf(buffer: Buffer): Promise<PreparedPdf> {
  let document: PDFDocument;

  try {
    // PDF tanpa enkripsi: langsung dipakai, tidak ada yang diubah.
    document = await PDFDocument.load(buffer);
    return { buffer, pages: document.getPageCount(), decrypted: false };
  } catch (error) {
    if (!isEncryptedError(error)) throw error;

    try {
      // Password buka kosong berlaku untuk PDF yang hanya diproteksi
      // password pemilik (permission restrictions).
      document = await PDFDocument.load(buffer, { password: "" });
    } catch (passwordError) {
      if (needsPasswordError(passwordError)) {
        throw new PdfPasswordRequiredError();
      }
      throw passwordError;
    }
  }

  // Susun ulang ke dokumen baru supaya tidak ada sisa dictionary /Encrypt
  // atau referensi enkripsi dari file asli.
  const clean = await PDFDocument.create();
  const pages = await clean.copyPages(document, document.getPageIndices());
  for (const page of pages) clean.addPage(page);

  const bytes = await clean.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return {
    buffer: Buffer.from(bytes),
    pages: clean.getPageCount(),
    decrypted: true,
  };
}
