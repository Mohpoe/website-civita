import { NextResponse } from "next/server";
import { getIdentity } from "@/lib/pdf-to-word/identity";
import { getQuotaInfo } from "@/lib/pdf-to-word/quota";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  try {
    const identity = await getIdentity();
    const quota = await getQuotaInfo(identity);

    return NextResponse.json({ quota });
  } catch (error) {
    console.error("[pdf-to-word] gagal membaca kuota:", error);
    return NextResponse.json(
      { error: "Gagal membaca kuota konversi." },
      { status: 500 },
    );
  }
}
