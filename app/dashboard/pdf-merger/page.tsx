import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardPdfMerger from "@/components/dashboard-pdf-merger";
import { Metadata } from "next";

const mainTitle = "PDF Merger";

export const metadata: Metadata = {
  title: mainTitle,
};

export default function PdfMergerPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardPdfMerger />
    </>
  );
}
