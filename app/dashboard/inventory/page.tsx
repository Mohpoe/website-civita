
import { PageTitle } from "@/components/context/dashboard-page-title"
import DashboardInventory from "@/components/dashboard-inventory";
import { Metadata } from "next"

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default function DashboardPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardInventory />
    </>
  )
}
