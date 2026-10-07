import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");

  const user = await currentUser();
  if (!user) return NextResponse.json("Unauthorized", { status: 401 });

  if (!pathname) { return NextResponse.json({ error: "Tidak ada pathname" }, { status: 400 }) }

  try {
    const result = await get(pathname, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });

    if (result?.statusCode !== 200) {
      return new NextResponse("Tidak ditemukan", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new NextResponse("Tidak ditemukan", { status: 404 });
  }
}