"use client";

import { ServiceResultPanel } from "@/components/services/service-result-panel";
import { ServiceStatusBadge } from "@/components/services/service-status-badge";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";
import { toast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { cn, formatFileSize, formatRupiah, sanitizeFileName } from "@/lib/utils";
import type { ServiceAttachment, ServiceMessage, ServiceOrder } from "@/types/global";
import { uploadPresigned } from "@vercel/blob/client";
import {
  CheckCircle2Icon,
  CreditCardIcon,
  DownloadIcon,
  FileTextIcon,
  LanguagesIcon,
  Loader2Icon,
  MailIcon,
  MessageSquareIcon,
  PaperclipIcon,
  SendIcon,
  XIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ServiceOrderRoomProps {
  order: ServiceOrder;
  initialMessages: ServiceMessage[];
  attachments: ServiceAttachment[];
  viewer: "user" | "admin";
}

interface PendingChatFile {
  name: string;
  size: number;
  url: string;
}

const MAX_CHAT_FILE_SIZE = 15 * 1024 * 1024;

function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(
      new Date(value),
    );
  } catch {
    return "";
  }
}

function languageName(code: string): string {
  if (code === "en") return "English";
  if (code === "id") return "Bahasa Indonesia";
  return code.toUpperCase();
}

function whatsappHref(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function ServiceOrderRoom({
  order,
  initialMessages,
  attachments,
  viewer,
}: ServiceOrderRoomProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ServiceMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [chatFile, setChatFile] = useState<PendingChatFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastCountRef = useRef(initialMessages.length);
  const isAdmin = viewer === "admin";

  // Polling ringan tiap 3 detik; cukup untuk volume chat layanan jasa.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/service-orders/${encodeURIComponent(order.order_id)}/messages`,
          { cache: "no-store" },
        );
        if (!response.ok) return;

        const data = (await response.json()) as { messages?: ServiceMessage[] };
        if (!cancelled && Array.isArray(data.messages)) {
          setMessages(data.messages);

          // Pesan admin bisa menandai hasil sudah dikirim. Muat ulang data
          // server agar tombol unduh dan status ikut segar tanpa reload manual.
          if (data.messages.length > lastCountRef.current) {
            lastCountRef.current = data.messages.length;
            router.refresh();
          }
        }
      } catch {
        // Abaikan gangguan jaringan sesaat; polling berikutnya akan mencoba lagi.
      }
    };

    const timer = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [order.order_id, router]);

  useEffect(() => {
    const element = listRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  const uploadChatFile = async (file: File) => {
    if (file.size > MAX_CHAT_FILE_SIZE) {
      toast.add({ type: "error", description: "Ukuran berkas maksimal 15 MB." });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const blob = await uploadPresigned(
        `service-chat/${sanitizeFileName(file.name)}`,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/upload/service",
          onUploadProgress: (event) => {
            setUploadProgress(Math.round((event.loaded / Math.max(event.total, 1)) * 100));
          },
        },
      );

      setChatFile({ name: file.name, size: file.size, url: blob.url });
    } catch (error) {
      console.error(error);
      toast.add({ type: "error", description: "Gagal mengunggah lampiran. Coba lagi." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    const text = body.trim();
    if ((!text && !chatFile) || isSending || isUploading) return;

    setIsSending(true);
    try {
      const response = await fetch(
        `/api/service-orders/${encodeURIComponent(order.order_id)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: text,
            attachment: chatFile
              ? { url: chatFile.url, name: chatFile.name, size: chatFile.size }
              : undefined,
          }),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        message?: ServiceMessage;
        error?: string;
      };

      if (!response.ok || !data.message) {
        toast.add({ type: "error", description: data.error || "Gagal mengirim pesan." });
        return;
      }

      setMessages((previous) => [...previous, data.message as ServiceMessage]);
      lastCountRef.current += 1;
      setBody("");
      setChatFile(null);
    } catch {
      toast.add({ type: "error", description: "Gagal mengirim pesan. Periksa koneksi." });
    } finally {
      setIsSending(false);
    }
  };

  const payNow = async () => {
    setIsPaying(true);
    try {
      const response = await fetch("/api/checkout/service/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.order_id }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };

      if (!response.ok || !data.token) {
        toast.add({ type: "error", description: data.error || "Gagal memulai pembayaran." });
        return;
      }

      if (!window.snap) {
        toast.add({
          type: "error",
          description: "Pembayaran belum siap. Muat ulang halaman lalu coba lagi.",
        });
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: () => router.refresh(),
        onPending: () => router.refresh(),
        onError: () => toast.add({ type: "error", description: "Pembayaran gagal." }),
        onClose: () => router.refresh(),
      });
    } catch {
      toast.add({ type: "error", description: "Gagal terhubung ke layanan pembayaran." });
    } finally {
      setIsPaying(false);
    }
  };

  const isPending = order.status === "pending" || order.status === "challenge";
  const hasResult = order.status === "success" && !!order.result_file_url;
  const waHref = order.whatsapp ? whatsappHref(order.whatsapp) : "";

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:items-start xl:gap-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <CardTitle className="truncate">{order.service_name}</CardTitle>
                <CardDescription className="mt-1 font-mono text-[11px]">
                  {order.order_id}
                </CardDescription>
              </div>
              <ServiceStatusBadge status={order.status} />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="mt-1 font-bold">{formatRupiah(Number(order.amount))}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Bahasa</p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-semibold">
                  <LanguagesIcon className="size-4" /> {languageName(order.language)}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Dibuat</p>
                <p className="mt-1 text-sm font-semibold">{formatDateTime(order.created_at)}</p>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MailIcon className="size-3.5 shrink-0" />
                  <span className="truncate text-foreground">
                    {order.email || "Email tidak tersedia"}
                  </span>
                </span>
                {order.whatsapp ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap font-medium text-foreground underline underline-offset-4"
                  >
                    <MessageSquareIcon className="size-3.5" /> WhatsApp {order.whatsapp}
                  </a>
                ) : (
                  <span>WhatsApp tidak tersedia</span>
                )}
              </div>
            ) : null}

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Brief
              </p>
              <p className="whitespace-pre-wrap rounded-lg border bg-muted/20 p-3 text-sm leading-relaxed">
                {order.brief || "Tidak ada brief."}
              </p>
            </div>

            {order.admin_notes ? (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Catatan admin
                </p>
                <p className="whitespace-pre-wrap rounded-lg border bg-muted/20 p-3 text-sm leading-relaxed">
                  {order.admin_notes}
                </p>
              </div>
            ) : null}

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Lampiran
              </p>
              {attachments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {attachments.map((attachment) => (
                    <Attachment key={attachment.id} size="sm" className="w-full">
                      <AttachmentMedia>
                        <FileTextIcon />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>
                          {attachment.file_name || "Lampiran"}
                        </AttachmentTitle>
                        <AttachmentDescription>
                          {formatFileSize(attachment.file_size ?? 0) || "Berkas pendukung"}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          nativeButton={false}
                          render={
                            <a
                              href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}&attachmentId=${encodeURIComponent(attachment.id)}`}
                              aria-label={`Unduh ${attachment.file_name || "lampiran"}`}
                            />
                          }
                        >
                          <DownloadIcon />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </div>
              ) : order.source_file_url ? (
                <a
                  href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}&file=source`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <PaperclipIcon className="size-3.5" /> Lampiran klien
                </a>
              ) : (
                <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                  Tidak ada lampiran.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {hasResult ? (
                <a
                  href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}`}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                >
                  <DownloadIcon className="size-3.5" /> Unduh berkas hasil
                </a>
              ) : null}

              {!isAdmin && isPending ? (
                <Button size="sm" onClick={payNow} disabled={isPaying}>
                  {isPaying ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <CreditCardIcon className="size-3.5" />
                  )}
                  {isPaying ? "Menyiapkan..." : "Bayar sekarang"}
                </Button>
              ) : null}

              {!isAdmin && order.status === "success" && !hasResult ? (
                <p className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground">
                  <FileTextIcon className="size-3.5" /> Menunggu admin mengirim hasil.
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2Icon className="size-3.5" />
                {order.delivered_at
                  ? `Hasil dikirim ${formatDateTime(order.delivered_at)}`
                  : order.status === "success"
                    ? "Pembayaran diterima, menunggu hasil"
                    : "Menunggu pembayaran"}
              </span>
              <Link
                href={isAdmin ? "/dashboard/admin/services" : ROUTES.DASHBOARD.ORDER_SERVICES}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Kembali
              </Link>
            </div>
          </CardContent>
        </Card>

        {isAdmin ? <ServiceResultPanel order={order} /> : null}
      </div>

      <div className="xl:sticky xl:top-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="size-5" /> Diskusi &amp; Revisi
            </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Balas klien & kabari progres di sini."
              : "Tanya progres & minta revisi di sini."}
          </CardDescription>
          <CardDescription className="text-[11px]">
            Balasan muncul otomatis · lampiran maks. 15 MB
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div
            ref={listRef}
            className="dialog-scroll flex h-[360px] flex-col gap-3 overflow-y-auto rounded-lg border bg-muted/20 p-3 xl:h-[calc(100dvh-21rem)] xl:min-h-[320px] xl:max-h-[620px]"
          >
            {messages.length === 0 ? (
              <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
                Belum ada pesan. {isAdmin ? "Sapa klien untuk memulai." : "Sapa admin untuk mulai."}
              </p>
            ) : (
              <MessageGroup className="mt-auto">
                {messages.map((message) => {
                  const own = message.sender_role === viewer;
                  const fromAdmin = message.sender_role === "admin";
                  const senderLabel = fromAdmin ? "Admin" : "Klien";

                  return (
                    <Message key={message.id} align={own ? "end" : "start"}>
                      <MessageAvatar>
                        <Avatar>
                          <AvatarFallback
                            className={cn(
                              "text-xs font-bold",
                              fromAdmin && "bg-foreground text-background",
                            )}
                          >
                            {fromAdmin ? "AD" : "KL"}
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>

                      <MessageContent>
                        <MessageHeader>{own ? "Anda" : senderLabel}</MessageHeader>

                        {message.body ? (
                          <Bubble
                            align={own ? "end" : "start"}
                            variant={own ? "default" : "outline"}
                          >
                            <BubbleContent className="whitespace-pre-wrap">
                              {message.body}
                            </BubbleContent>
                          </Bubble>
                        ) : null}

                        {message.attachment_url ? (
                          <Attachment size="sm" className="w-full max-w-sm">
                            <AttachmentMedia>
                              <FileTextIcon />
                            </AttachmentMedia>
                            <AttachmentContent>
                              <AttachmentTitle>
                                {message.attachment_name || "Lampiran"}
                              </AttachmentTitle>
                              <AttachmentDescription>
                                {formatFileSize(message.attachment_size ?? 0) || "Berkas lampiran"}
                              </AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                              <AttachmentAction
                                nativeButton={false}
                                render={
                                  <a
                                    href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}&messageId=${encodeURIComponent(message.id)}`}
                                    aria-label={`Unduh ${message.attachment_name || "lampiran"}`}
                                  />
                                }
                              >
                                <DownloadIcon />
                              </AttachmentAction>
                            </AttachmentActions>
                          </Attachment>
                        ) : null}

                        <MessageFooter>{formatTime(message.created_at)}</MessageFooter>
                      </MessageContent>
                    </Message>
                  );
                })}
              </MessageGroup>
            )}
          </div>

          {chatFile ? (
            <Attachment size="sm" className="w-full">
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{chatFile.name}</AttachmentTitle>
                <AttachmentDescription>{formatFileSize(chatFile.size)}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label="Hapus lampiran"
                  disabled={isSending}
                  onClick={() => setChatFile(null)}
                >
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ) : null}

          <InputGroup className="items-end">
            <InputGroupTextarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={2}
              maxLength={2000}
              placeholder="Tulis pesan…"
              title="Enter untuk kirim · Shift+Enter baris baru"
              className="min-h-11 py-2.5 leading-6"
            />

            <InputGroupAddon align="inline-end" className="pb-1.5">
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadChatFile(file);
                }}
              />

              <InputGroupButton
                size="icon-sm"
                aria-label="Lampirkan berkas"
                title="Lampirkan berkas (maks. 15 MB)"
                disabled={isUploading || isSending}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PaperclipIcon />
                )}
              </InputGroupButton>

              <InputGroupButton
                variant="default"
                size="icon-sm"
                aria-label="Kirim pesan"
                disabled={isSending || isUploading || (!body.trim() && !chatFile)}
                onClick={() => void sendMessage()}
              >
                {isSending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <p className="text-[11px] text-muted-foreground">
            {isUploading
              ? `Mengunggah lampiran... ${uploadProgress}%`
              : chatFile
                ? "Lampiran siap dikirim · maks. 15 MB"
                : "Enter kirim · Shift+Enter baris baru"}
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
