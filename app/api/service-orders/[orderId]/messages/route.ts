import { getServiceAccess, readServiceMessages } from "@/lib/service-access";
import { sql } from "@/lib/utils";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

/**
 * Chat in-app pesanan jasa.
 *
 * Klien melakukan polling GET tiap 3 detik, sedangkan POST dipakai untuk
 * mengirim pesan. Hak akses selalu dicek ulang di server: pemilik pesanan dan
 * admin/superadmin saja.
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

  if (!body) {
    return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  }

  try {
    const rows = (await sql`
      INSERT INTO service_messages (id, order_id, sender_id, sender_role, body)
      VALUES (${randomUUID()}, ${orderId}, ${access.userId}, ${access.role}, ${body})
      RETURNING id, order_id, sender_id, sender_role, body, created_at
    `) as {
      id: string;
      order_id: string;
      sender_id: string;
      sender_role: "user" | "admin";
      body: string;
      created_at: string;
    }[];

    return NextResponse.json({ message: rows[0] });
  } catch (error) {
    console.error("Gagal mengirim pesan pesanan jasa:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
