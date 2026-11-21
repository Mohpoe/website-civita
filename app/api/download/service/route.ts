import { checkRateLimit } from "@/lib/rate-limit";
import { sql } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

// Streaming file privat memakai Edge Runtime seperti unduhan produk digital.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW = 60;
const MAX_REQUESTS_PER_WINDOW = 10;

interface ServiceFileRow {
  user_id: string;
  status: string;
  result_file_url: string | null;
  result_file_name: string | null;
  source_file_url: string | null;
  source_file_name: string | null;
  service_name: string;
}

function safeFileName(order: ServiceFileRow, kind: "source" | "result"): string {
  const fromColumn = (kind === "source" ? order.source_file_name : order.result_file_name) || "";
  const trimmed = fromColumn.trim();
  if (trimmed) {
    return trimmed.replace(/[\\/:*?"<>|]/g, "_");
  }

  const baseName = order.service_name.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${baseName || "Berkas_Pesanan"}${kind === "result" ? "_hasil" : "_lampiran"}.pdf`;
}

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rateLimit = await checkRateLimit(
    `download-service:ratelimit:${user.id}`,
    MAX_REQUESTS_PER_WINDOW,
    RATE_LIMIT_WINDOW,
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan download. Silakan coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(RATE_LIMIT_WINDOW) } },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const kind = searchParams.get("file") === "source" ? "source" : "result";
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const rows = (await sql`
      SELECT user_id, status, result_file_url, result_file_name,
             source_file_url, source_file_name, service_name
      FROM service_orders
      WHERE order_id = ${orderId}
      LIMIT 1
    `) as ServiceFileRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const order = rows[0];
    const role = user.publicMetadata.role as string | undefined;
    const isAdmin = role === "admin" || role === "superadmin";

    if (order.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // Lampiran sumber boleh diunduh sejak pesanan dibuat; berkas hasil baru
    // tersedia setelah pembayaran lunas.
    if (kind === "result" && order.status !== "success") {
      return NextResponse.json(
        { error: "Selesaikan pembayaran terlebih dahulu untuk mengunduh." },
        { status: 403 },
      );
    }

    const fileUrl = kind === "source" ? order.source_file_url : order.result_file_url;

    if (!fileUrl) {
      return NextResponse.json(
        {
          error:
            kind === "source"
              ? "Tidak ada lampiran pada pesanan ini."
              : "Berkas hasil belum tersedia. Admin akan mengunggahnya setelah selesai.",
        },
        { status: 404 },
      );
    }

    const result = await get(fileUrl, {
      access: "private",
      storeId: process.env.PRIVATE_BLOB_STORE_ID,
    });

    if (result?.statusCode !== 200) {
      return new NextResponse("File tidak ditemukan di penyimpanan server", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeFileName(order, kind)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
        "ETag": result.headers.get("etag") || "",
      },
    });
  } catch (error) {
    console.error("Download pesanan jasa error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
