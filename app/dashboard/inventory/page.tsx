import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardInventory from "@/components/dashboard-inventory";
import { getOrders } from "@/lib/actions/order";
import { Order } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";

const mainTitle = "Pesanan Saya";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function InventoryPage() {
  try {
    const user = await currentUser();
    const [orders] = await Promise.all([
      getOrders(user?.id) as Promise<Order[]>
    ]);
    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardInventory orders={orders} />
      </>
    );
  } catch (error) {
    throw error;
  }
}
