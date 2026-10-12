import { currentUser } from '@clerk/nextjs/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const user = await currentUser();
    if (!user) return NextResponse.json("Unauthorized", { status: 401 });
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!user) throw new Error('Not authenticated');

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const { userId } = JSON.parse(tokenPayload || "");
          // Update your database with the blob URL for the authenticated user
        } catch (error) {
          throw new Error("Gagal upload thumbnail!");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}