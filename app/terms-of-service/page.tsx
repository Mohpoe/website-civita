"use client";

import { Button } from '@/components/ui/button';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div>
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-foreground/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={ROUTES.ROOT} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-input transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Kembali ke Beranda
          </Link>
          <div className="font-bold tracking-tight text-sm">CIVITA.ID</div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 md:mb-24"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-foreground/5 shadow-sm">
                <FileText className="w-5 h-5 text-zinc-600" />
              </div>
              <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                Legal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
              Syarat & Ketentuan.
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Terakhir Diperbarui: <strong className="text-foreground">Oktober 2026</strong>.
              <br className="hidden md:block" />
              Harap baca dengan saksama sebelum menggunakan layanan pemesanan desain CV, Resume, dan Portfolio kami.
            </p>
          </motion.div>

          {/* Grid Layout: TOC & Main Content */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">

            {/* Sidebar: Table of Contents (Sticky) */}
            <div className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Daftar Isi</h3>
                <nav className="space-y-4">
                  <a href="#layanan-kami" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">1. Layanan Kami</a>
                  <a href="#pemesanan-waktu" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">2. Pemesanan & Waktu</a>
                  <a href="#revisi" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">3. Revisi</a>
                  <a href="#pembayaran-refund" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">4. Pembayaran & Refund</a>
                  <a href="#haki" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">5. Hak Kekayaan Intelektual</a>
                  <a href="#penolakan" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">6. Penolakan Tanggung Jawab</a>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-3/4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-background rounded-[2rem] lg:p-8 lg:border border-foreground/5 lg:shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-12"
              >
                <section id="layanan-kami" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">1. Layanan Kami</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CIVITA menyediakan jasa pembuatan desain Curriculum Vitae (CV), Resume, Cover Letter (Surat Lamaran), dan Portfolio Kerja/Perusahaan. Semua layanan dilakukan secara digital dan hasil akhir akan dikirimkan dalam format file digital (PDF/JPG/PNG sesuai kesepakatan).
                  </p>
                </section>

                <section id="pemesanan-waktu" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">2. Pemesanan dan Waktu Pengerjaan</h2>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li>Pemesanan dianggap sah apabila klien telah melakukan pembayaran sesuai dengan invoice yang diberikan oleh tim CIVITA.</li>
                    <li>Waktu pengerjaan standar mulai dihitung <strong>setelah</strong> pembayaran dikonfirmasi dan <strong>semua data yang dibutuhkan</strong> (informasi diri, pengalaman kerja, foto, dll.) telah dikirimkan secara lengkap oleh klien.</li>
                    <li>Kegagalan klien dalam memberikan data yang lengkap dapat menyebabkan keterlambatan pengerjaan di luar tanggung jawab CIVITA.</li>
                  </ul>
                </section>

                <section id="revisi" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">3. Revisi</h2>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li>CIVITA memberikan layanan revisi (perbaikan minor seperti salah ketik, perubahan warna ringan, atau penyesuaian font) dengan batas maksimal <strong>2 hari (48 jam)</strong> setelah draf pertama dikirimkan kepada klien.</li>
                    <li>Revisi tidak mencakup perombakan total desain (ganti template) atau penambahan data baru dalam jumlah besar yang tidak diinformasikan pada awal pemesanan.</li>
                    <li>Permintaan revisi setelah batas waktu 2 hari atau di luar lingkup perbaikan minor mungkin akan dikenakan biaya tambahan.</li>
                  </ul>
                </section>

                <section id="pembayaran-refund" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">4. Pembayaran dan Pengembalian Dana (Refund)</h2>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li>Pembayaran dilakukan penuh di muka (Full Payment) sebelum proses desain dimulai, kecuali ada kesepakatan tertulis lainnya.</li>
                    <li>Karena sifat layanan kami adalah barang digital dan jasa kustom, <strong>semua pembayaran yang telah masuk tidak dapat dikembalikan (No Refund)</strong>, kecuali terjadi kesalahan fatal dari pihak CIVITA yang menyebabkan layanan tidak dapat diselesaikan sama sekali.</li>
                  </ul>
                </section>

                <section id="haki" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">5. Hak Kekayaan Intelektual</h2>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li>Anda tetap memiliki hak penuh atas semua informasi pribadi dan konten tulisan yang Anda berikan kepada kami.</li>
                    <li>Hak cipta atas <em>layout</em>, template, dan elemen desain grafis tetap menjadi milik CIVITA. Anda diberikan lisensi non-eksklusif untuk menggunakan hasil desain tersebut untuk keperluan pribadi dan profesional (melamar kerja, dll.), namun tidak untuk dijual kembali sebagai <em>template</em>.</li>
                  </ul>
                </section>

                <section id="penolakan" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">6. Penolakan Tanggung Jawab</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CIVITA berupaya sebaik mungkin untuk merancang dokumen yang sesuai dengan standar rekrutmen (termasuk <em>ATS-friendly</em>). Namun, kami <strong>tidak menjamin</strong> bahwa penggunaan layanan kami akan secara pasti membuahkan panggilan wawancara atau penerimaan kerja, karena keputusan rekrutmen mutlak berada di tangan perusahaan yang Anda lamar.
                  </p>
                </section>
              </motion.div>

              {/* Bottom Help Section */}
              <div className="mt-16 pt-12 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-bold tracking-tight mb-2">Punya pertanyaan lain?</h3>
                  <p className="text-sm text-muted-foreground">Tim admin kami siap membantu Anda via WhatsApp atau Email.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <Button variant="outline" className="rounded-full flex-1 md:flex-none" onClick={() => window.location.href = APP_CONFIG.LINKS.EMAIL}>
                    Email Kami
                  </Button>
                  <Button className="rounded-full flex-1 md:flex-none" onClick={() => window.open(APP_CONFIG.LINKS.WHATSAPP, '_blank')}>
                    Hubungi Admin
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>


  );
}