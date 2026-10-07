"use client"

export default function Page() {
  const handleDownload = async () => {
    const blobUrl = "https://y8qmrwks1jfedfqn.private.blob.vercel-storage.com";

    // 1. Panggil API handler Anda
    const response = await fetch(`/api/test?pathname=${encodeURIComponent(blobUrl)}`);

    if (!response.ok) {
      alert("Gagal mengunduh file atau Anda tidak memiliki akses.");
      return;
    }

    // 2. Ubah response menjadi objek blob di sisi browser
    const blobData = await response.blob();

    // 3. Buat link unduhan sementara
    const downloadUrl = window.URL.createObjectURL(blobData);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = "laporan-terdownload.pdf"; // Nama file saat diunduh
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <>
      <button onClick={handleDownload} className="btn-primary">
        Download PDF Privat
      </button>
    </>
  );
}

// import { sql } from '@/lib/utils';

// export default function Page() {
//   async function create(formData: FormData) {
//     'use server';
//     // Connect to the Neon database
//     const comment = formData.get('comment');
//     // Insert the comment from the form into the Postgres database
//     await sql.query('INSERT INTO comments (comment) VALUES ($1)', [comment]);
//   }

//   return (
//     <form action={create}>
//       <input type="text" placeholder="write a comment" name="comment" />
//       <button type="submit">Submit</button>
//     </form>
//   );
// }