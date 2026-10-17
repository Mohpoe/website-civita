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
    // Await searchParams karena di Next.js 15 (atau App Router versi terbaru), searchParams bersifat asinkron.
    const resolvedParams = await searchParams;
    const range = resolvedParams.range || "30d";

    // Panggil query SQL dengan rentang waktu dari URL
    const { kpi, chart, topProducts } = await getReportData(range);

    return (
      <div className="px-4 md:px-6 py-0 w-full max-w-7xl mx-auto">
        <DashboardReport
          kpi={kpi}
          chartData={chart}
          topProducts={topProducts}
        />
      </div>
    );
  } catch (error) {
    throw error;
  }
}
