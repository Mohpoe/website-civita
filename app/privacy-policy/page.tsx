import { PublicPageShell } from "@/components/public-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Mail, Shield } from "lucide-react";
import Link from "next/link";
import { SiWhatsapp } from "react-icons/si";

const TOC = [
  { id: "informasi-dikumpulkan", label: "1. Informasi yang Dikumpulkan" },
  { id: "penggunaan-informasi", label: "2. Penggunaan Informasi" },
  { id: "pembayaran", label: "3. Pembayaran & Pihak Ketiga" },
  { id: "alat-pdf", label: "4. Alat PDF" },
  { id: "penyimpanan", label: "5. Penyimpanan Data" },
  { id: "perlindungan-data", label: "6. Perlindungan & Berbagi" },
  { id: "portofolio", label: "7. Penggunaan Portofolio" },
  { id: "cookie", label: "8. Cookie & Analitik" },
  { id: "hak-anda", label: "9. Hak & Penghapusan Data" },
  { id: "keamanan", label: "10. Keamanan" },
  { id: "perubahan", label: "11. Perubahan Kebijakan" },
  { id: "kontak", label: "12. Kontak" },
] as const;

const sectionTitle = "text-xl font-bold tracking-tight md:text-2xl";
const paragraph = "text-sm leading-relaxed text-ink-soft md:text-base";
const list = "list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft marker:text-ink/30 md:text-base";

