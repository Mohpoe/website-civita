import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardSettings from "@/components/dashboard-settings";
import { ROUTES } from "@/lib/constants";
import { readSiteSettings } from "@/lib/settings";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Pengaturan Situs";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function SettingsPage() {
  const user = await currentUser();

  if (user?.publicMetadata.role !== "superadmin") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  const settings = await readSiteSettings();

  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardSettings settings={settings} />
    </>
  );
}
