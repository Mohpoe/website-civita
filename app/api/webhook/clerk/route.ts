import { createClerkClient } from '@clerk/backend';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

// Inisialisasi Clerk Backend SDK
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
  // 1. Ambil CLERK_WEBHOOK_SECRET dari environment variable
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // 2. Ambil headers untuk verifikasi keamanan dari Svix
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // 3. Ambil body request
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Verifikasi signature webhook agar aman
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  // 5. Tangkap event 'user.created' (User baru mendaftar)
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id } = evt.data;

    try {
      // 6. UPDATE user baru tersebut dan beri role: "user" secara otomatis
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          role: 'user',
        },
      });

      return new Response('User role set to user successfully', { status: 200 });
    } catch (error) {
      console.error('Failed to update user metadata:', error);
      return new Response('Error updating metadata', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
