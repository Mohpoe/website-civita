
import { PageTitle } from "@/components/context/dashboard-page-title"
import { Metadata } from "next"

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default function DashboardPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      percobaan
    </>
  )
}
