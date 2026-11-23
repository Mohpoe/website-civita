import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/** Alamat lama ruang pesanan jasa. */
export default async function ServiceOrderRedirectPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  redirect(`${ROUTES.DASHBOARD.ORDER_SERVICES}/${orderId}`);
}
