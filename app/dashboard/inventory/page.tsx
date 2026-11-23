import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/** Alamat lama daftar pesanan produk. */
export default function InventoryRedirectPage() {
  redirect(ROUTES.DASHBOARD.ORDER_PRODUCTS);
}
