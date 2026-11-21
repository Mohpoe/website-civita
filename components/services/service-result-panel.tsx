"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { attachServiceResultAction, deleteServiceResultAction } from "@/lib/actions/services";
import { sanitizeFileName } from "@/lib/utils";
import type { ServiceOrder } from "@/types/global";
import { uploadPresigned } from "@vercel/blob/client";
import {
  DownloadIcon,
  FileUpIcon,
  Loader2Icon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";

export function ServiceResultPanel({ order }: { order: ServiceOrder }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(attachServiceResultAction, null);

  const [fileUrl, setFileUrl] = useState(order.result_file_url ?? "");
  const [fileName, setFileName] = useState(order.result_file_name ?? "");
  const [notes, setNotes] = useState(order.admin_notes ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeleting, startDelete] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.add({ type: "success", description: state.message });
      router.refresh();
    } else {
      toast.add({ type: "error", description: state.message, priority: "high" });
    }
  }, [state, router]);

  const handleUpload = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      toast.add({ type: "error", description: "Ukuran berkas maksimal 15 MB." });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const blob = await uploadPresigned(`service-result/${sanitizeFileName(file.name)}`, file, {
        access: "private",
        handleUploadUrl: "/api/upload/service",
        onUploadProgress: (event) => {
          setProgress(Math.round((event.loaded / Math.max(event.total, 1)) * 100));
        },
      });

      setFileUrl(blob.url);
      setFileName(file.name);
      toast.add({ type: "success", description: "Berkas terunggah. Klik kirim untuk memberi tahu klien." });
    } catch (error) {
      console.error(error);
      toast.add({ type: "error", description: "Gagal mengunggah berkas. Coba lagi." });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    startDelete(async () => {
      const result = await deleteServiceResultAction(order.order_id);
      if (result.success) {
        setFileUrl("");
        setFileName("");
        toast.add({ type: "success", description: result.message });
        router.refresh();
      } else {
        toast.add({ type: "error", description: result.message, priority: "high" });
      }
    });
  };

  const paid = order.status === "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloudIcon className="size-5" /> Kirim Berkas Hasil
        </CardTitle>
        <CardDescription>
          Unggah berkas hasil akhir. Klien hanya bisa mengunduhnya setelah pembayaran lunas.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!paid ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Pesanan belum dibayar. Hasil belum bisa dikirim sampai pembayaran diterima.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="orderId" value={order.order_id} />
            <input type="hidden" name="resultFileUrl" value={fileUrl} />
            <input type="hidden" name="resultFileName" value={fileName} />

            <FieldGroup>
              <Field>
                <FieldLabel>Berkas hasil</FieldLabel>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-sm transition-colors hover:bg-muted/50"
                >
                  {isUploading ? (
                    <>
                      <Loader2Icon className="size-7 animate-spin" />
                      Mengunggah... {progress}%
                    </>
                  ) : fileUrl ? (
                    <>
                      <FileUpIcon className="size-7 text-emerald-600" />
                      <span className="font-medium">{fileName || "Berkas siap dikirim"}</span>
                      <span className="text-xs text-muted-foreground">
                        Klik untuk mengganti berkas
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon className="size-7" />
                      Klik untuk memilih berkas (PDF/DOC/ZIP, maks. 15 MB)
                    </>
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUpload(file);
                  }}
                />
                {order.result_file_url ? (
                  <FieldDescription>
                    Sudah ada berkas terkirim.{" "}
                    <a
                      href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}`}
                      className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
                    >
                      <DownloadIcon className="size-3" /> Unduh versi saat ini
                    </a>
                  </FieldDescription>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="adminNotes">Catatan untuk klien</FieldLabel>
                <Textarea
                  id="adminNotes"
                  name="adminNotes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Mis. CV sudah selesai, silakan cek dan kabari kalau ada yang ingin direvisi."
                />
              </Field>
            </FieldGroup>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {order.result_file_url ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending || isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-4" />
                  )}
                  Hapus hasil
                </Button>
              ) : null}
              <Button type="submit" disabled={isPending || isUploading || !fileUrl}>
                {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <UploadCloudIcon className="size-4" />}
                Kirim ke klien
              </Button>
            </div>
          </form>
        )}

        <Field className="mt-4">
          <FieldLabel htmlFor="adminNotesReadOnly">Brief klien</FieldLabel>
          <Textarea
            id="adminNotesReadOnly"
            readOnly
            rows={4}
            value={order.brief || "Klien tidak menuliskan brief."}
          />
          <FieldDescription>Data ini disalin saat pesanan dibuat dan tidak berubah.</FieldDescription>
        </Field>
      </CardContent>
    </Card>
  );
}
