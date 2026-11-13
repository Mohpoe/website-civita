import { del, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { PDF_TO_WORD_CONFIG } from "@/lib/pdf-to-word/config";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Menyapu file PDF/DOCX yang tertinggal di private Blob.
 *
 * Vercel Hobby hanya mengizinkan cron sekali sehari, jadi file hasil bisa
 * bertahan paling lama sekitar 24 jam kalau tidak diunduh. File input sudah
 * dihapus segera setelah dikirim ke Adobe.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "PRIVATE_BLOB_READ_WRITE_TOKEN belum diisi." },
      { status: 500 },
    );
  }

  const cutoff = Date.now() - PDF_TO_WORD_CONFIG.outputTtlMs;
  const expired: string[] = [];

  let cursor: string | undefined;
  let scannedPages = 0;

  try {
    do {
      const page = await list({
        prefix: `${PDF_TO_WORD_CONFIG.blobPrefix}/`,
        cursor,
        limit: 1000,
        token,
      });

      for (const blob of page.blobs) {
        if (blob.uploadedAt.getTime() < cutoff) {
          expired.push(blob.url);
        }
      }

      cursor = page.cursor;
      scannedPages += 1;
    } while (cursor && scannedPages < 10);

    if (expired.length > 0) {
      await del(expired, { token });
    }

    return NextResponse.json({
      deleted: expired.length,
      scannedPages,
    });
  } catch (error) {
    console.error("[pdf-to-word] cleanup gagal:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Cleanup gagal." },
      { status: 500 },
    );
  }
}
