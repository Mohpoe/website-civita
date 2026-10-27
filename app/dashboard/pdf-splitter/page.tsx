import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardPdfSplitter from "@/components/dashboard-pdf-splitter";
import { Metadata } from "next";

const mainTitle = "PDF Splitter";

export const metadata: Metadata = {
  title: mainTitle,
};

export default function PdfSplitterPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardPdfSplitter />
    </>
  );
}
