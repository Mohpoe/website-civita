import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

/**
 * Pintu masuk dashboard.
 *
 * Admin dan superadmin langsung dibawa ke kelola produk karena itu pekerjaan
 * utamanya. Pengguna biasa tetap diarahkan ke daftar pesanan produk.
 */
export default async function DashboardPage() {
  const { sessionClaims } = await auth();
  const role = (
    sessionClaims as { metadata?: { role?: string } } | null
  )?.metadata?.role;
  const isAdmin = role === "admin" || role === "superadmin";

  redirect(isAdmin ? ROUTES.DASHBOARD.ADMIN : ROUTES.DASHBOARD.ORDER_PRODUCTS);
}
