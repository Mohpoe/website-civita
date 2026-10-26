import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardPdfToImage from "@/components/dashboard-pdf-to-image";
import { Metadata } from "next";

const mainTitle = "PDF to Image";

export const metadata: Metadata = {
  title: mainTitle,
};

export default function PdfToImagePage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardPdfToImage />
    </>
  );
}
