import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardInventory from "@/components/dashboard-inventory";
import { getOrdersForUser } from "@/lib/actions/order";
import type { Order } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Pesanan Produk";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function ProductOrdersPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const orders = (await getOrdersForUser(user.id)) as Order[];

  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardInventory orders={orders} />
    </>
  );
}
