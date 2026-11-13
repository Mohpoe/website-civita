"use client";

import { PublicFooter } from "@/components/public-footer";
import { PublicNavigation } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/lib/constants";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="font-mono text-foreground antialiased min-h-screen bg-background">
      <style dangerouslySetInnerHTML={{
        __html: `
        :root { --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        body { font-family: var(--font-mono); }
        `
      }} />
      <PublicNavigation />

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
                <Shield className="w-5 h-5 text-zinc-600" />
              </div>
              <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                Keamanan & Privasi
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6">
              Kebijakan Privasi.
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Terakhir Diperbarui: <strong className="text-foreground">Oktober 2026</strong>.
              <br className="hidden md:block" />
              Kami menghargai privasi Anda. Pelajari bagaimana kami melindungi data dan informasi karir Anda.
            </p>
          </motion.div>

          {/* Grid Layout: TOC & Main Content */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">

            {/* Sidebar: Table of Contents (Sticky) */}
            <div className="lg:w-1/4 hidden lg:block">
              <div className="sticky top-32">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Daftar Isi</h3>
                <nav className="space-y-4">
                  <a href="#informasi-dikumpulkan" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">1. Informasi yang Dikumpulkan</a>
                  <a href="#penggunaan-informasi" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">2. Penggunaan Informasi</a>
                  <a href="#perlindungan-data" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">3. Perlindungan & Berbagi Data</a>
                  <a href="#alat-pdf" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">4. Alat PDF & Pihak Ketiga</a>
                  <a href="#penggunaan-portofolio" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">5. Penggunaan Portofolio</a>
                  <a href="#penghapusan-data" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">6. Penghapusan Data</a>
                  <a href="#persetujuan" className="block text-sm text-zinc-500 hover:text-foreground transition-colors">7. Persetujuan</a>
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
                <section id="informasi-dikumpulkan" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">1. Informasi yang Kami Kumpulkan</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">Untuk dapat memberikan layanan terbaik, kami mengumpulkan beberapa informasi pribadi Anda, termasuk namun tidak terbatas pada:</p>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li><strong>Informasi Kontak Dasar:</strong> Nama, alamat email, dan nomor telepon/WhatsApp.</li>
                    <li><strong>Informasi Karir (Untuk Keperluan Dokumen):</strong> Riwayat pendidikan, pengalaman kerja, keahlian (skills), pencapaian, portofolio, alamat domisili, pas foto, dan informasi relevan lainnya yang Anda berikan untuk dimasukkan ke dalam CV atau Surat Lamaran Anda.</li>
                    <li><strong>Informasi Pembayaran:</strong> Bukti transfer atau detail transaksi. (Catatan: Kami tidak menyimpan rincian kartu kredit/debit secara langsung).</li>
                  </ul>
                </section>

                <section id="penggunaan-informasi" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">Data yang kami kumpulkan semata-mata digunakan untuk:</p>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li>Merancang, menyusun, dan menyelesaikan pesanan dokumen CV, Resume, atau Cover Letter Anda.</li>
                    <li>Menghubungi Anda terkait proses pengerjaan, konfirmasi data, pengiriman hasil, dan revisi (umumnya melalui WhatsApp atau Email).</li>
                    <li>Menyimpan riwayat pesanan (order history) untuk memudahkan Anda jika ingin mengedit atau memperbarui CV di masa mendatang (jika Anda memiliki akun member di platform kami).</li>
                  </ul>
                </section>

                <section id="perlindungan-data" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">3. Perlindungan dan Berbagi Data</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Kami berjanji menjaga kerahasiaan Anda. <strong>Kami tidak akan pernah menjual, menyewakan, atau mendistribusikan data pribadi Anda, termasuk isi CV Anda, kepada pihak ketiga atau perusahaan mana pun.</strong> Data Anda hanya diakses oleh tim desain internal CIVITA yang bertugas mengerjakan dokumen Anda, kecuali untuk alat PDF yang secara teknis memerlukan penyedia layanan pemrosesan dokumen seperti dijelaskan pada poin 4.
                  </p>
                </section>

                <section id="alat-pdf" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">4. Alat PDF dan Pemrosesan oleh Pihak Ketiga</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Beberapa alat PDF di CIVITA, termasuk <strong>PDF to Word</strong>, memerlukan pemrosesan di server dan menggunakan penyedia layanan dokumen pihak ketiga, yaitu <strong>Adobe PDF Services</strong>. File yang Anda unggah dikirim ke Adobe hanya untuk melakukan konversi yang Anda minta.
                  </p>
                  <ul className="list-disc pl-5 space-y-3 text-muted-foreground leading-relaxed marker:text-zinc-300">
                    <li>File input disimpan sementara di penyimpanan privat CIVITA dan dihapus segera setelah dikirim ke Adobe.</li>
                    <li>File hasil konversi disimpan sementara dan dihapus otomatis maksimal 24 jam setelah dibuat.</li>
                    <li>Kami tidak menggunakan isi dokumen Anda untuk pelatihan model, pemasaran, atau tujuan lain.</li>
                    <li>Kami membatasi jumlah konversi per pengguna untuk mencegah penyalahgunaan layanan.</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    Karena file diproses oleh pihak ketiga, kami menyarankan Anda tidak mengunggah dokumen yang bersifat sangat rahasia (misalnya data keuangan, dokumen medis, atau dokumen berisi data pribadi orang lain tanpa izin).
                  </p>
                </section>

                <section id="penggunaan-portofolio" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">5. Penggunaan Hasil Desain sebagai Portofolio</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Terkadang kami ingin menampilkan hasil desain yang kami buat di media sosial (Instagram) atau website kami sebagai contoh portofolio. Jika kami melakukannya, kami akan <strong>selalu</strong> menyensor, memburamkan (blur), atau menggunakan nama samaran (dummy text) pada informasi sensitif seperti nomor telepon, email, alamat lengkap, dan nama perusahaan spesifik, kecuali kami telah meminta dan mendapatkan izin langsung dari Anda.
                  </p>
                </section>

                <section id="penghapusan-data" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">6. Penghapusan Data</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Anda memiliki hak untuk meminta kami menghapus seluruh informasi karir dan file CV Anda dari <em>database</em> kami setelah pesanan selesai. Silakan hubungi admin kami melalui WhatsApp atau Email untuk mengajukan penghapusan data, dan kami akan segera melakukannya.
                  </p>
                </section>

                <section id="persetujuan" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight">7. Persetujuan</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Dengan menggunakan layanan CIVITA, Anda secara otomatis menyetujui Kebijakan Privasi ini beserta syarat pengumpulan dan penggunaan data seperti yang telah diuraikan di atas.
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
      <PublicFooter />
    </div>
  );
}