import { currentUser } from '@clerk/nextjs/server';
import { issueSignedToken } from '@vercel/blob';
import { handleUploadPresigned, HandleUploadPresignedBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadPresignedBody;
  const allowedRoles = ["superadmin", "admin"];

  try {
    const user = await currentUser();
    if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: process.env.PRIVATE_BLOB_WEBHOOK_PUBLIC_KEY,
      getSignedToken: async (pathname) => {
        if (!user || !allowedRoles.includes(user.publicMetadata.role as string)) throw new Error("Not authorized!");
        if (!pathname.startsWith("products/")) throw new Error("Folder tujuan tidak valid!");

        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          storeId: process.env.PRIVATE_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });

        return {
          token,
          urlOptions: {
            maximumSizeInBytes: 50 * 1024 * 1024,
            addRandomSuffix: true,
          },
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
    console.error("Gagal upload file:", (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}