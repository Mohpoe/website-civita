import { getServiceAccess, readServiceMessages } from "@/lib/service-access";
import { sql } from "@/lib/utils";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

interface MessageAttachmentInput {
  url: string;
  name: string;
  size: number;
}

/** Lampiran chat wajib berasal dari folder `service-chat/` di PRIVATE_BLOB. */
function parseAttachment(raw: unknown): MessageAttachmentInput | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url : "";

  try {
    const parsed = new URL(url);
    const isPrivateBlob =
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".private.blob.vercel-storage.com");
    if (!isPrivateBlob || !parsed.pathname.startsWith("/service-chat/")) return null;

    const name = typeof record.name === "string" ? record.name.trim().slice(0, 200) : "";
    const size = Number(record.size);

    return {
      url,
      name: name || "Lampiran",
      size: Number.isFinite(size) && size > 0 ? Math.round(size) : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Chat in-app pesanan jasa.
 *
 * Klien melakukan polling GET tiap 3 detik, sedangkan POST dipakai untuk
 * mengirim pesan (teks dan/atau satu lampiran). Hak akses selalu dicek ulang
 * di server: pemilik pesanan dan admin/superadmin saja.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const { orderId } = await params;
  const access = await getServiceAccess(orderId);

  if (!access) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const messages = await readServiceMessages(orderId);

  return NextResponse.json({ messages, role: access.role });
}

export async function POST(req: Request, { params }: RouteContext) {
  const { orderId } = await params;
  const access = await getServiceAccess(orderId);

  if (!access) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const payload = await req.json().catch(() => null);
  const body = typeof payload?.body === "string" ? payload.body.trim().slice(0, 2000) : "";
  const attachment = parseAttachment(payload?.attachment);

  if (!body && !attachment) {
    return NextResponse.json(
      { error: "Pesan tidak boleh kosong." },
      { status: 400 },
    );
  }

  if (payload?.attachment && !attachment) {
    return NextResponse.json({ error: "Lampiran tidak valid." }, { status: 400 });
  }

  try {
    const rows = (await sql`
      INSERT INTO service_messages (
        id, order_id, sender_id, sender_role, body,
        attachment_url, attachment_name, attachment_size
      )
      VALUES (
        ${randomUUID()}, ${orderId}, ${access.userId}, ${access.role}, ${body},
        ${attachment?.url ?? null}, ${attachment?.name ?? null},
        ${attachment && attachment.size > 0 ? attachment.size : null}
      )
      RETURNING id, order_id, sender_id, sender_role, body,
                attachment_url, attachment_name,
                attachment_size::int AS attachment_size, created_at
    `) as {
      id: string;
      order_id: string;
      sender_id: string;
      sender_role: "user" | "admin";
      body: string;
      attachment_url: string | null;
      attachment_name: string | null;
      attachment_size: number | null;
      created_at: string;
    }[];

    return NextResponse.json({ message: rows[0] });
  } catch (error) {
    console.error("Gagal mengirim pesan pesanan jasa:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
