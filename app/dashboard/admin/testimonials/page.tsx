import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardTestimonials from "@/components/dashboard-testimonials";
import { ROUTES } from "@/lib/constants";
import { readTestimonials } from "@/lib/testimonials";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Kelola Testimoni";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function TestimonialsPage() {
  const user = await currentUser();

  if (user?.publicMetadata.role !== "superadmin") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  const testimonials = await readTestimonials();

  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardTestimonials testimonials={testimonials} />
    </>
  );
}
