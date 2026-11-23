"use client";

import { ServiceResultPanel } from "@/components/services/service-result-panel";
import { ServiceStatusBadge } from "@/components/services/service-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type { ServiceMessage, ServiceOrder } from "@/types/global";
import { ROUTES } from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";
import {
  CheckCircle2Icon,
  CreditCardIcon,
  DownloadIcon,
  FileTextIcon,
  LanguagesIcon,
  Loader2Icon,
  MessageSquareIcon,
  PaperclipIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ServiceOrderRoomProps {
  order: ServiceOrder;
  initialMessages: ServiceMessage[];
  viewer: "user" | "admin";
}

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

export function ServiceOrderRoom({ order, initialMessages, viewer }: ServiceOrderRoomProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ServiceMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
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

  const sendMessage = async () => {
    const text = body.trim();
    if (!text || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(
        `/api/service-orders/${encodeURIComponent(order.order_id)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
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

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr] xl:gap-6">
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
                  <LanguagesIcon className="size-4" /> {order.language.toUpperCase()}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Dibuat</p>
                <p className="mt-1 text-sm font-semibold">{formatDateTime(order.created_at)}</p>
              </div>
            </div>

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

            <div className="flex flex-wrap gap-2">
              {order.source_file_url ? (
                <a
                  href={`/api/download/service?orderId=${encodeURIComponent(order.order_id)}&file=source`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <PaperclipIcon className="size-3.5" /> Lampiran klien
                </a>
              ) : null}

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
                  <FileTextIcon className="size-3.5" /> Berkas hasil sedang dikerjakan admin.
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
                Kembali ke daftar
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {isAdmin ? <ServiceResultPanel order={order} /> : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="size-5" /> Chat dengan {isAdmin ? "klien" : "admin"}
              </CardTitle>
              <CardDescription>
                Balasan muncul otomatis dalam beberapa detik. WhatsApp tetap tersedia sebagai cadangan.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareIcon className="size-5" /> Ruang Obrolan
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Jawab pertanyaan klien dan kabari progres pengerjaan."
              : "Tanyakan progres atau minta revisi di sini."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div
            ref={listRef}
            className="flex max-h-[420px] min-h-[220px] flex-col gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-3"
          >
            {messages.length === 0 ? (
              <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
                Belum ada pesan. {isAdmin ? "Sapa klien" : "Sapa admin"} untuk memulai.
              </p>
            ) : (
              messages.map((message) => {
                const own = message.sender_role === viewer;
                return (
                  <div
                    key={message.id}
                    className={cn("flex flex-col gap-1", own ? "items-end" : "items-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                        own
                          ? "border-foreground/20 bg-foreground text-background"
                          : "border-border bg-background text-foreground",
                      )}
                    >
                      {message.body}
                    </div>
                    <span className="px-1 text-[10px] text-muted-foreground">
                      {message.sender_role === "admin" ? "Admin" : "Klien"} ·{" "}
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Textarea
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
              placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter baris baru)"
              className="min-h-11 flex-1 resize-none"
            />
            <Button onClick={sendMessage} disabled={isSending || body.trim().length === 0}>
              {isSending ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
              Kirim
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
