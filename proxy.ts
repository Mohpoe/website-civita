import { clerkMiddleware } from '@clerk/nextjs/server';
import { ROUTES } from './lib/constants';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const locale = pathname.split("/")[1];
  const isDashboardRoute = pathname.startsWith(`/${locale}${ROUTES.DASHBOARD.HOME}`);
  const isAdminRoute = pathname.startsWith(`/${locale}${ROUTES.DASHBOARD.ADMIN}`);

  if (isAdminRoute) {
    await auth.protect();
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as any)?.role;

    if (role !== "admin") return NextResponse.redirect(new URL(`/${locale}${ROUTES.DASHBOARD.HOME}`, req.url));
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