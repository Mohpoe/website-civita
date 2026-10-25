import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardPdfCompressor from "@/components/dashboard-pdf-compressor";
import { Metadata } from "next";

const mainTitle = "PDF Compressor";

export const metadata: Metadata = {
  title: mainTitle,
};

export default function PdfCompressorPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardPdfCompressor />
    </>
  );
}
