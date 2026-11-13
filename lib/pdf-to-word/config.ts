/**
 * Batas dan kuota tool PDF ke Word.
 *
 * Nilai ini sengaja dikumpulkan di satu tempat supaya mudah disesuaikan tanpa
 * menyentuh route atau komponen UI.
 */
export const PDF_TO_WORD_CONFIG = {
  /** Ukuran maksimal satu file PDF. */
  maxFileBytes: 10 * 1024 * 1024,
  maxFileMb: 10,
  /** Jumlah halaman maksimal yang boleh dikonversi. */
  maxPages: 20,
  /** Prefix semua blob milik tool ini. */
  blobPrefix: "pdf-to-word",
  /** Umur file hasil di Blob sebelum disapu cron (selaras dengan TTL job). */
  outputTtlMs: 2 * 60 * 60 * 1000,
  /** Umur record job di Redis. */
  jobTtlSeconds: 60 * 60 * 2,
  /** Umur tiket upload sebelum kedaluwarsa. */
  ticketTtlSeconds: 15 * 60,
  /** Interval polling status di client. */
  pollIntervalMs: 2000,
  /** Batas waktu keseluruhan satu job sebelum dianggap gagal. */
  jobTimeoutMs: 3 * 60 * 1000,
  /** Batas waktu submit ke Adobe di dalam after(). */
  submitTimeoutMs: 25 * 1000,
} as const;

/**
 * Kuota konversi per identitas.
 *
 * Tamu dibatasi per hari sekaligus per bulan agar satu orang tidak bisa
 * memakai kuota sebulan dalam satu hari. Pembeli mendapat kuota paling besar.
 */
export const PDF_TO_WORD_QUOTA = {
  guestDaily: 1,
  guestMonthly: 2,
  /** Batas upload per IP per hari, terpisah dari kuota konversi. */
  guestIpDailyUploads: 10,
  /** Batas konversi tamu per IP, mencegah kuota diakali dengan hapus cookie. */
  guestIpDailyConversions: 3,
  guestIpMonthlyConversions: 8,
  /** Pengaman agar pemakaian Adobe tidak melewati kuota 500 transaksi/bulan. */
  globalMonthlyCap: 450,
  userMonthly: 5,
  buyerMonthly: 30,
} as const;

export const PDF_TO_WORD_GUEST_COOKIE = "civita_p2w_guest";

/** Nama file Word hasil konversi. */
export function buildOutputFileName(originalName: string): string {
  const base = originalName
    .replace(/\.pdf$/i, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return `${base || "dokumen"}.docx`;
}
