import { clerkMiddleware } from '@clerk/nextjs/server';
import { ROUTES } from './lib/constants';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const locale = pathname.split("/")[1];

  const isDashboardRoute = pathname.startsWith(ROUTES.DASHBOARD.HOME);
  const isAdminRoute = pathname.startsWith(ROUTES.DASHBOARD.ADMIN);
  // Tambahkan variabel pendeteksi rute spesifik untuk kelola user
  const isSuperadminUsersRoute = pathname.startsWith(ROUTES.DASHBOARD.USERS);

  if (isAdminRoute) {
    await auth.protect();
    const { sessionClaims } = await auth();
    const role = (
      sessionClaims as { metadata?: { role?: string } } | null
    )?.metadata?.role;

    // 1. Blokir akses jika sama sekali bukan admin atau superadmin (lempar ke dashboard utama)
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.HOME, req.url));
    }

    // 2. Aturan khusus: Jika mengakses halaman /users tapi role BUKAN superadmin
    if (isSuperadminUsersRoute && role !== "superadmin") {
      // Lempar kembali ke halaman dashboard admin (bukan ke halaman users)
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.ADMIN, req.url));
    }

  } else if (isDashboardRoute) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};