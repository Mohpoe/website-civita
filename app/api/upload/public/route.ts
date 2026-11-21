import { currentUser } from "@clerk/nextjs/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["superadmin", "admin"];

/**
 * Folder yang boleh ditulis lewat route ini.
 * - `testimonials/` untuk screenshot chat WhatsApp.
 * - `brand/` untuk logo/aset identitas situs.
 */
const ALLOWED_FOLDERS = ["testimonials/", "brand/"];

/**
 * Upload ke PUBLIC_BLOB untuk aset yang memang harus bisa diakses publik
 * (testimoni dan logo). File produk digital tetap memakai `/api/upload`
 * yang menyimpan ke PRIVATE_BLOB.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const user = await currentUser();
    if (!user || !ALLOWED_ROLES.includes(user.publicMetadata.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: process.env.PUBLIC_BLOB_WEBHOOK_PUBLIC_KEY,
      getSignedToken: async (pathname) => {
        if (!user || !ALLOWED_ROLES.includes(user.publicMetadata.role as string)) {
          throw new Error("Not authorized!");
        }
        if (!ALLOWED_FOLDERS.some((folder) => pathname.startsWith(folder))) {
          throw new Error("Folder tujuan tidak valid!");
        }

        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          storeId: process.env.PUBLIC_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });

        return {
          token,
          urlOptions: {
            // Screenshot chat dan logo tidak perlu lebih dari 10 MB.
            maximumSizeInBytes: 10 * 1024 * 1024,
            addRandomSuffix: true,
          },
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Penyimpanan URL ke database dilakukan oleh server action, bukan di sini.
        console.log("Upload publik selesai:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Gagal upload aset publik:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
