"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "cn";
import { uploadPresigned } from "@vercel/blob/client";
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  FileType2Icon,
  InfoIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { PDF_TO_WORD_CONFIG } from "@/lib/pdf-to-word/config";
import type { PdfToWordQuotaInfo } from "@/lib/pdf-to-word/types";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

type Phase = "idle" | "reading" | "uploading" | "converting" | "done" | "error";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const POLL_INTERVAL_MS = PDF_TO_WORD_CONFIG.pollIntervalMs;
const MAX_POLLS = 90;

function getTurnstile(): TurnstileApi | undefined {
  return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (getTurnstile()) return Promise.resolve();

  const existing = document.getElementById(
    TURNSTILE_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Gagal memuat verifikasi keamanan.")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat verifikasi keamanan."));
    document.head.appendChild(script);
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Number.parseFloat((bytes / 1024 ** index).toFixed(1))} ${units[index]}`;
}

export default function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    fileName: string;
    downloadUrl: string;
  } | null>(null);
  const [quota, setQuota] = useState<PdfToWordQuotaInfo | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const refreshQuota = useCallback(async () => {
    try {
      const res = await fetch("/api/pdf-to-word/quota", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { quota?: PdfToWordQuotaInfo };
      if (data.quota) setQuota(data.quota);
    } catch {
      // Kuota hanya informasi tambahan; kegagalan membaca tidak memblokir tool.
    }
  }, []);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken(null);
    const turnstile = getTurnstile();
    if (turnstile && widgetIdRef.current) {
      try {
        turnstile.reset(widgetIdRef.current);
      } catch {
        // Widget mungkin sudah dilepas.
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/pdf-to-word/quota", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { quota?: PdfToWordQuotaInfo } | null) => {
        if (active && data?.quota) setQuota(data.quota);
      })
      .catch(() => {
        // Kuota hanya informasi tambahan; kegagalan membaca tidak memblokir tool.
      });

    return () => {
      active = false;
      clearPollTimer();
    };
  }, [clearPollTimer]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !turnstileRef.current) return;
        const turnstile = getTurnstile();
        if (!turnstile) return;

        if (widgetIdRef.current) {
          try {
            turnstile.remove(widgetIdRef.current);
          } catch {
            // Abaikan widget lama yang sudah tidak ada.
          }
        }

        widgetIdRef.current = turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "light",
          size: "flexible",
          callback: (token: string) => {
            setTurnstileToken(token);
            setTurnstileError(null);
          },
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => {
            setTurnstileToken(null);
            setTurnstileError(
              "Cek keamanan gagal dimuat. Muat ulang halaman.",
            );
          },
        });
      })
      .catch((loadError: Error) => {
        if (!cancelled) setTurnstileError(loadError.message);
      });

    return () => {
      cancelled = true;
      const turnstile = getTurnstile();
      if (turnstile && widgetIdRef.current) {
        try {
          turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget mungkin sudah dilepas.
        }
        widgetIdRef.current = null;
      }
    };
  }, [file]);

  const resetAll = useCallback(() => {
    clearPollTimer();
    setFile(null);
    setPageCount(null);
    setPhase("idle");
    setProgress(0);
    setError(null);
    setResult(null);
    resetTurnstile();
    if (inputRef.current) inputRef.current.value = "";
    void refreshQuota();
  }, [clearPollTimer, refreshQuota, resetTurnstile]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setResult(null);
    setError(null);
    setPageCount(null);
    setProgress(0);

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Hanya file PDF yang dapat dikonversi.");
      event.target.value = "";
      return;
    }

    if (selected.size > PDF_TO_WORD_CONFIG.maxFileBytes) {
      setError(
        `Ukuran file ${formatBytes(selected.size)}. Maksimal ${PDF_TO_WORD_CONFIG.maxFileMb} MB.`,
      );
      event.target.value = "";
      return;
    }

    setFile(selected);
    setPhase("reading");

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const data = new Uint8Array(await selected.arrayBuffer());
      const pdf = await pdfjs.getDocument({
        data,
        useWorkerFetch: false,
        useSystemFonts: true,
      } as Parameters<typeof pdfjs.getDocument>[0]).promise;

      setPageCount(pdf.numPages);

      if (pdf.numPages > PDF_TO_WORD_CONFIG.maxPages) {
        setError(
          `Dokumen ${pdf.numPages} halaman. Batas maksimal ${PDF_TO_WORD_CONFIG.maxPages} halaman per konversi.`,
        );
      }
    } catch {
      setError("Gagal membaca file PDF. Pastikan file tidak rusak atau terkunci.");
    } finally {
      setPhase("idle");
      event.target.value = "";
    }
  };

  const handleConvert = async () => {
    if (!file || !pageCount) return;

    if (pageCount > PDF_TO_WORD_CONFIG.maxPages) {
      setError(
        `Dokumen ${pageCount} halaman. Batas maksimal ${PDF_TO_WORD_CONFIG.maxPages} halaman.`,
      );
      return;
    }

    if (!TURNSTILE_SITE_KEY) {
      setError("Layanan konversi sedang tidak tersedia. Coba lagi beberapa saat lagi.");
      return;
    }

    if (!turnstileToken) {
      setError("Selesaikan cek keamanan terlebih dahulu.");
      return;
    }

    setPhase("uploading");
    setProgress(0);
    setError(null);

    try {
      const ticketRes = await fetch("/api/pdf-to-word/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });
      const ticket = (await ticketRes.json()) as {
        pathname?: string;
        quota?: PdfToWordQuotaInfo;
        error?: string;
      };

      if (ticket.quota) setQuota(ticket.quota);
      if (!ticketRes.ok || !ticket.pathname) {
        throw new Error(ticket.error || "Gagal menyiapkan file.");
      }

      const blob = await uploadPresigned(ticket.pathname, file, {
        access: "private",
        handleUploadUrl: "/api/pdf-to-word/upload",
        contentType: "application/pdf",
        onUploadProgress: ({ percentage }) =>
          setProgress(Math.max(0, Math.min(100, Math.round(percentage)))),
      });

      setPhase("converting");
      setProgress(100);

      const startRes = await fetch("/api/pdf-to-word/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathname: blob.pathname,
          fileName: file.name,
        }),
      });
      const started = (await startRes.json()) as {
        jobId?: string;
        quota?: PdfToWordQuotaInfo;
        error?: string;
      };

      if (started.quota) setQuota(started.quota);
      if (!startRes.ok || !started.jobId) {
        throw new Error(started.error || "Gagal memulai konversi.");
      }

      resetTurnstile();
      pollJob(started.jobId);
    } catch (conversionError) {
      const message =
        (conversionError as Error).message || "Konversi gagal. Coba lagi.";
      setError(message);
      setPhase("error");
      resetTurnstile();
      void refreshQuota();
      toast.add({ type: "error", description: message, priority: "high" });
    }
  };

  const pollJob = (jobId: string) => {
    let attempts = 0;

    const tick = async () => {
      attempts += 1;

      try {
        const res = await fetch(`/api/pdf-to-word/status?jobId=${jobId}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as {
          status?: string;
          fileName?: string;
          downloadUrl?: string;
          error?: string;
        };

        if (data.status === "done" && data.downloadUrl) {
          setResult({
            fileName: data.fileName || "dokumen.docx",
            downloadUrl: data.downloadUrl,
          });
          setPhase("done");
          setProgress(100);
          void refreshQuota();
          toast.add({
            type: "success",
            description: "Konversi selesai. Silakan unduh file Word Anda.",
          });
          return;
        }

        if (data.status === "failed") {
          throw new Error(data.error || "Konversi gagal.");
        }

        if (!res.ok && res.status === 404) {
          throw new Error(data.error || "Proses konversi tidak ditemukan. Silakan coba lagi.");
        }
      } catch (pollError) {
        const message = (pollError as Error).message;

        if (message.includes("gagal") || message.includes("tidak ditemukan")) {
          setError(message);
          setPhase("error");
          void refreshQuota();
          toast.add({ type: "error", description: message, priority: "high" });
          return;
        }
      }

      if (attempts >= MAX_POLLS) {
        const message =
          "Konversi memakan waktu lebih lama dari biasanya. Silakan cek kembali beberapa saat lagi.";
        setError(message);
        setPhase("error");
        return;
      }

      pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
    };

    clearPollTimer();
    pollTimerRef.current = window.setTimeout(tick, 1500);
  };

  const isBusy = phase === "uploading" || phase === "converting";
  const quotaBlocked = quota
    ? quota.unlimited
      ? false
      : quota.daily
        ? quota.daily.remaining <= 0 || quota.remaining <= 0
        : quota.remaining <= 0
    : false;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Maksimal {PDF_TO_WORD_CONFIG.maxFileMb} MB dan{" "}
          {PDF_TO_WORD_CONFIG.maxPages} halaman per konversi.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={resetAll}
          disabled={(!file && !result) || isBusy}
          className="w-full sm:w-auto"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {!file && !result && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-foreground/40 bg-muted/30 px-4 py-10 text-center transition-colors hover:bg-muted/60 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <FileType2Icon className="w-10 h-10 text-foreground/60" />
          <div>
            <p className="text-sm font-bold">Klik untuk memilih file PDF</p>
            <p className="text-xs text-muted-foreground mt-1">
              Maksimal {PDF_TO_WORD_CONFIG.maxFileMb} MB •{" "}
              {PDF_TO_WORD_CONFIG.maxPages} halaman • 1 file
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {file && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-foreground bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <FileTextIcon className="h-8 w-8 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
                {pageCount ? ` • ${pageCount} halaman` : ""}
                {phase === "reading" ? " • membaca…" : ""}
              </p>
            </div>
          </div>
          {!isBusy && phase !== "done" && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={resetAll}
              aria-label="Hapus file"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      {phase === "done" && result && (
        <div className="space-y-4 rounded-2xl border-2 border-foreground bg-background p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="h-5 w-5 text-green-600" />
            <p className="font-bold">Konversi berhasil</p>
          </div>
          <p className="text-sm text-muted-foreground">
            File Word sudah siap. Unduh sekarang karena file akan dihapus
            otomatis.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={result.downloadUrl} download className="sm:flex-1">
              <Button type="button" className="w-full" size="lg">
                <DownloadIcon className="w-4 h-4" />
                Unduh {result.fileName}
              </Button>
            </a>
            <Button
              type="button"
              variant="outline"
              onClick={resetAll}
              className="sm:flex-1"
              size="lg"
            >
              Konversi file lain
            </Button>
          </div>
        </div>
      )}

      {file && phase !== "done" && (
        <div className="space-y-4">
          {TURNSTILE_SITE_KEY ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <ShieldCheckIcon className="w-4 h-4" />
                Cek keamanan
              </div>
              <div ref={turnstileRef} className="min-h-[65px]" />
              {turnstileError && (
                <p className="text-xs font-medium text-destructive">
                  {turnstileError}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              Layanan konversi sedang tidak tersedia. Coba lagi beberapa saat
              lagi.
            </div>
          )}

          {isBusy && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  {phase === "uploading"
                    ? "Mengunggah PDF…"
                    : "Mengonversi ke Word…"}
                </span>
                {phase === "uploading" && <span>{progress}%</span>}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full bg-foreground transition-all",
                    phase === "converting" && "animate-pulse",
                  )}
                  style={{
                    width: `${phase === "converting" ? 100 : progress}%`,
                  }}
                />
              </div>
              {phase === "converting" && (
                <p className="text-xs text-muted-foreground">
                  Proses ini biasanya memakan 10–30 detik. Jangan tutup halaman
                  ini.
                </p>
              )}
            </div>
          )}

          <Button
            type="button"
            onClick={handleConvert}
            disabled={
              isBusy ||
              phase === "reading" ||
              !pageCount ||
              pageCount > PDF_TO_WORD_CONFIG.maxPages ||
              !turnstileToken ||
              quotaBlocked
            }
            className="w-full"
            size="lg"
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="w-4 h-4 animate-spin" />
                Sedang memproses…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileType2Icon className="w-4 h-4" />
                Konversi ke Word
              </span>
            )}
          </Button>

          {quotaBlocked && <QuotaLimitCta />}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          File hanya dipakai untuk konversi ini dan dihapus otomatis.{" "}
          <Link
            href={ROUTES.POLICY}
            className="font-bold underline underline-offset-2 hover:text-foreground"
          >
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
}

function QuotaLimitCta() {
  return (
    <div className="space-y-2 rounded-xl border-2 border-foreground bg-background px-4 py-3">
      <p className="text-sm font-bold">Kuota gratis Anda sudah habis</p>
      <p className="text-xs text-muted-foreground">
        Masuk dengan akun CIVITA atau lihat produk digital untuk mendapatkan
        kuota tambahan.
      </p>
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <SignInButton mode="modal">
          <Button type="button" variant="outline" size="sm">
            Masuk ke akun
          </Button>
        </SignInButton>
        <Link href="/#products">
          <Button type="button" variant="outline" size="sm">
            Lihat produk digital
          </Button>
        </Link>
      </div>
    </div>
  );
}
