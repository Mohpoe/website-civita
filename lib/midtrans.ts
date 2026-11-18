/**
 * Konfigurasi endpoint Midtrans.
 *
 * Environment dipilih eksplisit lewat MIDTRANS_ENV, bukan ditebak dari prefix
 * key. Prefix tidak bisa diandalkan: ada akun yang key sandbox-nya tetap
 * berawalan "Mid-server-", sehingga tebakan dari prefix bisa mengirim key
 * sandbox ke endpoint production (hasilnya 401).
 *
 * - MIDTRANS_ENV=production  -> endpoint production
 * - MIDTRANS_ENV=sandbox, kosong, atau nilai lain -> endpoint sandbox
 *
 * Default sengaja sandbox supaya environment yang lupa dikonfigurasi tidak
 * pernah membuat transaksi uang nyata.
 *
 * Nilai variabel ini diatur per environment di Vercel, jadi `vercel env pull`
 * membawa nilai yang sesuai untuk Development maupun Production.
 *
 * Modul ini khusus server karena membaca process.env non-publik.
 */
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_ENV === "production";

/** Endpoint Snap API untuk membuat token transaksi. */
export const MIDTRANS_SNAP_API_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

/** Base URL Core API (cancel, status, dan operasi transaksi lain). */
export const MIDTRANS_API_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

/** URL script Snap.js yang dimuat di browser. */
export const MIDTRANS_SNAP_JS_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";
