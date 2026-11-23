import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/** Alamat induk pesanan diarahkan ke daftar pesanan produk. */
export default function OrdersIndexPage() {
  redirect(ROUTES.DASHBOARD.ORDER_PRODUCTS);
}
