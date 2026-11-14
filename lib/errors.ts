/**
 * Ambil pesan error dari nilai apa pun yang dilempar.
 *
 * Banyak jalur di aplikasi ini melempar objek dari Neon/Clerk yang bukan
 * instance `Error`, jadi `error.message` tetap perlu dibaca dengan aman.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan.",
): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}

/** Ambil kode error PostgreSQL/Neon (mis. `23505` untuk unique violation). */
export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }

  return undefined;
}
