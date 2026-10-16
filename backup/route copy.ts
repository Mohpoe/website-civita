import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/lib/utils';
// Sesuaikan import ini jika Anda menggunakan driver neon: import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    // 1. Ambil data payload yang dikirim oleh Midtrans
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      gross_amount,
      status_code,
      signature_key
    } = body;

    // 2. Verifikasi Keamanan (Sangat Penting!)
    // Midtrans membuat signature dari kombinasi order_id + status_code + gross_amount + server_key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    // Kita buat ulang hash SHA512 di sisi kita
    const hash = crypto.createHash('sha512');
    hash.update(`${order_id}${status_code}${gross_amount}${serverKey}`);
    const calculatedSignature = hash.digest('hex');

    // Jika signature tidak cocok, tolak request (ini berarti bukan dari Midtrans)
    if (calculatedSignature !== signature_key) {
      console.warn('Webhook: Invalid Signature detected');
      return NextResponse.json({ error: 'Unauthorized/Invalid Signature' }, { status: 403 });
    }

    // 3. Terjemahkan status dari Midtrans ke status database kita
    let orderStatus = 'pending';

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      // Pembayaran sukses dan uang sudah masuk
      orderStatus = 'success';
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire' ||
      transaction_status === 'failure'
    ) {
      // Pembayaran gagal, kadaluarsa, atau dibatalkan
      orderStatus = 'failed';
    }

    // 4. Update status pesanan di Database Neon
    // Gunakan Raw SQL untuk mengupdate tabel orders yang sudah kita buat sebelumnya
    await sql`
      UPDATE orders
      SET status = ${orderStatus}
      WHERE order_id = ${order_id}
    `;

    console.log(`Webhook berhasil diproses: Order ${order_id} berubah menjadi ${orderStatus}`);

    // 5. Kembalikan respons 200 OK agar Midtrans tahu notifikasi sudah kita terima
    return NextResponse.json({ message: 'OK' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Kita harus selalu merespons Midtrans, meskipun ada error internal
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}