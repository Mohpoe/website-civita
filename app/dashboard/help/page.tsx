import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/**
 * Panduan pengguna kini berupa halaman publik `/bantuan`.
 *
 * Alamat lama tetap dipertahankan sebagai pengalihan supaya tautan lama dan
 * bookmark tidak berakhir di halaman kosong.
 */
export default function DashboardHelpRedirectPage() {
  redirect(ROUTES.HELP);
}
