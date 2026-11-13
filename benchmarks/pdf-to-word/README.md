# Benchmark PDF ke Word

Harness lokal untuk membandingkan kualitas konversi **Adobe PDF Services** dan **CloudConvert** sebelum memilih provider untuk tool PDF ke Word di CIVITA.

Folder ini tidak dipakai oleh aplikasi. Tidak ada kode di sini yang di-deploy.

## Setup

Kredensial dibaca dari `benchmarks/pdf-to-word/.env`:

```
ADOBE_CLIENT_ID=...
ADOBE_CLIENT_SECRET=...
CLOUDCONVERT_API_KEY=...
```

File `.env` sudah diisi dan di-ignore oleh Git. Jangan commit isinya.

Cek koneksi tanpa melakukan konversi:

```powershell
node benchmarks/pdf-to-word/check.mjs
```

## Menambahkan sampel

Letakkan PDF di:

```
benchmarks/pdf-to-word/samples/
```

Gunakan nama yang menjelaskan jenisnya, misalnya:

```
01-word-1kolom.pdf
02-word-1kolom-panjang.pdf
03-canva-2kolom.pdf
04-canva-2kolom-tabel.pdf
05-tabel.pdf
06-foto-ikon.pdf
07-scan-bersih.pdf
08-scan-miring.pdf
```

Folder `samples/` di-ignore oleh Git, jadi CV asli tidak akan ikut ter-commit.

## Menjalankan

Semua sampel dengan Adobe:

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=adobe
```

Adobe dengan OCR otomatis (hanya PDF yang terdeteksi scan):

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=adobe --ocr=auto
```

Paksa OCR untuk semua file:

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=adobe --ocr
```

CloudConvert saja:

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=cloudconvert
```

Keduanya:

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=both
```

Opsi lain:

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=adobe --only=scan --limit=2
```

Untuk menjalankan provider secara terpisah tanpa menimpa hasil sebelumnya, tambahkan `--append`:

```powershell
node benchmarks/pdf-to-word/run.mjs --provider=cloudconvert --append
```

## Batas kredit CloudConvert

Akun free hanya mendapat **10 kredit/hari**, dan PDF ke Office memakai **4 kredit** per file. Artinya maksimal **2 konversi per hari**.

Harness otomatis berhenti memproses CloudConvert jika kredit tidak cukup, dan menandai sisanya sebagai `skipped` di `results.json`. Kredit biasanya reset setiap hari, jadi benchmark bisa dilanjutkan besok.

Adobe free tier: **500 document transaction/bulan**, satu konversi = satu transaksi.

## Hasil

Semua hasil ditulis ke `benchmarks/pdf-to-word/out/`:

| File | Isi |
|---|---|
| `*.docx` | Hasil konversi per sampel dan provider |
| `results.json` | Data lengkap: waktu, ukuran, struktur DOCX, skor kemiripan teks |
| `results.csv` | Versi ringkas untuk spreadsheet |
| `SCORING.md` | Lembar penilaian manual (layout, editabilitas, tabel, font, gambar, OCR) |

Metrik otomatis:

- **dice**: kemiripan teks PDF asli vs teks di DOCX (0–1, makin tinggi makin baik).
- **containment**: berapa persen kata PDF yang berhasil muncul di DOCX.
- **tables**: jumlah tabel Word yang terdeteksi.
- **images**: jumlah gambar di dalam DOCX.
- **columns**: jumlah kolom yang terdeteksi di section Word.
- **duration_ms**: waktu konversi termasuk upload dan polling.
- **likelyScan**: PDF tidak punya text layer dan kemungkinan hasil scan.
- **ocr**: OCR Adobe benar-benar dipakai untuk file tersebut.

Metrik otomatis tidak menilai keindahan layout. Karena itu `SCORING.md` disediakan untuk penilaian manual dengan skala 1–5.

## Catatan

- Benchmark dijalankan berurutan agar waktu proses tidak saling memengaruhi.
- File hasil bisa dibuka langsung di Microsoft Word atau LibreOffice.
- Setelah benchmark selesai, sebaiknya **rotasi kredensial** karena kredensial ini sempat ditulis di percakapan.
