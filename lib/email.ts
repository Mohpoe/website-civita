// lib/email.ts
import { Resend } from 'resend';
import { APP_CONFIG } from './constants';

// Inisialisasi client Resend menggunakan API key dari .env
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendOrderEmailParams {
  userEmail: string;
  userName: string;
  orderId: string;
  productName: string;
}

export async function sendOrderSuccessEmail({
  userEmail,
  userName,
  orderId,
  productName,
}: SendOrderEmailParams) {
  // URL ini mengarah ke endpoint download yang sudah Anda buat.
  // Sesuaikan domain dasar ('https://civita.id') jika sedang testing di localhost ('http://localhost:3000')
  const appUrl = APP_CONFIG.LINKS.HOMEPAGE || 'https://www.civita.id';
  const downloadLink = `${appUrl}/api/download?orderId=${orderId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `Civita <${APP_CONFIG.EMAIL}>`,
      to: [userEmail],
      subject: `[Civita] Pesanan Berhasil: ${productName}`,
      // Di bawah ini adalah HTML murni. Anda juga bisa menggunakan pustaka 'react-email' jika ingin desain yang lebih kompleks.
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 24px; text-align: center;">
             <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Pembayaran Berhasil!</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #334155; margin-bottom: 16px;">Halo <strong>${userName}</strong>,</p>
            <p style="font-size: 16px; color: #334155; line-height: 1.5; margin-bottom: 24px;">
              Terima kasih atas pembelian Anda! Transaksi Anda untuk <strong>${productName}</strong> (Order ID: ${orderId}) telah berhasil diproses.
            </p>

            <p style="font-size: 16px; color: #334155; margin-bottom: 24px;">
              Anda sudah bisa mengunduh file produk digital Anda dengan mengklik tombol di bawah ini:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${downloadLink}" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                Download ${productName}
              </a>
            </div>

            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-top: 32px; border-top: 1px solid #eaeaec; padding-top: 16px;">
              Jika tombol di atas tidak berfungsi, Anda juga bisa menyalin dan menempelkan tautan berikut ke peramban (browser) Anda:<br>
              <span style="color: #3b82f6; word-break: break-all;">${downloadLink}</span>
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; color: #64748b; font-size: 14px;">
             &copy; ${new Date().getFullYear()} Civita.id - Semua Hak Dilindungi.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    console.log(`✉️ Email terkirim ke ${userEmail} untuk pesanan ${orderId}`);
    return { success: true, data };
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return { success: false, error };
  }
}