import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  FileText,
  ShoppingBag,
  UserRound,
} from "lucide-react";

export type HelpSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  steps?: string[];
  bullets?: string[];
  note?: string;
};

export type HelpArticle = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  accent: "coral" | "butter" | "sage" | "sky";
  readTime: string;
  sections: HelpSection[];
  faqs: { question: string; answer: string }[];
};

/**
 * Isi Pusat Bantuan.
 *
 * Disimpan sebagai data statis supaya halaman bantuan bisa dibaca tanpa login,
 * cepat dibuka, dan tidak menambah tabel baru di database.
 */
export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "produk",
    title: "Cara Membeli dan Mengunduh Produk Digital",
    shortTitle: "Produk Digital",
    description:
      "Panduan memilih template, menyelesaikan pembayaran, dan mengunduh berkas produk digital.",
    icon: ShoppingBag,
    accent: "coral",
    readTime: "4 menit",
    sections: [
      {
        id: "sebelum-membeli",
        title: "Sebelum membeli",
        paragraphs: [
          "Semua produk bisa dilihat tanpa akun. Kamu baru perlu masuk saat menekan tombol beli.",
          "Buka halaman Produk, lalu pilih template yang sesuai. Di halaman detail kamu bisa melihat deskripsi, format berkas, ukuran, dan contoh isi.",
        ],
        bullets: [
          "Perhatikan format berkas: PDF cocok untuk dikirim, DOCX atau Canva cocok untuk diedit.",
          "Baca daftar isi supaya yakin template sesuai kebutuhanmu.",
          "Simpan halaman produk kalau ingin membandingkan beberapa pilihan.",
        ],
      },
      {
        id: "cara-membeli",
        title: "Cara membeli",
        steps: [
          "Buka halaman Produk dan pilih template yang diinginkan.",
          "Klik tombol Beli di halaman detail produk.",
          "Masuk atau daftar menggunakan akun Google atau email.",
          "Setelah masuk, kamu kembali ke halaman detail dan jendela pembayaran akan terbuka.",
          "Pilih metode pembayaran, lalu selesaikan pembayaran.",
        ],
        note:
          "Kalau jendela pembayaran tertutup, buka menu Pesanan Saya → Produk dan tekan Bayar Sekarang pada pesanan tersebut.",
      },
      {
        id: "mengunduh",
        title: "Mengunduh berkas",
        paragraphs: [
          "Setelah pembayaran berhasil, status pesanan berubah menjadi Berhasil dan tombol Unduh Berkas muncul.",
        ],
        steps: [
          "Buka menu Pesanan Saya, lalu pilih Produk.",
          "Cari pesanan dengan status Berhasil.",
          "Klik Unduh Berkas dan simpan salinannya di perangkatmu.",
        ],
        note:
          "Tautan unduhan tetap tersedia selama akunmu aktif, tetapi sebaiknya simpan salinan sendiri agar aman.",
      },
      {
        id: "kendala",
        title: "Kalau pembayaran atau unduhan bermasalah",
        bullets: [
          "Pembayaran belum masuk: tunggu beberapa menit lalu muat ulang halaman pesanan.",
          "Status masih Menunggu: buka pesanan dan tekan Bayar Sekarang untuk melanjutkan pembayaran.",
          "Ingin membatalkan: tekan Batalkan pada pesanan yang belum dibayar.",
          "Unduhan gagal: pastikan kamu sudah masuk dengan akun yang sama saat membeli, lalu coba lagi.",
        ],
        paragraphs: [
          "Jika masalah berlanjut, hubungi admin dan sertakan nomor pesanan yang tertera di kartu pesanan.",
        ],
      },
      {
        id: "penggunaan",
        title: "Cara memakai produk",
        paragraphs: [
          "Produk digital dilisensikan untuk keperluan pribadi dan profesionalmu. Kamu boleh mengubah isi template, tetapi tidak boleh menjual ulang atau membagikannya sebagai produk milikmu.",
          "Untuk berkas DOCX, buka dengan Microsoft Word, Google Docs, atau WPS. Untuk berkas PDF, gunakan aplikasi pembaca PDF atau alat PDF gratis di situs ini bila perlu diubah.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah saya perlu membuat akun untuk melihat produk?",
        answer:
          "Tidak. Katalog dan detail produk bisa dibuka tanpa akun. Akun baru dibutuhkan saat kamu membeli agar berkas bisa dikirim ke riwayat pesananmu.",
      },
      {
        question: "Berapa lama saya bisa mengunduh produk?",
        answer:
          "Selama akunmu aktif, tautan unduhan tetap ada di halaman Pesanan Saya → Produk. Tetap disarankan menyimpan salinan berkas setelah membeli.",
      },
      {
        question: "Apakah produk bisa diretur?",
        answer:
          "Produk digital bersifat personal dan langsung bisa diunduh, sehingga pembayaran yang sudah berhasil umumnya tidak dapat dikembalikan. Jika ada berkas yang rusak, hubungi admin agar kami bantu perbaiki.",
      },
    ],
  },
  {
    slug: "jasa",
    title: "Cara Memesan Jasa dan Memantau Progres",
    shortTitle: "Jasa Kustom",
    description:
      "Alur pemesanan jasa, mengirim data, berkomunikasi dengan admin, sampai mengunduh hasil.",
    icon: FileText,
    accent: "butter",
    readTime: "5 menit",
    sections: [
      {
        id: "memilih",
        title: "Memilih layanan",
        paragraphs: [
          "Halaman Jasa berisi layanan yang bisa dipesan, misalnya CV ATS Friendly, resume, surat lamaran, atau cover letter. Setiap layanan punya harga tetap dan estimasi pengerjaan.",
          "Buka detail layanan untuk melihat apa saja yang kamu dapat, contoh hasil, dan informasi berkas yang perlu disiapkan.",
        ],
      },
      {
        id: "memesan",
        title: "Cara memesan",
        steps: [
          "Buka halaman Jasa dan pilih layanan yang sesuai.",
          "Klik Pesan jasa ini di halaman detail.",
          "Masuk atau daftar bila belum punya akun.",
          "Isi formulir pesanan: pilih bahasa, tulis kebutuhanmu, dan unggah berkas pendukung bila ada.",
          "Periksa ringkasan, lalu selesaikan pembayaran.",
        ],
        note:
          "Data yang lengkap mempercepat pengerjaan. Sertakan pengalaman, pendidikan, keahlian, dan posisi yang dilamar.",
      },
      {
        id: "progres",
        title: "Memantau progres",
        paragraphs: [
          "Setelah dibayar, pesanan masuk ke antrean admin. Kamu bisa melihat status dan berkomunikasi lewat ruang pesanan.",
          "Buka menu Pesanan Saya → Jasa, lalu klik Buka pada pesanan untuk masuk ke ruang pesanan.",
        ],
        bullets: [
          "Perlu dibayar: pesanan sudah dibuat tetapi pembayaran belum selesai.",
          "Dikerjakan: pembayaran berhasil dan admin sedang menyusun berkas.",
          "Selesai: berkas hasil sudah tersedia untuk diunduh.",
          "Ditutup: pesanan gagal, kedaluwarsa, atau dibatalkan.",
        ],
      },
      {
        id: "revisi",
        title: "Revisi",
        paragraphs: [
          "Revisi minor seperti salah ketik, penyesuaian warna ringan, atau perubahan font tersedia maksimal 2 hari (48 jam) setelah draf pertama dikirim.",
          "Sampaikan permintaan revisi lewat chat di ruang pesanan. Sebutkan bagian yang ingin diubah secara spesifik agar tidak bolak-balik.",
        ],
        note:
          "Revisi tidak mencakup perombakan total desain atau penambahan data dalam jumlah besar yang tidak disampaikan saat memesan.",
      },
      {
        id: "hasil",
        title: "Mengunduh hasil",
        paragraphs: [
          "Saat berkas selesai, admin mengunggah hasil ke ruang pesanan. Tombol Hasil akan muncul di daftar pesanan dan di dalam ruang pesanan.",
          "Simpan salinan berkas di perangkatmu. Kamu tetap bisa mengunduh ulang dari riwayat pesanan selama akun aktif.",
        ],
      },
      {
        id: "batal",
        title: "Membatalkan pesanan",
        paragraphs: [
          "Pesanan yang belum dibayar bisa dibatalkan dari halaman Pesanan Saya → Jasa. Pesanan yang sudah dibayar tidak dapat dibatalkan otomatis; hubungi admin lewat chat untuk membahasnya.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah saya bisa memesan tanpa akun?",
        answer:
          "Tidak. Jasa dikerjakan berdasarkan data pribadimu dan hasilnya dikirim lewat ruang pesanan, jadi kamu perlu masuk agar pesanan bisa dipantau dan berkas tetap aman.",
      },
      {
        question: "Berapa lama pengerjaannya?",
        answer:
          "Estimasi tertera di halaman detail layanan. Waktu dihitung sejak pembayaran dan data lengkap diterima. Pada periode sibuk, pengerjaan bisa sedikit lebih lama dan admin akan memberi tahu lewat chat.",
      },
      {
        question: "Berkas apa yang sebaiknya saya unggah?",
        answer:
          "CV lama, ijazah, sertifikat, portofolio, atau dokumen pendukung lain yang relevan. Pastikan berkas milikmu sendiri atau kamu punya izin untuk menggunakannya.",
      },
      {
        question: "Bagaimana kalau hasilnya belum sesuai?",
        answer:
          "Gunakan masa revisi 48 jam setelah draf pertama. Jelaskan bagian yang perlu diperbaiki lewat chat ruang pesanan agar admin bisa menyesuaikan.",
      },
    ],
  },
  {
    slug: "pembayaran",
    title: "Pembayaran, Status Pesanan, dan Kendala",
    shortTitle: "Pembayaran",
    description:
      "Metode pembayaran yang tersedia, arti status pesanan, dan langkah saat pembayaran bermasalah.",
    icon: CreditCard,
    accent: "sage",
    readTime: "4 menit",
    sections: [
      {
        id: "metode",
        title: "Metode pembayaran",
        paragraphs: [
          "Pembayaran diproses oleh Midtrans. Metode yang muncul mengikuti pilihan yang tersedia di jendela pembayaran, misalnya QRIS, e-wallet, transfer bank virtual account, atau kartu.",
          "Kami tidak menyimpan nomor kartu atau PIN. Data pembayaran diketik langsung di jendela Midtrans.",
        ],
      },
      {
        id: "status",
        title: "Arti status pesanan",
        bullets: [
          "Menunggu bayar: pesanan sudah dibuat, pembayaran belum diterima.",
          "Ditinjau: pembayaran sedang diperiksa oleh penyedia pembayaran.",
          "Dibayar atau Berhasil: pembayaran diterima. Produk bisa diunduh atau jasa mulai dikerjakan.",
          "Kedaluwarsa: batas waktu pembayaran habis. Kamu bisa membuat pesanan baru.",
          "Dibatalkan: pesanan ditutup, biasanya karena dibatalkan atau pembayaran gagal.",
        ],
      },
      {
        id: "gagal",
        title: "Pembayaran gagal atau tertunda",
        steps: [
          "Muat ulang halaman Pesanan Saya untuk melihat status terbaru.",
          "Jika status masih Menunggu bayar, buka pesanan dan tekan Bayar Sekarang.",
          "Selesaikan pembayaran sebelum batas waktu yang tertera di jendela pembayaran.",
          "Jika saldo atau jaringan bermasalah, coba metode pembayaran lain.",
        ],
        note:
          "Jangan membuat beberapa pesanan sekaligus untuk produk yang sama. Satu pesanan yang berhasil sudah cukup.",
      },
      {
        id: "keamanan",
        title: "Keamanan pembayaran",
        paragraphs: [
          "Selalu periksa nominal dan nama pesanan sebelum membayar. Jendela pembayaran resmi dibuka dari situs ini dan diproses oleh Midtrans.",
          "Admin tidak pernah meminta PIN, kode OTP, atau kata sandi akunmu. Abaikan permintaan seperti itu meskipun mengaku dari kami.",
        ],
      },
      {
        id: "bantuan-pembayaran",
        title: "Butuh bantuan pembayaran",
        paragraphs: [
          "Hubungi admin melalui WhatsApp atau email dengan menyertakan nomor pesanan, nominal, metode pembayaran, dan waktu transaksi. Informasi itu mempercepat pengecekan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Pembayaran sudah terpotong, tetapi status masih menunggu. Kenapa?",
        answer:
          "Konfirmasi dari penyedia pembayaran kadang butuh beberapa menit. Muat ulang halaman pesanan secara berkala. Jika lebih dari 30 menit masih menunggu, hubungi admin dengan nomor pesananmu.",
      },
      {
        question: "Apakah bisa membayar lewat transfer biasa?",
        answer:
          "Metode yang tersedia mengikuti pilihan di jendela pembayaran Midtrans. Jika metode yang kamu inginkan tidak muncul, gunakan metode lain yang tersedia atau hubungi admin.",
      },
      {
        question: "Apakah data kartu saya aman?",
        answer:
          "Data kartu diketik langsung di jendela Midtrans dan tidak disimpan di server kami. Kami hanya menerima status transaksi dan nomor pesanan.",
      },
    ],
  },
  {
    slug: "akun",
    title: "Akun, Keamanan, dan Pertanyaan Umum",
    shortTitle: "Akun & FAQ",
    description:
      "Cara masuk, mengubah data akun, menjaga keamanan, dan menghapus data pribadi.",
    icon: UserRound,
    accent: "sky",
    readTime: "4 menit",
    sections: [
      {
        id: "masuk",
        title: "Masuk dan mendaftar",
        paragraphs: [
          "Akun digunakan untuk menyimpan riwayat pesanan, membuka ruang pesanan jasa, dan mengunduh berkas. Kamu bisa masuk dengan akun Google atau alamat email.",
          "Saat menekan tombol beli atau pesan, jendela masuk akan muncul. Setelah berhasil, kamu dikembalikan ke halaman yang tadi dibuka.",
        ],
      },
      {
        id: "ubah-data",
        title: "Mengubah data akun",
        paragraphs: [
          "Nama, foto profil, dan alamat email dikelola oleh penyedia layanan akun (Clerk). Buka menu akun di sudut dashboard untuk mengubahnya.",
          "Jika email berubah, gunakan email baru saat berkomunikasi dengan admin agar pesanan tetap cocok dengan akunmu.",
        ],
      },
      {
        id: "keamanan-akun",
        title: "Menjaga keamanan akun",
        bullets: [
          "Jangan bagikan akses akun atau kode masuk kepada siapa pun.",
          "Keluar dari perangkat bersama setelah selesai memakai situs.",
          "Periksa kembali alamat situs sebelum memasukkan data pembayaran.",
          "Hubungi admin jika melihat aktivitas atau pesanan yang tidak kamu buat.",
        ],
      },
      {
        id: "hapus-data",
        title: "Menghapus akun dan data",
        paragraphs: [
          "Kamu bisa meminta salinan, koreksi, atau penghapusan data pribadi kapan saja. Kirim permintaan dari email yang terdaftar agar kami bisa memverifikasi pemilik akun.",
          "Setelah pesanan selesai, kamu juga bisa meminta berkas mentah dan data karier dihapus dari penyimpanan kami.",
        ],
      },
      {
        id: "faq-umum",
        title: "Pertanyaan umum",
        bullets: [
          "Tidak menerima email konfirmasi: periksa folder spam atau promosi, lalu hubungi admin.",
          "Punya beberapa akun: gunakan akun yang dipakai saat memesan agar riwayat pesanan terlihat.",
          "Lupa akun: cari email konfirmasi pesanan, lalu masuk dengan alamat tersebut.",
          "Ingin mengubah pesanan yang sudah dibayar: sampaikan lewat chat ruang pesanan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Apakah akun saya bisa dipakai di beberapa perangkat?",
        answer:
          "Bisa. Kamu dapat masuk di lebih dari satu perangkat. Tetap jaga kerahasiaan akses dan keluar dari perangkat yang bukan milikmu.",
      },
      {
        question: "Bagaimana cara menghapus akun?",
        answer:
          "Hubungi admin dari email yang terdaftar. Kami akan memverifikasi kepemilikan akun, lalu memproses penghapusan data sesuai kebijakan privasi.",
      },
      {
        question: "Apakah data saya dipakai untuk iklan?",
        answer:
          "Tidak. Kami tidak menjual atau membagikan data pribadimu untuk iklan pihak ketiga. Penjelasan lengkap ada di halaman Kebijakan Privasi.",
      },
    ],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}
