import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardImageToPdf from "@/components/dashboard-image-to-pdf";
import { Metadata } from "next";

const mainTitle = "Image to PDF";

export const metadata: Metadata = {
  title: mainTitle,
};

export default function ImageToPdfPage() {
  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardImageToPdf />
    </>
  );
}
