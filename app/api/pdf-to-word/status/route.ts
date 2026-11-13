import { NextResponse } from "next/server";
import {
  ADOBE_DOCX_MIME,
  downloadAdobeAsset,
  pollAdobeJob,
} from "@/lib/pdf-to-word/adobe";
import { deletePrivateBlob, writePrivateBlob } from "@/lib/pdf-to-word/blob";
import {
  PDF_TO_WORD_CONFIG,
  buildOutputFileName,
} from "@/lib/pdf-to-word/config";
import { getIdentity } from "@/lib/pdf-to-word/identity";
import { claimRefund, getJob, updateJob } from "@/lib/pdf-to-word/jobs";
import { refundQuota } from "@/lib/pdf-to-word/quota";
import type { PdfToWordIdentity } from "@/lib/pdf-to-word/identity";
import type { PdfToWordJob } from "@/lib/pdf-to-word/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function ownsJob(job: PdfToWordJob, identity: PdfToWordIdentity): boolean {
  return job.ownerKind === identity.ownerKind && job.ownerId === identity.ownerId;
}

async function failJob(job: PdfToWordJob, message: string) {
  await updateJob(job.id, { status: "failed", error: message });

  if (await claimRefund(job.id)) {
    await refundQuota({ keys: job.quotaKeys });
  }
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

    if (!ownsJob(job, identity)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    if (job.status === "done") {
      return NextResponse.json({
        status: "done",
        jobId: job.id,
        fileName: job.outputName ?? buildOutputFileName(job.fileName),
        downloadUrl: `/api/pdf-to-word/download?jobId=${job.id}`,
      });
    }

    if (job.status === "failed") {
      return NextResponse.json({
        status: "failed",
        jobId: job.id,
        error: job.error ?? "Konversi gagal.",
      });
    }

    if (Date.now() - job.createdAt > PDF_TO_WORD_CONFIG.jobTimeoutMs) {
      const message =
        "Konversi melebihi batas waktu. Kuota Anda sudah dikembalikan.";
      await failJob(job, message);
      return NextResponse.json({ status: "failed", jobId: job.id, error: message });
    }

    if (!job.adobePollUrl) {
      // Job masih di tahap queued/submitting.
      return NextResponse.json({ status: job.status, jobId: job.id });
    }

    const result = await pollAdobeJob(job.adobePollUrl);

    if (result.status === "pending") {
      return NextResponse.json({ status: "processing", jobId: job.id });
    }

    if (result.status === "failed") {
      console.error("[pdf-to-word] Adobe menolak dokumen:", result.error);

      const message =
        "Dokumen tidak dapat dikonversi oleh layanan. Kuota Anda sudah dikembalikan. Pastikan PDF tidak rusak atau terkunci, lalu coba lagi.";
      await failJob(job, message);
      return NextResponse.json({
        status: "failed",
        jobId: job.id,
        error: message,
      });
    }

    const buffer = await downloadAdobeAsset(result.downloadUri);
    const outputPathname = `${PDF_TO_WORD_CONFIG.blobPrefix}/${job.ownerKind}/${job.ownerId}/out/${job.id}.docx`;
    const outputName = buildOutputFileName(job.fileName);

    await writePrivateBlob(outputPathname, buffer, ADOBE_DOCX_MIME);
    await updateJob(job.id, {
      status: "done",
      outputPathname,
      outputName,
    });
    await deletePrivateBlob(job.inputPathname);

    return NextResponse.json({
      status: "done",
      jobId: job.id,
      fileName: outputName,
      downloadUrl: `/api/pdf-to-word/download?jobId=${job.id}`,
    });
  } catch (error) {
    console.error("[pdf-to-word] gagal memeriksa status:", error);
    return NextResponse.json(
      {
        error:
          "Gagal memeriksa status konversi. Coba lagi beberapa saat lagi.",
      },
      { status: 502 },
    );
  }
}
