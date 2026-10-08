import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardAdmin from "@/components/dashboard-admin";
import { Metadata } from "next";

const mainTitle = "Kelola Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default function AdminPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardAdmin />
    </>
  )
}
