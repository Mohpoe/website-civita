import { currentUser } from '@clerk/nextjs/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const user = await currentUser();
    if (!user || user.publicMetadata.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Opsi ini akan digunakan oleh @vercel/blob/client di frontend
        if (!user || user.publicMetadata.role !== "admin") throw new Error("Not authenticated!");
        return {
          // Tentukan tipe file yang diizinkan untuk produk digital
          // allowedContentTypes: [
          //   'application/pdf',
          //   'application/zip',
          //   'application/x-zip-compressed',
          //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
          //   'application/vnd.ms-excel', // xls
          //   'text/csv' // csv
          // ],
          // Batasi ukuran maksimal (contoh: 50MB). Sesuaikan dengan kebutuhan.
          maximumSizeInBytes: 50 * 1024 * 1024,
          // Gunakan suffix acak agar nama file tidak bentrok
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Hook ini dijalankan oleh Vercel setelah upload selesai.
        // Di sini Anda BISA (opsional) mencatat log, tapi kita TIDAK menyimpan
        // data ke database di sini. Penyimpanan ke database dilakukan di Server Action
        // bersamaan dengan data produk (nama, harga, dll).
        console.log("Upload selesai via Client Upload:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}