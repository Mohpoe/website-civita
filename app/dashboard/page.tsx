import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/**
 * Dashboard utama kini hanya berisi pesanan.
 *
 * Katalog produk dipindahkan ke halaman publik `/produk` supaya bisa dibaca
 * tanpa login dan lebih mudah dibagikan.
 */
export default function DashboardPage() {
  redirect(ROUTES.DASHBOARD.INVENTORY);
}
