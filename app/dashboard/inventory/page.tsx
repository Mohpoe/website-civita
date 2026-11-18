import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardInventory from "@/components/dashboard-inventory";
import { getOrdersForUser } from "@/lib/actions/order";
import { Order } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Pesanan Saya";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function InventoryPage() {
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
