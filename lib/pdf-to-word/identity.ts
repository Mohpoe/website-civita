import { currentUser } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { sql } from "@/lib/utils";
import { PDF_TO_WORD_GUEST_COOKIE } from "./config";

export type PdfToWordIdentity = {
  kind: "admin" | "buyer" | "user" | "guest";
  ownerKind: "guest" | "user";
  ownerId: string;
  ip: string;
  ipHash: string;
  label?: string;
};

function hashIp(ip: string): string {
  const salt =
    process.env.PDF_TO_WORD_IP_SALT ||
    process.env.CLERK_SECRET_KEY ||
    "civita-pdf-to-word";

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
}

export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");

  if (forwarded) return forwarded.split(",")[0].trim();

  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Tentukan siapa yang sedang memakai tool dan berapa kuotanya.
 *
 * Tamu dikenali lewat cookie httpOnly. Cookie ini hanya identitas kuota, bukan
 * data pribadi, dan tidak dipakai untuk melacak aktivitas lain.
 */
export async function getIdentity(): Promise<PdfToWordIdentity> {
  const ip = await getClientIp();
  const ipHash = hashIp(ip);
  const user = await currentUser();

  if (user) {
    const role = user.publicMetadata.role as string | undefined;
    const isAdmin = role === "admin" || role === "superadmin";
    let kind: PdfToWordIdentity["kind"] = isAdmin ? "admin" : "user";

    if (!isAdmin) {
      try {
        const rows = (await sql`
          SELECT 1 AS purchased
          FROM orders
          WHERE user_id = ${user.id} AND status = 'success'
          LIMIT 1
        `) as { purchased: number }[];

        if (rows.length > 0) kind = "buyer";
      } catch (error) {
        // Kalau database sedang bermasalah, jangan turunkan hak user yang sudah
        // membeli; cukup catat dan lanjut dengan kuota user biasa.
        console.warn(
          "[pdf-to-word] gagal memeriksa status pembeli:",
          (error as Error).message,
        );
      }
    }

    return {
      kind,
      ownerKind: "user",
      ownerId: user.id,
      ip,
      ipHash,
      label: user.emailAddresses[0]?.emailAddress,
    };
  }

  const cookieStore = await cookies();
  const existing = cookieStore.get(PDF_TO_WORD_GUEST_COOKIE)?.value;
  let guestId = existing && /^[a-z0-9-]{20,64}$/i.test(existing) ? existing : null;

  if (!guestId) {
    guestId = randomUUID();
    cookieStore.set({
      name: PDF_TO_WORD_GUEST_COOKIE,
      value: guestId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return {
    kind: "guest",
    ownerKind: "guest",
    ownerId: guestId,
    ip,
    ipHash,
  };
}
