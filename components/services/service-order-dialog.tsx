"use client";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { MIDTRANS_SNAP_JS_URL } from "@/lib/midtrans";
import { formatFileSize, formatRupiah, sanitizeFileName } from "@/lib/utils";
import type { Service } from "@/types/global";
import { uploadPresigned } from "@vercel/blob/client";
import {
  AlertTriangleIcon,
  CheckIcon,
  CreditCardIcon,
  FileTextIcon,
  FileUpIcon,
  LanguagesIcon,
  Loader2Icon,
  MessageSquareIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx", "zip", "png", "jpg", "jpeg"];

const LANGUAGE_LABELS: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

interface PendingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  url?: string;
  error?: boolean;
}

function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

function newFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isAcceptedFile(file: File): boolean {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.includes(extension);
}

export function ServiceOrderDialog({
  service,
  open,
  onOpenChange,
}: {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [whatsapp, setWhatsapp] = useState("");
  const [language, setLanguage] = useState(service.languages[0] ?? "id");
  const [brief, setBrief] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapState, setSnapState] = useState<"loading" | "ready" | "error">("loading");

  const price = service.prices[language] ?? service.price;
  const isBusy = isSubmitting;

  // Snap.js dimuat hanya saat dialog dibuka. Tombol bayar baru aktif setelah
  // script benar-benar siap supaya pembayaran tidak pernah "setengah jalan".
  useEffect(() => {
    if (!open) return;

    // Kalau Snap sudah termuat dari kunjungan sebelumnya, interval ini yang
    // menandainya siap (tanpa setState sinkron di body effect).
    const timer = window.setInterval(() => {
      if (window.snap) {
        setSnapState("ready");
        window.clearInterval(timer);
      }
    }, 300);

    return () => {
      window.clearInterval(timer);
    };
  }, [open]);

  const addFiles = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;

    const incoming = Array.from(selected);
    const accepted: PendingFile[] = [];
    let rejected = 0;

    for (const file of incoming) {
      if (files.length + accepted.length >= MAX_FILES) {
        toast.add({
          type: "error",
          description: `Maksimal ${MAX_FILES} berkas lampiran.`,
          priority: "high",
        });
        break;
      }
      if (!isAcceptedFile(file)) {
        rejected += 1;
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.add({
          type: "error",
          description: `${file.name} melebihi 15 MB.`,
          priority: "high",
        });
        continue;
      }

      accepted.push({
        id: newFileId(),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
      });
    }

    if (rejected > 0) {
      toast.add({
        type: "error",
        description: "Format berkas harus PDF, DOC, DOCX, ZIP, JPG, atau PNG.",
        priority: "high",
      });
    }

    if (accepted.length > 0) {
      setFiles((previous) => [...previous, ...accepted]);
    }
  };

  const removeFile = (id: string) => {
    if (isBusy) return;
    setFiles((previous) => previous.filter((item) => item.id !== id));
  };

  const updateFile = (id: string, patch: Partial<PendingFile>) => {
    setFiles((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const uploadFiles = async (): Promise<{ url: string; name: string; size: number }[]> => {
    const pending = files.filter((item) => !item.url);
    const uploaded = await Promise.all(
      pending.map(async (item) => {
        try {
          const blob = await uploadPresigned(
            `service-source/${sanitizeFileName(item.name)}`,
            item.file,
            {
              access: "private",
              handleUploadUrl: "/api/upload/service",
              onUploadProgress: (event) => {
                updateFile(item.id, {
                  progress: Math.round((event.loaded / Math.max(event.total, 1)) * 100),
                });
              },
            },
          );

          updateFile(item.id, { url: blob.url, progress: 100 });
          return { url: blob.url, name: item.name, size: item.size };
        } catch (error) {
          console.error(error);
          updateFile(item.id, { error: true, progress: 0 });
          throw new Error(`Gagal mengunggah ${item.name}.`);
        }
      }),
    );

    const existing = files
      .filter((item) => item.url)
      .map((item) => ({ url: item.url as string, name: item.name, size: item.size }));

    return [...existing, ...uploaded];
  };

  const submit = async () => {
    if (isSubmitting) return;

    if (brief.trim().length < 10) {
      toast.add({
        type: "error",
        description: "Ceritakan kebutuhanmu minimal 10 karakter.",
        priority: "high",
      });
      return;
    }

    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 8) {
      toast.add({
        type: "error",
        description: "Nomor WhatsApp wajib diisi dengan benar.",
        priority: "high",
      });
      return;
    }

    if (snapState !== "ready" || !window.snap) {
      toast.add({
        type: "error",
        description: "Pembayaran belum siap. Tunggu sebentar lalu coba lagi.",
        priority: "high",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const attachments = await uploadFiles();

      const response = await fetch("/api/checkout/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          language,
          brief: brief.trim(),
          whatsapp,
          attachments,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        token?: string;
        orderId?: string;
        error?: string;
      };

      if (!response.ok || !data.token || !data.orderId) {
        toast.add({
          type: "error",
          description: data.error || "Gagal membuat pesanan.",
          priority: "high",
        });
        return;
      }

      const detailUrl = `${ROUTES.DASHBOARD.ORDER_SERVICES}/${data.orderId}`;
      const goToRoom = () => {
        onOpenChange(false);
        router.push(detailUrl);
        router.refresh();
      };

      window.snap.pay(data.token, {
        onSuccess: () => {
          toast.add({
            type: "success",
            description: "Pembayaran berhasil. Admin segera mengerjakan pesananmu.",
          });
          goToRoom();
        },
        onPending: () => {
          toast.add({
            type: "info",
            description: "Pembayaran menunggu penyelesaian. Cek ruang pesanan.",
          });
          goToRoom();
        },
        onError: () => {
          toast.add({
            type: "error",
            description: "Pembayaran gagal. Pesanan tersimpan dan bisa dibayar ulang di ruang pesanan.",
            priority: "high",
          });
          goToRoom();
        },
        onClose: goToRoom,
      });
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Terjadi kesalahan saat memproses pesanan. Coba lagi.",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {open ? (
        <Script
          src={MIDTRANS_SNAP_JS_URL}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
          onReady={() => setSnapState("ready")}
          onError={() => setSnapState("error")}
        />
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && isBusy) return;
          onOpenChange(next);
        }}
      >
        <DialogContent
          className="w-full sm:max-w-2xl"
          showCloseButton={!isSubmitting}
        >
          <DialogHeader>
            <DialogTitle>Pesan {service.name}</DialogTitle>
            <DialogDescription>
              Lengkapi data di bawah. Setelah pesanan dibuat, kamu bisa menjelaskan detail
              tambahan lewat ruang obrolan pesanan.
            </DialogDescription>
          </DialogHeader>

          <Separator className="py-0" />

          <form
            id="serviceOrderForm"
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="orderWhatsapp">Nomor WhatsApp</FieldLabel>
                <Input
                  id="orderWhatsapp"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="0812xxxxxxx"
                  required
                />
                <FieldDescription>
                  Dipakai admin hanya jika ada hal penting soal pesananmu.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Bahasa berkas</FieldLabel>
                <div
                  role="radiogroup"
                  aria-label="Bahasa berkas"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {service.languages.map((code) => {
                    const active = language === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setLanguage(code)}
                        className={
                          active
                            ? "flex items-center justify-between gap-2 rounded-md border-2 border-foreground bg-muted/60 px-3 py-2.5 text-left"
                            : "flex items-center justify-between gap-2 rounded-md border-2 border-border px-3 py-2.5 text-left hover:bg-muted/40"
                        }
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <LanguagesIcon className="size-4 shrink-0" />
                          <span className="truncate text-sm font-medium">{languageLabel(code)}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                          {formatRupiah(service.prices[code] ?? service.price)}
                          {active ? <CheckIcon className="size-4" /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="orderBrief">Ceritakan kebutuhanmu</FieldLabel>
                <Textarea
                  id="orderBrief"
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="Mis. Saya melamar posisi Digital Marketing di PT ABC. Pengalaman 3 tahun di agency, ingin CV ATS satu halaman plus surat lamaran."
                  required
                />
                <FieldDescription>
                  Minimal 10 karakter. Sebutkan posisi, perusahaan, dan hal yang ingin ditonjolkan.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Lampiran (opsional)</FieldLabel>

                {files.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {files.map((item) => (
                      <Attachment
                        key={item.id}
                        size="sm"
                        state={item.error ? "error" : "idle"}
                        className="w-full"
                      >
                        <AttachmentMedia>
                          <FileTextIcon />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{item.name}</AttachmentTitle>
                          <AttachmentDescription>
                            {formatFileSize(item.size)}
                            {item.progress > 0 && item.progress < 100
                              ? ` · mengunggah ${item.progress}%`
                              : ""}
                            {item.error ? " · gagal diunggah" : ""}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                          <AttachmentAction
                            aria-label={`Hapus ${item.name}`}
                            disabled={isBusy}
                            onClick={() => removeFile(item.id)}
                          >
                            <XIcon />
                          </AttachmentAction>
                        </AttachmentActions>
                      </Attachment>
                    ))}
                  </div>
                ) : null}

                {files.length < MAX_FILES ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
                  >
                    <FileUpIcon className="size-5" />
                    Tambah CV lama / portofolio / berkas pendukung
                  </button>
                ) : null}

                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                <FieldDescription>
                  Maksimal {MAX_FILES} berkas, 15 MB per berkas (PDF, DOC, DOCX, ZIP, JPG, PNG).
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <MessageSquareIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                Ada informasi lain yang ingin dijelaskan lebih detail? Setelah pemesanan,
                gunakan <strong className="text-foreground">ruang obrolan pesanan</strong> untuk
                mengobrol langsung dengan admin, termasuk mengirim berkas tambahan.
              </span>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Layanan</span>
                <span className="text-right font-medium">{service.name}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Bahasa</span>
                <span className="font-medium">{languageLabel(language)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold">{formatRupiah(price)}</span>
              </div>
            </div>

            {snapState === "error" ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  Pembayaran gagal dimuat. Periksa koneksi lalu buka ulang dialog ini.
                </span>
              </div>
            ) : null}

            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
              Pembayaran diproses Midtrans. Berkas hanya dipakai untuk menyusun berkas
              lamaranmu dan hasilnya bisa diunduh dari ruang pesanan.
            </p>
          </form>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="serviceOrderForm"
              disabled={isBusy || snapState !== "ready"}
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <CreditCardIcon className="size-4" />
              )}
              {isSubmitting ? "Memproses..." : `Bayar ${formatRupiah(price)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
