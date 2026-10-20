"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";

export default function DashboardHelp() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
            <HelpCircle className="w-4 h-4" /> Panduan Pengguna
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Cara Membeli Produk Digital di CIVITA</h1>
          <p className="text-muted-foreground">
            Panduan lengkap untuk pemula dalam memilih, membeli, dan mengunduh produk digital dari CIVITA.id.
          </p>
        </div>
        <Card className="p-4">
          <CardContent className="p-0">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Butuh bantuan?</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Langkah-langkah */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            num: "01",
            title: "Jelajahi Katalog Produk",
            icon: <ShoppingBag className="w-5 h-5" />,
            steps: [
              "Buka halaman <strong>Daftar Produk</strong> dari menu sidebar.",
              "Gunakan pencarian atau filter kategori untuk menemukan produk yang ingin dibeli.",
              "Klik produk untuk melihat detail, harga, dan fitur yang didapatkan.",
            ],
          },
          {
            num: "02",
            title: "Mulai Pembelian",
            icon: <CreditCard className="w-5 h-5" />,
            steps: [
              "Klik tombol <strong>Beli Sekarang</strong> di halaman detail produk.",
              "Anda akan diarahkan ke halaman <strong>Pesanan Saya</strong> untuk melengkapi pembayaran.",
              "Pilih metode pembayaran yang tersedia (transfer bank, e-wallet, dll).",
            ],
          },
          {
            num: "03",
            title: "Selesaikan Pembayaran",
            icon: <CheckCircle2 className="w-5 h-5" />,
            steps: [
              "Ikuti instruksi pembayaran yang muncul di layar.",
              "Setelah pembayaran berhasil, status pesanan akan berubah menjadi <strong>Sukses</strong>.",
              "Produk siap diunduh melalui tautan yang tersedia.",
            ],
          },
          {
            num: "04",
            title: "Unduh File Produk",
            icon: <Download className="w-5 h-5" />,
            steps: [
              "Masuk ke halaman <strong>Pesanan Saya</strong> dari menu sidebar.",
              "Cari pesanan dengan status <strong>Sukses</strong>.",
              "Klik tombol <strong>Unduh File</strong> untuk mendapatkan produk digital Anda.",
            ],
          },
          {
            num: "05",
            title: "Pesanan Gagal atau Kedaluwarsa",
            icon: <Clock className="w-5 h-5" />,
            steps: [
              "Jika pembayaran tidak berhasil atau pesanan kadaluwarsa, status akan menjadi <strong>Gagal</strong> atau <strong>Kedaluwarsa</strong>.",
              "Anda dapat klik tombol <strong>Beli Lagi</strong> untuk membuat pesanan baru untuk produk yang sama.",
              "Pastikan membayar sebelum waktu kadaluwarsa habis.",
            ],
          },
          {
            num: "06",
            title: "Kontak & Dukungan",
            icon: <User className="w-5 h-5" />,
            steps: [
              "Jika mengalami kendala teknis atau pertanyaan seputar produk, Anda dapat menghubungi admin melalui WhatsApp.",
              "Klik tombol <strong>Konsultasi</strong> di halaman utama atau footer situs.",
              "Sertakan ID pesanan dan deskripsi masalah agar admin dapat membantu lebih cepat.",
            ],
          },
        ].map((step, idx) => (
          <Card key={step.num} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                </div>
              </div>
              {step.icon}
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {step.steps.map((s, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-3 h-3 text-primary mt-1 shrink-0" />
                  <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: s }} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Tips Penting */}
      <section className="bg-muted/50 rounded-xl border border-muted p-6">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Tips Penting Sebelum Membeli</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Pastikan email yang terdaftar di akun Anda benar dan aktif, karena bukti pembelian dan notifikasi akan dikirim ke email tersebut. Simpan juga ID pesanan untuk referensi di masa mendatang.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Ringkas */}
      <section>
        <h2 className="text-xl font-bold mb-6">Pertanyaan Umum</h2>
        <div className="space-y-4">
          {[
            {
              q: "Apakah saya bisa membeli satu produk lebih dari sekali?",
              a: "Tidak. Setiap produk hanya dapat dibeli satu kali per akun. Jika produk sudah pernah dibeli dengan status sukses, tombol pembelian akan menampilkan pemberitahuan dan mengarahkan Anda ke halaman Pesanan Saya untuk mengunduh kembali.",
            },
            {
              q: "Apakah file produk dapat diunduh kapan saja?",
              a: "Ya, selama pesanan Anda memiliki status sukses, file produk dapat diunduh kapan saja melalui halaman Pesanan Saya. Tidak ada batasan waktu untuk mengunduh setelah pembayaran berhasil.",
            },
            {
              q: "Apa yang terjadi jika produk yang saya beli dihapus admin?",
              a: "Jika produk dihapus admin karena sudah memiliki transaksi, data produk akan dipindahkan ke arsip. Judul dan file download tetap tersedia di riwayat pesanan Anda dengan label \"Edisi Terbatas\", dan Anda masih dapat mengunduh file-nya.",
            },
            {
              q: "Saya sudah bayar tapi pesanan masih pending, apa yang harus dilakukan?",
              a: "Tunggu beberapa menit hingga sistem memproses notifikasi pembayaran dari Midtrans. Jika setelah 1 jam status masih pending, silakan kontak admin melalui WhatsApp dan sertakan bukti transfer maupun ID pesanan.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-primary font-bold text-sm shrink-0">Q{idx + 1}</span>
                <span className="font-medium">{faq.q}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
