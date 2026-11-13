import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ADOBE_DOCX_MIME } from "@/lib/pdf-to-word/adobe";
import { buildOutputFileName } from "@/lib/pdf-to-word/config";
import { getIdentity } from "@/lib/pdf-to-word/identity";
import { getJob } from "@/lib/pdf-to-word/jobs";

export const runtime = "nodejs";
export const maxDuration = 60;

function asciiFileName(name: string): string {
  return name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") ?? "";
    const identity = await getIdentity();
    const job = await getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Sesi konversi tidak ditemukan atau sudah kedaluwarsa." },
        { status: 404 },
      );
    }

    if (job.ownerKind !== identity.ownerKind || job.ownerId !== identity.ownerId) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    if (job.status !== "done" || !job.outputPathname) {
      return NextResponse.json(
        { error: "File hasil belum siap." },
        { status: 409 },
      );
    }

    const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Penyimpanan file belum dikonfigurasi." },
        { status: 500 },
      );
    }

    const result = await get(job.outputPathname, {
      access: "private",
      token,
    });

    if (!result || result.statusCode !== 200) {
      return NextResponse.json(
        { error: "File hasil tidak ditemukan. Silakan konversi ulang." },
        { status: 404 },
      );
    }

    const fileName = job.outputName ?? buildOutputFileName(job.fileName);

    return new NextResponse(result.stream as ReadableStream, {
      headers: {
        "Content-Type": ADOBE_DOCX_MIME,
        "Content-Disposition": `attachment; filename="${asciiFileName(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[pdf-to-word] gagal mengunduh hasil:", error);
    return NextResponse.json(
      { error: "Gagal mengunduh file hasil." },
      { status: 500 },
    );
  }
}
