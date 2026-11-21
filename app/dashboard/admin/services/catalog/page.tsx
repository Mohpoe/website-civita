import { PageTitle } from "@/components/context/dashboard-page-title";
import { DashboardServiceCatalog } from "@/components/services/dashboard-service-catalog";
import { getServices } from "@/lib/actions/services";
import { ROUTES } from "@/lib/constants";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Katalog Layanan";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function ServiceCatalogPage() {
  const user = await currentUser();

  if (user?.publicMetadata.role !== "superadmin") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  const services = await getServices();

  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardServiceCatalog services={services} />
    </>
  );
}
