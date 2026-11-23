"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { cn, formatRupiah, sanitizeFileName } from "@/lib/utils";
import type { Service } from "@/types/global";
import { uploadPresigned } from "@vercel/blob/client";
import {
  CheckIcon,
  CreditCardIcon,
  FileUpIcon,
  Loader2Icon,
  PaperclipIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export function ServiceOrderForm({
  services,
  initialServiceSlug,
}: {
  services: Service[];
  initialServiceSlug?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial =
    services.find((service) => service.slug === initialServiceSlug) ?? services[0];

  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const [language, setLanguage] = useState(initial?.languages[0] ?? "id");
  const [brief, setBrief] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = services.find((service) => service.id === selectedId) ?? initial;

  const chooseService = (service: Service) => {
    setSelectedId(service.id);
    if (!service.languages.includes(language)) {
      setLanguage(service.languages[0] ?? "id");
    }
  };

  const pickFile = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      toast.add({ type: "error", description: "Ukuran lampiran maksimal 15 MB." });
      return;
    }
    setFile(nextFile);
  };

  const submit = async () => {
    if (!selected || isSubmitting || isUploading) return;

    if (brief.trim().length < 10) {
      toast.add({
        type: "error",
        description: "Ceritakan kebutuhanmu minimal 10 karakter.",
        priority: "high",
      });
      return;
    }

    setIsSubmitting(true);
    let sourceFileUrl = "";
    let sourceFileName = "";

    try {
      if (file) {
        setIsUploading(true);
        setProgress(0);
        const blob = await uploadPresigned(
          `service-source/${sanitizeFileName(file.name)}`,
          file,
          {
            access: "private",
            handleUploadUrl: "/api/upload/service",
            onUploadProgress: (event) => {
              setProgress(Math.round((event.loaded / Math.max(event.total, 1)) * 100));
            },
          },
        );
        sourceFileUrl = blob.url;
        sourceFileName = file.name;
        setIsUploading(false);
      }

      const response = await fetch("/api/checkout/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selected.id,
          language,
          brief: brief.trim(),
          sourceFileUrl,
          sourceFileName,
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

      if (!window.snap) {
        toast.add({
          type: "success",
          description: "Pesanan dibuat. Selesaikan pembayaran dari halaman pesanan.",
        });
        router.push(detailUrl);
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => {
          toast.add({ type: "success", description: "Pembayaran berhasil. Admin segera mengerjakan." });
          router.push(detailUrl);
        },
        onPending: () => {
          toast.add({
            type: "info",
            description: "Pembayaran menunggu penyelesaian. Cek halaman pesanan.",
          });
          router.push(detailUrl);
        },
        onError: () => {
          toast.add({
            type: "error",
            description: "Pembayaran gagal. Pesanan tetap tersimpan dan bisa dibayar ulang.",
            priority: "high",
          });
          router.push(detailUrl);
        },
        onClose: () => router.push(detailUrl),
      });
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        description: "Terjadi kesalahan saat memproses pesanan. Coba lagi.",
        priority: "high",
      });
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr] xl:gap-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pilih layanan</CardTitle>
            <CardDescription>
              Harga tetap per layanan. Semua dikerjakan custom dari data yang kamu kirim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {services.map((service) => {
                const active = service.id === selectedId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => chooseService(service)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition-colors",
                      active
                        ? "border-foreground bg-muted/50"
                        : "border-border bg-background hover:bg-muted/30",
                    )}
                  >
                    <span className="flex w-full items-start justify-between gap-2">
                      <span className="text-sm font-semibold">{service.name}</span>
                      {active ? <CheckIcon className="mt-0.5 size-4 shrink-0" /> : null}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatRupiah(service.price)}</span>
                    <span className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {service.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail kebutuhan</CardTitle>
            <CardDescription>
              Semakin lengkap, semakin cepat admin menyusun berkas yang tepat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Bahasa berkas</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {(selected?.languages ?? ["id"]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code)}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors",
                        language === code
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      {code === "id" ? "Bahasa Indonesia" : "English"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="brief">Ceritakan kebutuhanmu</FieldLabel>
                <Textarea
                  id="brief"
                  value={brief}
                  onChange={(event) => setBrief(event.target.value)}
                  rows={6}
                  maxLength={5000}
                  placeholder="Mis. Saya melamar posisi Digital Marketing di PT ABC. Pengalaman 3 tahun di agency, ingin CV ATS satu halaman plus surat lamaran."
                />
                <FieldDescription>
                  Minimal 10 karakter. Sebutkan posisi, perusahaan, dan hal yang ingin ditonjolkan.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Lampiran (opsional)</FieldLabel>
                {file ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <PaperclipIcon className="size-4 shrink-0" />
                      <span className="truncate">{file.name}</span>
                      {isUploading ? (
                        <span className="shrink-0 text-xs text-muted-foreground">{progress}%</span>
                      ) : null}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      disabled={isSubmitting}
                      onClick={() => pickFile(null)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
                  >
                    <FileUpIcon className="size-5" /> Unggah CV lama / portofolio (maks. 15 MB)
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                  onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
            <CardDescription>Pembayaran aman lewat Midtrans.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Layanan</span>
                <span className="text-right font-medium">{selected?.name ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Bahasa</span>
                <span className="font-medium">{language === "id" ? "Indonesia" : "English"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="text-lg font-bold">
                  {selected ? formatRupiah(selected.price) : "-"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={submit}
              disabled={!selected || isSubmitting || isUploading}
              className="w-full"
            >
              {isSubmitting || isUploading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <CreditCardIcon className="size-4" />
              )}
              {isUploading
                ? `Mengunggah... ${progress}%`
                : isSubmitting
                  ? "Memproses..."
                  : "Bayar dengan Midtrans"}
            </Button>

            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
              Data hanya dipakai untuk menyusun berkas lamaranmu. Berkas hasil dikirim lewat
              tautan pribadi yang hanya bisa diakses pemilik pesanan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
