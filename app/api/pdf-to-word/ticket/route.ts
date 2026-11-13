import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PDF_TO_WORD_CONFIG } from "@/lib/pdf-to-word/config";
import { getIdentity } from "@/lib/pdf-to-word/identity";
import { consumeUploadSlot, getQuotaInfo } from "@/lib/pdf-to-word/quota";
import { getRedis } from "@/lib/pdf-to-word/redis";
import { verifyTurnstile } from "@/lib/pdf-to-word/turnstile";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      turnstileToken?: string;
    };

    const identity = await getIdentity();

    const captcha = await verifyTurnstile(body.turnstileToken, identity.ip);
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error }, { status: 400 });
    }

    const quota = await getQuotaInfo(identity);
    const blocked = quota.unlimited
      ? false
      : quota.daily
        ? quota.daily.remaining <= 0 || quota.remaining <= 0
        : quota.remaining <= 0;

    if (blocked) {
      return NextResponse.json(
        {
          error:
            quota.daily && quota.daily.remaining <= 0
              ? "Kuota tamu hari ini sudah habis. Masuk dengan akun CIVITA untuk 5 konversi per bulan."
              : "Kuota konversi bulan ini sudah habis.",
          quota,
        },
        { status: 429 },
      );
    }

    const slot = await consumeUploadSlot(identity);
    if (!slot.ok) {
      return NextResponse.json({ error: slot.message, quota }, { status: 429 });
    }

    const id = randomUUID();
    const pathname = `${PDF_TO_WORD_CONFIG.blobPrefix}/${identity.ownerKind}/${identity.ownerId}/in/${id}.pdf`;

    await getRedis().set(
      `p2w:ticket:${pathname}`,
      {
        ownerKind: identity.ownerKind,
        ownerId: identity.ownerId,
        createdAt: Date.now(),
      },
      { ex: PDF_TO_WORD_CONFIG.ticketTtlSeconds },
    );

    return NextResponse.json({ pathname, quota });
  } catch (error) {
    console.error("[pdf-to-word] gagal membuat tiket upload:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal menyiapkan unggahan." },
      { status: 500 },
    );
  }
}
