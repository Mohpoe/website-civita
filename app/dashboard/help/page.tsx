import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardHelp from "@/components/dashboard-help";
import { Metadata } from "next";

const mainTitle = "Panduan Pengguna";

export const metadata: Metadata = {
  title: mainTitle,
}

export default function HelpPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardHelp />
    </>
  );
}
