import { PDF_TO_WORD_CONFIG } from "./config";
import { getRedis } from "./redis";
import type { PdfToWordJob } from "./types";

const JOB_PREFIX = "p2w:job:";

function jobKey(id: string): string {
  return `${JOB_PREFIX}${id}`;
}

export async function saveJob(job: PdfToWordJob): Promise<void> {
  await getRedis().set(jobKey(job.id), job, {
    ex: PDF_TO_WORD_CONFIG.jobTtlSeconds,
  });
}

export async function getJob(id: string): Promise<PdfToWordJob | null> {
  if (!id || !/^[a-z0-9-]{8,64}$/i.test(id)) return null;
  return (await getRedis().get<PdfToWordJob>(jobKey(id))) ?? null;
}

export async function updateJob(
  id: string,
  patch: Partial<PdfToWordJob>,
): Promise<PdfToWordJob | null> {
  const current = await getJob(id);
  if (!current) return null;

  const next: PdfToWordJob = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };

  await saveJob(next);
  return next;
}

/**
 * Kunci refund agar dua request yang selesai bersamaan tidak mengembalikan
 * kuota dua kali.
 */
export async function claimRefund(jobId: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.set(`p2w:refund:${jobId}`, "1", {
    nx: true,
    ex: 60 * 60 * 24,
  });

  return result === "OK";
}
