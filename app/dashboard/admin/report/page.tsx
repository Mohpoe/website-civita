import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardReport from "@/components/dashboard-report";
import { getReportData } from "@/lib/actions/reports";
import type { ReportType } from "@/types/global";
import { Metadata } from "next";

const mainTitle = "Laporan Penjualan";

export const metadata: Metadata = {
  title: mainTitle,
}

interface ReportPageProps {
  searchParams: Promise<{ range?: string; type?: string }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const resolvedParams = await searchParams;
  const range = resolvedParams.range || "30d";
  const activeType: ReportType = resolvedParams.type === "jasa" ? "jasa" : "produk";

  const report = await getReportData(range);

  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardReport report={report} activeType={activeType} />
    </>
  );
}
