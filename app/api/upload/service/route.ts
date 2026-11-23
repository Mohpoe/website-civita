import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["admin", "superadmin"];

/**
 * Lampiran sumber dari klien, berkas hasil dari admin, dan lampiran chat
 * disimpan di PRIVATE_BLOB.
 *
 * - `service-source/` boleh diunggah semua user yang login (lampiran brief).
 * - `service-result/` hanya admin/superadmin (hasil pekerjaan).
 * - `service-chat/` boleh diunggah kedua pihak (lampiran di ruang obrolan).
 */
const ALLOWED_FOLDERS = ["service-source/", "service-result/", "service-chat/"];

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.publicMetadata.role as string | undefined;
    const isAdmin = !!role && ADMIN_ROLES.includes(role);

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: process.env.PRIVATE_BLOB_WEBHOOK_PUBLIC_KEY,
      getSignedToken: async (pathname) => {
        const folder = ALLOWED_FOLDERS.find((item) => pathname.startsWith(item));
        if (!folder) {
          throw new Error("Folder tujuan tidak valid!");
        }
        if (folder === "service-result/" && !isAdmin) {
          throw new Error("Hanya admin yang boleh mengunggah berkas hasil.");
        }

        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          storeId: process.env.PRIVATE_BLOB_STORE_ID,
          oidcToken: process.env.VERCEL_OIDC_TOKEN,
        });

        return {
          token,
          urlOptions: {
            // CV, portofolio, dan lampiran biasanya jauh di bawah 15 MB.
            maximumSizeInBytes: 15 * 1024 * 1024,
            addRandomSuffix: true,
          },
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Gagal upload berkas pesanan jasa:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
