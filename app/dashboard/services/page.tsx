import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/** Alamat lama daftar pesanan jasa. */
export default function ServicesRedirectPage() {
  redirect(ROUTES.DASHBOARD.ORDER_SERVICES);
}
