import { clerkClient } from '@clerk/nextjs/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  // 1. Ambil CLERK_WEBHOOK_SECRET dari environment variable
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Tolong tambahkan CLERK_WEBHOOK_SECRET dari Clerk Dashboard ke file .env');
  }

  // 2. Ambil headers untuk verifikasi keamanan dari Svix
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- tidak ada headers svix', { status: 400 });
  }

  // 3. PERBAIKAN KRITIS: Ambil body secara MENTAH (Raw Text), jangan di .json()
  const body = await req.text();

  // 4. Verifikasi signature webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    // Verifikasi menggunakan body mentah
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error('Error memverifikasi webhook:', err);
    return new Response('Verifikasi Gagal', { status: 400 });
  }

  // Setelah melewati try-catch, artinya request ini 100% aman dan valid dari Clerk.

  // 5. Parse kembali raw body (teks) tadi menjadi JSON agar bisa kita baca datanya
  const payloadJson = JSON.parse(body);
  const eventType = payloadJson.type;

  if (eventType === 'user.created') {
    // Ambil ID dari object data di dalam payload JSON
    const { id } = payloadJson.data;

    try {
      // Inisialisasi client Clerk
      const client = await clerkClient();

      // 6. Update user baru tersebut dengan role: "user"
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: 'user',
        },
      });

      console.log(`Role 'user' berhasil diberikan ke ID: ${id}`);
      return new Response('User role updated successfully', { status: 200 });
    } catch (error) {
      console.error('Gagal update user metadata:', error);
      return new Response('Error updating metadata', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}