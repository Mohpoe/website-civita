import { PageTitle } from "@/components/context/dashboard-page-title";
import { ROUTES } from "@/lib/constants";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function TestPage() {
  redirect(ROUTES.DASHBOARD.HOME);
  try {
    return (
      <>
        <PageTitle title="Produk Digital" />
        Percobaan
        {/* <DashboardTest /> */}
      </>
    );
  } catch (error) {
    throw error;
  }
}
