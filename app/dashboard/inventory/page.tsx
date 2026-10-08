import { PageTitle } from "@/components/context/dashboard-page-title"
import DashboardInventory from "@/components/dashboard-inventory";
import { Metadata } from "next"

const mainTitle = "Pesanan Saya";

export const metadata: Metadata = {
  title: mainTitle,
}

export default function InventoryPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardInventory />
    </>
  )
}
