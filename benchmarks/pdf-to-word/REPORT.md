# Hasil Benchmark PDF ke Word

Tanggal: 13 November 2026

## Ringkasan

**Rekomendasi: Adobe PDF Services untuk MVP.**

Kualitas Adobe dan CloudConvert **setara** untuk PDF digital. Keunggulan Adobe ada pada kuota gratis (500 transaksi/bulan vs efektif ±60 konversi/bulan di CloudConvert free), dukungan OCR, dan integrasi resmi.

OCR Adobe **belum layak dijadikan fitur utama**. Pada satu-satunya sampel scan, hasilnya terfragmentasi dan banyak salah baca.

## Metodologi

- 6 sampel PDF: Word 1 kolom, Canva 2 kolom, dokumen bertabel, CV dengan foto/ikon, hasil scan, dan dokumen 8 halaman.
- Adobe diuji pada semua sampel. OCR diaktifkan otomatis hanya untuk PDF tanpa text layer.
- CloudConvert diuji pada 2 sampel paling menantang (Canva dan tabel) karena kredit gratis hanya 10/hari (4 kredit per konversi).
- Setiap DOCX dinilai dengan:
  - kemiripan teks (`dice` dan `containment`),
  - jumlah tabel, gambar, kolom, dan text box,
  - waktu konversi,
  - perbandingan visual setelah DOCX dirender kembali ke PDF memakai Adobe Create PDF.

## Hasil otomatis

| Sampel | Provider | Waktu | Ukuran DOCX | Dice | Tabel | Gambar | Kolom | Text box |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1-dari-word | Adobe | 10,0 s | 14 KB | 1,000 | 0 | 1 | 1 | 0 |
| 2-dari-canva | Adobe | 30,0 s | 4.348 KB | 0,974 | 0 | 11 | 3 | 0 |
| 2-dari-canva | CloudConvert | 24,6 s | 4.348 KB | 0,974 | 0 | 11 | 3 | 0 |
| 3-dengan-tabel | Adobe | 11,8 s | 71 KB | 1,000 | 2 | 1 | 1 | 0 |
| 3-dengan-tabel | CloudConvert | 18,8 s | 74 KB | 0,998 | 2 | 1 | 1 | 0 |
| 4-dengan-foto-ikon | Adobe | 9,5 s | 31 KB | 1,000 | 0 | 2 | 1 | 0 |
| 5-hasil-scan (OCR) | Adobe | 12,8 s | 90 KB | n/a | 1 | 3 | 4 | 38 |
| 6-dokumen-5+-halaman | Adobe | 19,5 s | 977 KB | 0,964 | 5 | 8 | 1 | 0 |

Rata-rata dice Adobe untuk 5 PDF digital: **0,988**.
Rata-rata dice CloudConvert untuk 2 PDF: **0,986**.

## Penilaian visual (1–5)

| Sampel | Provider | Layout | Editabilitas | Tabel | Font | Gambar | OCR |
|---|---|---:|---:|---:|---:|---:|---:|
| 1-dari-word | Adobe | 5 | 5 | – | 5 | 5 | – |
| 2-dari-canva | Adobe | 5 | 4 | – | 5 | 5 | – |
| 2-dari-canva | CloudConvert | 5 | 4 | – | 5 | 5 | – |
| 3-dengan-tabel | Adobe | 5 | 5 | 5 | 5 | 5 | – |
| 3-dengan-tabel | CloudConvert | 5 | 5 | 4 | 5 | 5 | – |
| 4-dengan-foto-ikon | Adobe | 5 | 5 | – | 5 | 5 | – |
| 5-hasil-scan | Adobe | 2 | 1 | 2 | 2 | 2 | 2 |
| 6-dokumen-5+-halaman | Adobe | 5 | 5 | 5 | 5 | 5 | – |

## Temuan per sampel

### 1. CV dari Word

Hasil sangat bersih. Teks, foto, heading, dan urutan bagian sesuai aslinya. Tidak ada text box. Ini kasus paling umum dan hasilnya praktis sempurna.

### 2. CV Canva 2 kolom

Secara visual hampir identik dengan aslinya, termasuk foto, bentuk kuning, dua kolom, dan timeline. Adobe menghasilkan 11 gambar dan 3 kolom.

CloudConvert memberi hasil yang **hampir sama persis**: ukuran DOCX 4.348 KB (selisih 34 byte), jumlah gambar dan kolom sama, dice sama. Perbedaan utama ada pada urutan run teks; kemungkinan keduanya memakai engine konversi yang sama atau setara.

