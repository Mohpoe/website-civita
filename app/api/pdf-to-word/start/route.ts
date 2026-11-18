import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { submitPdfToDocx } from "@/lib/pdf-to-word/adobe";
import { deletePrivateBlob, readPrivateBlob } from "@/lib/pdf-to-word/blob";
import { PDF_TO_WORD_CONFIG } from "@/lib/pdf-to-word/config";
import { getIdentity } from "@/lib/pdf-to-word/identity";
import { claimRefund, getJob, saveJob, updateJob } from "@/lib/pdf-to-word/jobs";
import {
  PdfPasswordRequiredError,
  preparePdf,
  type PreparedPdf,
} from "@/lib/pdf-to-word/prepare";
import { consumeQuota, refundQuota } from "@/lib/pdf-to-word/quota";
import { getRedis } from "@/lib/pdf-to-word/redis";
import type { PdfToWordJob } from "@/lib/pdf-to-word/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      pathname?: string;
      fileName?: string;
    };

    const identity = await getIdentity();
    const pathname = body.pathname ?? "";
    const fileName = (body.fileName ?? "").trim().slice(0, 200);

    const inputPrefix = `${PDF_TO_WORD_CONFIG.blobPrefix}/${identity.ownerKind}/${identity.ownerId}/in/`;

    if (
      !pathname.startsWith(inputPrefix) ||
      !pathname.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "File tidak valid untuk sesi ini." },
        { status: 400 },
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { error: "Nama file tidak boleh kosong." },
        { status: 400 },
      );
    }

    // Klaim atomik: dua request bersamaan untuk file yang sama hanya boleh
    // membuat satu job, supaya kuota tidak terpotong dua kali.
    const redis = getRedis();
    const jobId = randomUUID();
    const inputKey = `p2w:input:${pathname}`;
    const claimed = await redis.set(inputKey, jobId, {
      nx: true,
      ex: PDF_TO_WORD_CONFIG.jobTtlSeconds,
    });

    if (claimed !== "OK") {
      const existingJobId = await redis.get<string>(inputKey);
      const existing = existingJobId ? await getJob(existingJobId) : null;

      if (existing) {
        return NextResponse.json({ jobId: existing.id });
      }

      return NextResponse.json(
        { error: "File ini sedang diproses. Tunggu sebentar lalu coba lagi." },
        { status: 409 },
      );
    }

    const releaseClaim = async () => {
      await redis.del(inputKey);
    };

    try {
      const { buffer } = await readPrivateBlob(pathname);

      if (buffer.length > PDF_TO_WORD_CONFIG.maxFileBytes) {
        await deletePrivateBlob(pathname);
        await releaseClaim();
        return NextResponse.json(
          {
            error: `Ukuran file melebihi batas ${PDF_TO_WORD_CONFIG.maxFileMb} MB.`,
          },
          { status: 400 },
        );
      }

      let prepared: PreparedPdf;
      try {
        prepared = await preparePdf(buffer);
      } catch (error) {
        console.warn("[pdf-to-word] gagal membaca PDF:", error);
        await deletePrivateBlob(pathname);
        await releaseClaim();

        return NextResponse.json(
          {
            error:
              error instanceof PdfPasswordRequiredError
                ? "PDF dilindungi password. Hapus password terlebih dahulu, lalu coba lagi."
                : "PDF tidak dapat dibaca. Pastikan file tidak rusak.",
          },
          { status: 400 },
        );
      }

      const pages = prepared.pages;

      if (prepared.decrypted) {
        console.info(
          "[pdf-to-word] PDF berenkripsi didekripsi sebelum dikirim ke Adobe:",
          fileName,
        );
      }

      if (pages > PDF_TO_WORD_CONFIG.maxPages) {
        await deletePrivateBlob(pathname);
        await releaseClaim();
        return NextResponse.json(
          {
            error: `Dokumen ${pages} halaman. Batas maksimal ${PDF_TO_WORD_CONFIG.maxPages} halaman per konversi.`,
          },
          { status: 400 },
        );
      }

      const quota = await consumeQuota(identity);
      if (!quota.ok) {
        await deletePrivateBlob(pathname);
        await releaseClaim();
        return NextResponse.json(
          { error: quota.message, quota: quota.info },
          { status: 429 },
        );
      }

      const job: PdfToWordJob = {
        id: jobId,
        ownerKind: identity.ownerKind,
        ownerId: identity.ownerId,
        fileName,
        inputPathname: pathname,
        status: "queued",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        quotaKeys: quota.reservation.keys,
      };

      try {
        await saveJob(job);
      } catch (stateError) {
        await refundQuota(quota.reservation);
        await releaseClaim();
        throw stateError;
      }

      // after() hanya melakukan submit ke Adobe (±5 detik). Penyelesaian job
      // diambil oleh route status supaya aman di batas 60 detik Vercel Hobby.
      after(async () => {
        try {
          await updateJob(jobId, { status: "submitting" });

          const { pollUrl } = await submitPdfToDocx({
            buffer: prepared.buffer,
            fileName,
          });

          await updateJob(jobId, {
            status: "processing",
            adobePollUrl: pollUrl,
          });
        } catch (error) {
          // Detail teknis hanya untuk log server; pengguna cukup tahu bahwa
          // kuotanya dikembalikan dan bisa mencoba lagi.
          console.error("[pdf-to-word] submit ke Adobe gagal:", error);

          const message =
            "Layanan konversi sedang tidak tersedia. Kuota Anda sudah dikembalikan. Silakan coba lagi beberapa saat lagi.";

          try {
            await updateJob(jobId, { status: "failed", error: message });
            if (await claimRefund(jobId)) {
              await refundQuota(quota.reservation);
            }
          } catch (stateError) {
            console.error(
              "[pdf-to-word] gagal menandai job sebagai gagal:",
              stateError,
            );
          }
        } finally {
          // Adobe sudah menyimpan salinan PDF sendiri, jadi file input tidak
          // perlu disimpan lebih lama dari yang diperlukan.
          await deletePrivateBlob(pathname);
        }
      });

      return NextResponse.json({ jobId, quota: quota.info, pages });
    } catch (error) {
      await releaseClaim();
      throw error;
    }
  } catch (error) {
    console.error("[pdf-to-word] gagal memulai konversi:", error);
    return NextResponse.json(
      { error: "Gagal memulai konversi. Silakan coba lagi beberapa saat lagi." },
      { status: 500 },
    );
  }
}
