import { PublicPageShell } from "@/components/public-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FileText, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

const TOC = [
  { id: "layanan-kami", label: "1. Layanan Kami" },
  { id: "akun", label: "2. Akun Pengguna" },
  { id: "pemesanan-waktu", label: "3. Pemesanan & Waktu" },
  { id: "pembayaran", label: "4. Pembayaran" },
  { id: "revisi-refund", label: "5. Revisi & Pengembalian Dana" },
  { id: "produk-digital", label: "6. Produk Digital & Lisensi" },
  { id: "haki", label: "7. Hak Kekayaan Intelektual" },
  { id: "larangan", label: "8. Penggunaan yang Dilarang" },
  { id: "penolakan", label: "9. Penolakan Tanggung Jawab" },
  { id: "perubahan", label: "10. Perubahan Ketentuan" },
  { id: "hukum", label: "11. Hukum yang Berlaku" },
  { id: "kontak", label: "12. Kontak" },
] as const;

const sectionTitle = "text-xl font-bold tracking-tight md:text-2xl";
const paragraph = "text-sm leading-relaxed text-ink-soft md:text-base";
const list = "list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft marker:text-ink/30 md:text-base";

export default function TermsOfServicePage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <header className="max-w-3xl space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-ink">
              <FileText className="size-4" />
              Legal
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Syarat & Ketentuan
            </h1>
            <p className="text-sm leading-relaxed text-ink-soft md:text-base">
              Terakhir diperbarui: <strong className="text-ink">November 2026</strong>.
              Ketentuan ini berlaku saat kamu memesan jasa atau membeli produk
              digital di {APP_CONFIG.NAME}.
            </p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <nav
                aria-label="Daftar isi syarat dan ketentuan"
                className="nb-sm sticky top-28 rounded-lg bg-paper p-4"
              >
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">
                  Daftar Isi
                </p>
                <ul className="space-y-2">
                  {TOC.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-xs leading-snug text-ink-soft transition-colors hover:text-ink"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <article className="nb space-y-10 rounded-lg bg-paper p-6 md:p-8">
              <section id="layanan-kami" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>1. Layanan Kami</h2>
                <p className={paragraph}>
                  {APP_CONFIG.NAME} menyediakan dua jenis layanan:
                </p>
                <ul className={list}>
                  <li>
                    <strong className="text-ink">Jasa kustom:</strong> pembuatan
                    CV, resume, surat lamaran, cover letter, dan dokumen lamaran
                    lain yang dikerjakan berdasarkan data yang kamu berikan.
                  </li>
                  <li>
                    <strong className="text-ink">Produk digital:</strong> template
                    siap pakai yang bisa kamu unduh dan edit sendiri.
                  </li>
                  <li>
                    <strong className="text-ink">Alat PDF gratis:</strong> alat
                    bantu untuk menggabung, memisah, mengompres, atau mengonversi
                    berkas. Alat ini disediakan sebagaimana adanya.
                  </li>
                </ul>
              </section>

              <section id="akun" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>2. Akun Pengguna</h2>
                <ul className={list}>
                  <li>
                    Untuk memesan jasa atau membeli produk, kamu perlu masuk
                    menggunakan akun Clerk. Kamu bertanggung jawab menjaga akses
                    ke akunmu.
                  </li>
                  <li>
                    Data akun harus benar dan aktif karena kami memakainya untuk
                    mengirim konfirmasi pesanan dan hasil pekerjaan.
                  </li>
                  <li>
                    Satu akun tidak boleh digunakan untuk menyalahgunakan layanan,
                    termasuk mengakses berkas milik pengguna lain.
                  </li>
                </ul>
              </section>

              <section id="pemesanan-waktu" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>3. Pemesanan dan Waktu Pengerjaan</h2>
                <ul className={list}>
                  <li>
                    Pesanan jasa dianggap sah setelah pembayaran dikonfirmasi dan
                    data yang dibutuhkan sudah lengkap.
                  </li>
                  <li>
                    Waktu pengerjaan dihitung sejak pembayaran dan data lengkap
                    diterima, bukan sejak formulir pertama kali dibuka.
                  </li>
                  <li>
                    Keterlambatan karena data yang tidak lengkap atau tidak akurat
                    bukan tanggung jawab {APP_CONFIG.NAME}.
                  </li>
                  <li>
                    Estimasi waktu yang ditampilkan di situs bersifat perkiraan
                    dan dapat berubah pada periode sibuk.
                  </li>
                </ul>
              </section>

              <section id="pembayaran" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>4. Pembayaran</h2>
                <ul className={list}>
                  <li>
                    Pembayaran diproses melalui Midtrans. Metode yang tersedia
                    mengikuti pilihan di jendela pembayaran.
                  </li>
                  <li>
                    Pesanan jasa dibayar penuh di muka sebelum pengerjaan dimulai,
                    kecuali ada kesepakatan tertulis lain.
                  </li>
                  <li>
                    Harga yang tertera adalah harga dalam Rupiah dan dapat berubah
                    untuk pesanan baru. Perubahan harga tidak berlaku surut pada
                    pesanan yang sudah dibayar.
                  </li>
                  <li>
                    Kamu bertanggung jawab atas biaya tambahan dari penyedia
                    pembayaran, misalnya biaya transfer antarbank.
                  </li>
                </ul>
              </section>

              <section id="revisi-refund" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>5. Revisi dan Pengembalian Dana</h2>
                <ul className={list}>
                  <li>
                    Revisi minor seperti salah ketik, penyesuaian warna ringan,
                    atau perubahan font tersedia maksimal{" "}
                    <strong className="text-ink">2 hari (48 jam)</strong> setelah
                    draf pertama dikirim.
                  </li>
                  <li>
                    Revisi tidak mencakup perombakan total desain atau penambahan
                    data dalam jumlah besar yang tidak disampaikan di awal.
                  </li>
                  <li>
                    Karena produk digital dan jasa kustom bersifat personal,
                    pembayaran yang sudah masuk umumnya{" "}
                    <strong className="text-ink">tidak dapat dikembalikan</strong>.
                  </li>
                  <li>
                    Pengembalian dana dapat dipertimbangkan jika terjadi kesalahan
                    fatal dari pihak kami yang membuat pesanan tidak dapat
                    diselesaikan sama sekali.
                  </li>
                  <li>
                    Pesanan yang belum dibayar dapat dibatalkan otomatis oleh
                    sistem setelah batas waktu pembayaran.
                  </li>
                </ul>
              </section>

              <section id="produk-digital" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>6. Produk Digital dan Lisensi</h2>
                <ul className={list}>
                  <li>
                    Produk digital diberikan dengan lisensi{" "}
                    <strong className="text-ink">non-eksklusif</strong> untuk
                    keperluan pribadi dan profesionalmu.
                  </li>
                  <li>
                    Kamu boleh mengedit isi template, tetapi tidak boleh menjual
                    ulang, membagikan ulang, atau mengklaim template sebagai
                    karyamu sendiri.
                  </li>
                  <li>
                    Tautan unduhan tersedia di halaman Pesanan Saya selama akun
                    aktif. Simpan salinan berkasmu setelah mengunduh.
                  </li>
                  <li>
                    Produk yang sudah dihapus dari katalog tetap bisa diunduh
                    dari riwayat pesanan dan ditandai sebagai edisi terbatas.
                  </li>
                </ul>
              </section>

              <section id="haki" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>7. Hak Kekayaan Intelektual</h2>
                <ul className={list}>
                  <li>
                    Kamu tetap memiliki hak atas seluruh informasi dan tulisan
                    yang kamu berikan.
                  </li>
                  <li>
                    Hak cipta atas tata letak, template, dan elemen desain tetap
                    milik {APP_CONFIG.NAME}. Kamu mendapat izin memakai hasilnya
                    untuk keperluan pribadi dan profesional.
                  </li>
                  <li>
                    Kamu tidak boleh menjual kembali hasil desain sebagai template
                    atau mengklaimnya sebagai produk milikmu.
                  </li>
                </ul>
              </section>

              <section id="larangan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>8. Penggunaan yang Dilarang</h2>
                <ul className={list}>
                  <li>
                    Mengirim data atau berkas milik orang lain tanpa izin.
                  </li>
                  <li>
                    Memakai layanan untuk membuat dokumen palsu, memalsukan
                    identitas, atau menyesatkan pihak lain.
                  </li>
                  <li>
                    Mencoba mengakses data, akun, atau sistem yang bukan hakmu.
                  </li>
                  <li>
                    Menyalin, menjual, atau menyebarkan ulang produk dan hasil
                    jasa tanpa izin tertulis.
                  </li>
                </ul>
                <p className={paragraph}>
                  Pelanggaran dapat menyebabkan pesanan dibatalkan, akun dibatasi,
                  atau tindakan lain sesuai hukum yang berlaku.
                </p>
              </section>

              <section id="penolakan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>9. Penolakan Tanggung Jawab</h2>
                <p className={paragraph}>
                  Kami berupaya membuat dokumen yang rapi dan sesuai standar
                  rekrutmen, termasuk ramah sistem ATS. Namun kami tidak menjamin
                  bahwa kamu akan mendapat panggilan wawancara atau diterima
                  kerja, karena keputusan akhir berada di tangan perusahaan yang
                  kamu lamar.
                </p>
                <p className={paragraph}>
                  Alat PDF disediakan gratis dan dipakai atas risikomu sendiri.
                  Selalu simpan salinan berkas asli sebelum memproses.
                </p>
              </section>

              <section id="perubahan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>10. Perubahan Ketentuan</h2>
                <p className={paragraph}>
                  Ketentuan ini dapat diperbarui sewaktu-waktu. Versi terbaru
                  selalu tersedia di halaman ini dengan tanggal pembaruan di
                  bagian atas. Pesanan yang sudah dibayar tetap mengikuti
                  ketentuan yang berlaku saat pembayaran dilakukan.
                </p>
              </section>

              <section id="hukum" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>11. Hukum yang Berlaku</h2>
                <p className={paragraph}>
                  Ketentuan ini tunduk pada hukum yang berlaku di Indonesia.
                  Sengketa diupayakan diselesaikan secara musyawarah terlebih
                  dahulu melalui kontak resmi kami.
                </p>
              </section>

              <section id="kontak" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>12. Kontak</h2>
                <ul className={list}>
                  <li>
                    Email:{" "}
                    <a
                      href={APP_CONFIG.LINKS.EMAIL}
                      className="font-semibold text-ink underline decoration-2 underline-offset-4"
                    >
                      {APP_CONFIG.EMAIL}
                    </a>
                  </li>
                  <li>
                    WhatsApp:{" "}
                    <a
                      href={APP_CONFIG.LINKS.WHATSAPP}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-ink underline decoration-2 underline-offset-4"
                    >
                      +{APP_CONFIG.WHATSAPP}
                    </a>
                  </li>
                </ul>
              </section>

              <div className="flex flex-col gap-3 border-t-2 border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className={paragraph}>Butuh bantuan sebelum memesan?</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={APP_CONFIG.LINKS.EMAIL}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "nb-sm nb-press h-10 border-2 border-ink bg-paper px-4 text-xs font-semibold text-ink hover:bg-paper-2",
                    )}
                  >
                    <Mail className="mr-1.5 size-4" /> Email kami
                  </Link>
                  <Link
                    href={APP_CONFIG.LINKS.WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "nb-sm nb-press h-10 bg-ink px-4 text-xs font-semibold text-paper hover:bg-ink",
                    )}
                  >
                    <MessageCircle className="mr-1.5 size-4" /> Hubungi admin
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <p className="mt-8 text-xs text-ink-soft">
            Lihat juga{" "}
            <Link
              href={ROUTES.POLICY}
              className="font-semibold text-ink underline decoration-2 underline-offset-4"
            >
              Kebijakan Privasi
            </Link>{" "}
            dan{" "}
            <Link
              href={ROUTES.HELP}
              className="font-semibold text-ink underline decoration-2 underline-offset-4"
            >
              Pusat Bantuan
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicPageShell>
  );
}