export default function PrivacyPolicyPage() {
  return (
    <PublicPageShell>
      <main className="px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <header className="max-w-3xl space-y-4">
            <span className="nb-sm inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-ink">
              <Shield className="size-4" />
              Legal
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Kebijakan Privasi
            </h1>
            <p className="text-sm leading-relaxed text-ink-soft md:text-base">
              Terakhir diperbarui: <strong className="text-ink">November 2026</strong>.
              Kami menjelaskan data apa yang kami kumpulkan, mengapa data itu
              dibutuhkan, dan bagaimana kamu bisa meminta penghapusannya.
            </p>
          </header>

          <div className="mt-10 grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <nav
                aria-label="Daftar isi kebijakan privasi"
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
              <section id="informasi-dikumpulkan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>1. Informasi yang Kami Kumpulkan</h2>
                <p className={paragraph}>
                  Kami hanya meminta data yang benar-benar dibutuhkan untuk
                  mengerjakan pesanan atau menjalankan layanan di{" "}
                  {APP_CONFIG.NAME}.
                </p>
                <ul className={list}>
                  <li>
                    <strong className="text-ink">Data akun:</strong> nama,
                    alamat email, dan foto profil yang kamu berikan saat masuk
                    melalui Clerk. Kami tidak menyimpan kata sandi kamu.
                  </li>
                  <li>
                    <strong className="text-ink">Data pesanan jasa:</strong>{" "}
                    riwayat pendidikan, pengalaman kerja, keahlian, pencapaian,
                    posisi yang dilamar, serta berkas pendukung yang kamu unggah
                    untuk pembuatan CV, resume, surat lamaran, atau dokumen lain.
                  </li>
                  <li>
                    <strong className="text-ink">Data pesanan produk:</strong>{" "}
                    produk digital yang kamu beli dan riwayat unduhannya.
                  </li>
                  <li>
                    <strong className="text-ink">Data pembayaran:</strong>{" "}
                    nominal, status, dan nomor pesanan. Rincian kartu atau
                    rekening tidak disimpan di server kami.
                  </li>
                  <li>
                    <strong className="text-ink">Data teknis:</strong> alamat IP,
                    jenis perangkat, dan halaman yang dibuka, sebatas yang
                    tercatat otomatis oleh server atau layanan yang kami pakai.
                  </li>
                </ul>
              </section>

              <section id="penggunaan-informasi" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>2. Penggunaan Informasi</h2>
                <ul className={list}>
                  <li>Mengerjakan pesanan jasa dan menyiapkan berkas hasilnya.</li>
                  <li>
                    Memproses pembayaran, mengirim konfirmasi, dan menampilkan
                    riwayat pesanan di akunmu.
                  </li>
                  <li>
                    Menghubungi kamu terkait pengerjaan, revisi, atau kendala
                    pesanan melalui email, WhatsApp, atau chat di dashboard.
                  </li>
                  <li>
                    Menjaga keamanan layanan, mencegah penyalahgunaan, dan
                    memenuhi kewajiban hukum yang berlaku.
                  </li>
                </ul>
                <p className={paragraph}>
                  Kami tidak menggunakan data pesananmu untuk iklan pihak ketiga
                  atau menjualnya kepada siapa pun.
                </p>
              </section>

              <section id="pembayaran" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>3. Pembayaran dan Pihak Ketiga</h2>
                <p className={paragraph}>
                  Pembayaran diproses oleh <strong className="text-ink">Midtrans</strong>.
                  Data yang kamu masukkan di jendela pembayaran dikirim langsung
                  ke Midtrans dan tunduk pada kebijakan privasi mereka. Kami
                  hanya menerima status transaksi dan nomor pesanan.
                </p>
                <p className={paragraph}>
                  Layanan lain yang membantu operasional situs:
                </p>
                <ul className={list}>
                  <li>
                    <strong className="text-ink">Clerk</strong> untuk pendaftaran,
                    masuk, dan pengelolaan sesi akun.
                  </li>
                  <li>
                    <strong className="text-ink">Neon</strong> sebagai penyedia
                    basis data tempat data pesanan disimpan.
                  </li>
                  <li>
                    <strong className="text-ink">Vercel</strong> sebagai penyedia
                    hosting dan penyimpanan berkas.
                  </li>
                </ul>
              </section>

              <section id="alat-pdf" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>4. Alat PDF dan Pemrosesan Berkas</h2>
                <p className={paragraph}>
                  Sebagian besar alat PDF kami berjalan sepenuhnya di browser,
                  sehingga berkasmu tidak dikirim ke server. Pengecualiannya
                  adalah <strong className="text-ink">PDF ke Word</strong> yang
                  memerlukan layanan <strong className="text-ink">Adobe PDF Services</strong>{" "}
                  untuk melakukan konversi.
                </p>
                <ul className={list}>
                  <li>
                    Berkas untuk konversi disimpan sementara di penyimpanan
                    privat dan dihapus setelah dikirim ke penyedia konversi.
                  </li>
                  <li>
                    Hasil konversi dihapus otomatis maksimal 24 jam setelah
                    dibuat.
                  </li>
                  <li>
                    Kami tidak memakai isi dokumenmu untuk pelatihan model,
                    pemasaran, atau tujuan lain.
                  </li>
                  <li>
                    Jumlah konversi dibatasi untuk mencegah penyalahgunaan
                    layanan.
                  </li>
                </ul>
                <p className={paragraph}>
                  Hindari mengunggah dokumen yang sangat sensitif, seperti data
                  keuangan, dokumen medis, atau data pribadi orang lain tanpa
                  izin.
                </p>
              </section>

              <section id="penyimpanan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>5. Penyimpanan dan Masa Simpan Data</h2>
                <p className={paragraph}>
                  Data pesanan disimpan selama akunmu aktif agar kamu bisa
                  mengunduh ulang hasil pekerjaan. Berkas mentah yang kamu unggah
                  untuk pesanan jasa disimpan selama proses pengerjaan dan masa
                  revisi, lalu dapat dihapus setelah pesanan selesai.
                </p>
                <p className={paragraph}>
                  Kamu bisa meminta penghapusan lebih awal kapan saja melalui
                  kontak di bagian akhir halaman ini.
                </p>
              </section>

              <section id="perlindungan-data" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>6. Perlindungan dan Berbagi Data</h2>
                <p className={paragraph}>
                  Kami tidak menjual, menyewakan, atau membagikan data pribadimu
                  kepada pihak lain untuk tujuan pemasaran. Data hanya diakses
                  oleh tim {APP_CONFIG.NAME} yang menangani pesananmu dan oleh
                  penyedia layanan yang disebutkan di atas sebatas kebutuhan
                  teknis.
                </p>
              </section>

              <section id="portofolio" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>7. Penggunaan Hasil Desain sebagai Portofolio</h2>
                <p className={paragraph}>
                  Kami kadang menampilkan hasil desain sebagai contoh portofolio
                  di media sosial atau situs ini. Jika itu dilakukan, informasi
                  sensitif seperti nama lengkap, nomor telepon, email, alamat,
                  dan nama perusahaan akan disensor atau diganti dengan data
                  contoh, kecuali kamu memberikan izin langsung.
                </p>
              </section>

              <section id="cookie" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>8. Cookie dan Analitik</h2>
                <p className={paragraph}>
                  Situs menggunakan cookie yang diperlukan untuk menjaga sesi
                  masuk dan mengingat preferensi tampilan, seperti mode terang
                  atau gelap. Kami tidak memasang cookie iklan. Jika di kemudian
                  hari kami memakai alat analitik, halaman ini akan diperbarui
                  lebih dulu.
                </p>
              </section>

              <section id="hak-anda" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>9. Hak dan Penghapusan Data</h2>
                <p className={paragraph}>
                  Kamu berhak meminta salinan, koreksi, atau penghapusan data
                  pribadimu. Setelah pesanan selesai, kamu juga bisa meminta
                  berkas mentah dan data karir dihapus dari penyimpanan kami.
                </p>
                <p className={paragraph}>
                  Kirim permintaan melalui email atau WhatsApp resmi yang
                  tercantum di bawah. Kami akan memprosesnya dalam waktu yang
                  wajar setelah memastikan identitas pemilik akun.
                </p>
              </section>

              <section id="keamanan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>10. Keamanan</h2>
                <p className={paragraph}>
                  Kami memakai koneksi terenkripsi, pembatasan akses internal,
                  dan penyimpanan berkas privat. Meski demikian, tidak ada sistem
                  yang sepenuhnya bebas risiko. Jika terjadi insiden yang
                  berdampak pada datamu, kami akan memberi tahu melalui kanal
                  kontak yang tersedia.
                </p>
              </section>

              <section id="perubahan" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>11. Perubahan Kebijakan</h2>
                <p className={paragraph}>
                  Kebijakan ini dapat diperbarui jika layanan atau aturan yang
                  berlaku berubah. Versi terbaru selalu tersedia di halaman ini
                  dengan tanggal pembaruan di bagian atas.
                </p>
              </section>

              <section id="kontak" className="scroll-mt-28 space-y-3">
                <h2 className={sectionTitle}>12. Kontak</h2>
                <p className={paragraph}>
                  Pertanyaan tentang privasi atau permintaan penghapusan data
                  bisa disampaikan ke:
                </p>
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
                <p className={paragraph}>
                  Dengan menggunakan layanan {APP_CONFIG.NAME}, kamu menyetujui
                  pengumpulan dan penggunaan data sebagaimana dijelaskan di
                  halaman ini.
                </p>
              </section>

              <div className="flex flex-col gap-3 border-t-2 border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className={paragraph}>Masih ada yang ingin ditanyakan?</p>
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
                    <SiWhatsapp className="mr-1.5 size-4" /> Hubungi admin
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <p className="mt-8 text-xs text-ink-soft">
            Lihat juga{" "}
            <Link
              href={ROUTES.TERMS}
              className="font-semibold text-ink underline decoration-2 underline-offset-4"
            >
              Syarat & Ketentuan
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
