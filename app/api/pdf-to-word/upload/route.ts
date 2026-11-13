import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { issueUploadToken } from "@/lib/pdf-to-word/blob";
import { PDF_TO_WORD_CONFIG } from "@/lib/pdf-to-word/config";
import { getRedis } from "@/lib/pdf-to-word/redis";

export const runtime = "nodejs";
export const maxDuration = 30;

type UploadTicket = {
  ownerKind: "guest" | "user";
  ownerId: string;
  createdAt: number;
};

/**
 * Menerbitkan presigned URL untuk unggah langsung ke private Blob.
 *
 * Tiket dibuat oleh `/api/pdf-to-word/ticket` setelah Turnstile lolos, jadi
 * route ini tidak perlu memanggil Clerk atau Turnstile lagi.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadPresignedBody;

    const result = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: process.env.PRIVATE_BLOB_WEBHOOK_PUBLIC_KEY,
      getSignedToken: async (pathname) => {
        const redis = getRedis();
        const ticketKey = `p2w:ticket:${pathname}`;
        const ticket = await redis.get<UploadTicket>(ticketKey);

        if (!ticket) {
          throw new Error("Sesi unggah tidak valid atau sudah kedaluwarsa.");
        }

        if (!pathname.toLowerCase().endsWith(".pdf")) {
          throw new Error("Hanya file PDF yang diperbolehkan.");
        }

        // Tiket hanya boleh dipakai sekali.
        await redis.del(ticketKey);

        const token = await issueUploadToken(pathname);

        return {
          token,
          urlOptions: {
            allowedContentTypes: ["application/pdf"],
            maximumSizeInBytes: PDF_TO_WORD_CONFIG.maxFileBytes,
            addRandomSuffix: false,
            allowOverwrite: false,
          },
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[pdf-to-word] gagal menerbitkan token upload:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal menyiapkan unggahan." },
      { status: 400 },
    );
  }
}
