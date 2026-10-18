import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardReport from "@/components/dashboard-report";
import { getReportData } from "@/lib/actions/reports";
import { Metadata } from "next";

const mainTitle = "Laporan";

export const metadata: Metadata = {
  title: mainTitle,
}

interface ReportPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  try {
    const resolvedParams = await searchParams;
    const range = resolvedParams.range || "30d";

    // Destructure orderHistory di sini
    const { kpi, chart, orderHistory } = await getReportData(range);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardReport
          kpi={kpi}
          chartData={chart}
          orderHistory={orderHistory}
        />
      </>
    );
  } catch (error) {
    throw error;
  }
}