Catatan editabilitas: teks pada badge "ANDREAS" terpecah menjadi potongan huruf dengan kapitalisasi bergantian. Secara visual tidak terlihat, tetapi saat diedit bisa terasa aneh. Skor editabilitas 4.

Halaman 2 kehilangan sedikit border kartu membulat, tetapi isi dan posisi teks tetap sesuai.

### 3. Dokumen bertabel

Kedua provider mempertahankan tabel sebagai tabel Word, bukan teks lepas.

- Adobe: 2 tabel, 36 baris, 104 sel.
- CloudConvert: 2 tabel, 32 baris, 92 sel.

Secara visual keduanya baik. Adobe sedikit lebih lengkap dalam mempertahankan struktur sel.

### 4. CV dengan foto dan ikon

Foto tetap utuh, ikon dan teks rapi, tidak ada text box. Hasil sangat baik.

### 5. PDF hasil scan (OCR)

Ini temuan terpenting: **OCR Adobe belum memadai untuk sampel ini**.

- 38 text box dan 52 elemen gambar membuat dokumen sulit diedit.
- Teks terfragmentasi dan posisinya bergeser.
- Logo dan stempel pecah menjadi blok.
- Salah baca jelas, misalnya "HAPIDAH" menjadi "HAPIOAH" dan "MAKASSAR" menjadi "11AKASSAR".

Sampel ini memang berupa transkrip ketikan yang discan, dengan kualitas dan kemiringan tertentu. Namun hasilnya cukup jauh dari layak untuk dipublikasikan sebagai fitur utama.

### 6. Dokumen 8 halaman

Jumlah halaman tetap 8. Tabel, gambar, header, footer, dan nomor halaman terjaga. Teks yang tidak terhitung dalam dice kemungkinan berasal dari elemen grafis atau header yang tidak ikut terekstrak, bukan karena hilang.

## Perbandingan biaya dan kuota

| | Adobe PDF Services | CloudConvert |
|---|---|---|
| Kuota gratis | 500 transaksi/bulan | 10 kredit/hari |
| Biaya per konversi | 1 transaksi | 4 kredit |
| Kapasitas gratis efektif | ±500/bulan | ±2/hari, maks ±60/bulan |
| OCR | Ada (kualitas terbatas) | Tidak dipromosikan untuk PDF→Word |
| SDK resmi | Node, Java, .NET, Python | REST + SDK |
| Kesesuaian untuk <100/bulan | **Sangat cukup** | Cukup, tetapi mepet |

Pada volume <100 konversi/bulan, Adobe tidak menimbulkan biaya tambahan. CloudConvert free tidak cukup jika volume mendekati 100/bulan.

## Rekomendasi

1. **Pakai Adobe PDF Services** sebagai provider MVP.
2. **Jangan aktifkan OCR secara default.** Sediakan sebagai opsi beta dengan disclaimer, atau tunda sampai ada kebutuhan nyata.
3. **Buat abstraksi provider** agar CloudConvert bisa dipakai sebagai fallback tanpa mengubah UI.
4. **Gunakan arsitektur async**: konversi memakan 9,5–30 detik, terlalu lama untuk request sinkron yang rapuh.
5. **Batasi input**: 10 MB, 20 halaman, 1 file per job.
6. **Kuota**: tamu 1/hari (maks 2/bulan), login 5/bulan, pembeli 30/bulan, admin tanpa batas.
7. **Pantau pemakaian Adobe** dan sediakan kill switch jika mendekati 500 transaksi/bulan.
8. **Update kebijakan privasi** dan pastikan penghapusan file otomatis setelah ±1 jam.

## Batasan benchmark

- CloudConvert hanya diuji pada 2 sampel karena batas kredit harian.
- OCR hanya diuji pada satu sampel scan.
- Penilaian visual memakai Adobe Create PDF sebagai renderer DOCX, bukan Microsoft Word. Hasil di Word bisa sedikit berbeda, tetapi perbandingan antar-provider tetap valid.
- Pemakaian kredit: Adobe ±17 transaksi (6 konversi + 8 render DOCX→PDF + smoke test), CloudConvert 8 kredit (2 konversi).

## Langkah berikutnya

Setelah provider dan kuota disetujui:

1. Rancang API route, job queue, dan penyimpanan Blob.
2. Implementasikan `PdfToWordProvider` dengan adapter Adobe.
3. Bangun halaman tool, progress polling, dan download.
4. Tambahkan kuota, Turnstile, rate limit, dan pencatatan pemakaian.
5. Uji end-to-end dengan sampel asli, lalu deploy.
