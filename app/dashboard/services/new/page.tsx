import { PageTitle } from "@/components/context/dashboard-page-title";
import { ServiceOrderForm } from "@/components/services/service-order-form";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { getActiveServices } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

const mainTitle = "Pesan Layanan";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function NewServiceOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/");

  const [params, services] = await Promise.all([searchParams, getActiveServices()]);

  return (
    <>
      <PageTitle title={mainTitle} />

      {services.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border-2 border-dashed border-border p-8">
          <p className="font-medium">Belum ada layanan yang bisa dipesan.</p>
          <p className="text-sm text-muted-foreground">
            Katalog sedang disiapkan. Sementara itu, hubungi admin lewat WhatsApp.
          </p>
          <Link href={ROUTES.DASHBOARD.SERVICES} className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke pesanan
          </Link>
        </div>
      ) : (
        <ServiceOrderForm services={services} initialServiceSlug={params.service} />
      )}
    </>
  );
}
