import { applyOrderStatus, fetchMidtransStatus } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/order-status";
import { sql } from "@/lib/utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Endpoint ini punya dua tugas:
 *
 * 1. **Menyelamatkan pembayaran yang notifikasinya terlewat.** Order yang sudah
 *    dibayar tapi masih `pending` di database diubah menjadi `success` (email
 *    bukti ikut terkirim), sehingga user bisa langsung mengunduh.
 * 2. **Menutup order yang ditinggalkan.** Kalau user hanya membuka popup lalu
 *    menutupnya sebelum memilih metode bayar, transaksi tidak pernah terbentuk
 *    dan Midtrans tidak mengirim notifikasi apa pun.
 *
 * Dijalankan oleh dua penjadwal:
 *
 * - Cron Vercel harian (`vercel.json`) sebagai jaring pengaman.
 * - Cron eksternal (mis. cron-job.org) setiap 15 menit, supaya pembayaran yang
 *   notifikasinya gagal tertolong dalam hitungan menit, bukan menunggu sehari.
 *   Kirim header `Authorization: Bearer <CRON_SECRET>`.
 */

/**
 * Order yang lebih muda dari ini tidak diperiksa. Memberi waktu user
 * menyelesaikan popup sebelum statusnya disentuh.
 */
const MIN_PENDING_AGE_MINUTES = 5;

/**
 * Order `pending` yang transaksinya tidak pernah terbentuk di Midtrans baru
 * dianggap ditinggalkan setelah selama ini.
 *
 * Jangan dibuat terlalu pendek: user bisa saja masih membuka popup dan memilih
 * metode bayar, dan transaksi baru terbentuk pada saat itu. Kalau order lokal
 * sudah ditutup sementara user membayar lewat popup lama, webhook tetap
 * menyelamatkannya, tapi user berisiko membayar dua kali bila ia juga sudah
 * membuat order baru.
 */
const ABANDONED_PENDING_MINUTES = 120;

/** Dibagi per batch supaya satu kali jalan tidak menabrak batas waktu. */
const MAX_ORDERS_PER_RUN = 25;

interface OrderRow {
  order_id: string;
  /** Umur order dalam menit, dihitung di database agar tidak tergantung zona waktu. */
  age_minutes: number | string;
}

/**
 * Sapu order `pending`.
 *
 * Status akhir ditentukan dari Midtrans lebih dulu, jadi order yang ternyata
 * sudah dibayar tetap diselamatkan menjadi `success`. Transaksi yang masih
 * hidup (`pending`/`challenge`) dibiarkan mengikuti masa berlaku dan notifikasi
 * Midtrans; hanya transaksi yang sudah final atau tidak pernah terbentuk yang
 * diubah di sini.
 *
 * PENTING: jangan memanggil endpoint ini dari localhost selama Development dan
 * Production masih memakai database Neon yang sama. Order production akan
 * diperiksa dengan key sandbox sehingga hasilnya tidak bisa dipercaya (401
 * dilewati, tapi order yang berasal dari sandbox tetap bisa ikut berubah).
 * Pisahkan branch database dulu, atau panggil hanya di production.
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

  if (!process.env.MIDTRANS_SERVER_KEY) {
    return NextResponse.json(
      { error: "MIDTRANS_SERVER_KEY belum diisi." },
      { status: 500 },
    );
  }

  const cutoff = new Date(Date.now() - MIN_PENDING_AGE_MINUTES * 60 * 1000);

  try {
    const rows = (await sql`
      SELECT
        order_id,
        EXTRACT(EPOCH FROM (now() - created_at)) / 60 AS age_minutes
      FROM orders
      WHERE status = 'pending' AND created_at < ${cutoff}
      ORDER BY created_at ASC
      LIMIT ${MAX_ORDERS_PER_RUN}
    `) as OrderRow[];

    const summary = {
      scanned: rows.length,
      updated: 0,
      success: 0,
      expired: 0,
      skipped: 0,
    };

    for (const row of rows) {
      const midtrans = await fetchMidtransStatus(row.order_id);

      let nextStatus: OrderStatus | null = null;

      if (midtrans.found) {
        if (midtrans.status === "challenge") {
          // Masih menunggu keputusan bank; biarkan webhook yang menentukan.
          summary.skipped += 1;
          continue;
        }

        if (midtrans.status === "pending") {
          // Transaksi masih hidup di Midtrans. Masa berlakunya diatur Midtrans
          // dan notifikasi `expire` akan datang sendiri. Jangan ditutup di sini
          // supaya order yang baru saja dipakai ulang tidak ikut kedaluwarsa.
          summary.skipped += 1;
          continue;
        }

        nextStatus = midtrans.status;
      } else if (midtrans.reason === "not-found") {
        // Transaksi tidak pernah terbentuk di Midtrans. Tunggu sampai order
        // cukup tua sebelum ditutup, karena user mungkin masih di popup.
        const ageMinutes = Number(row.age_minutes);

        if (Number.isFinite(ageMinutes) && ageMinutes < ABANDONED_PENDING_MINUTES) {
          summary.skipped += 1;
          continue;
        }

        nextStatus = "expired";
      } else {
        // Status tidak bisa dipastikan (jaringan/autentikasi); coba lagi nanti.
        summary.skipped += 1;
        continue;
      }

      const result = await applyOrderStatus(row.order_id, nextStatus);
      if (!result.found || !result.changed) {
        summary.skipped += 1;
        continue;
      }

      summary.updated += 1;
      if (nextStatus === "success") summary.success += 1;
      if (nextStatus === "expired") summary.expired += 1;
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[order-cleanup] gagal:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Cleanup gagal." },
      { status: 500 },
    );
  }
}
