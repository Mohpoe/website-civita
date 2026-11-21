import { PageTitle } from "@/components/context/dashboard-page-title";
import { ServiceOrderList } from "@/components/services/service-order-list";
import { buttonVariants } from "@/components/ui/button";
import { getAllServiceOrders } from "@/lib/actions/services";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { Settings2Icon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

const mainTitle = "Pesanan Jasa Masuk";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function AdminServicesPage() {
  const user = await currentUser();
  const role = user?.publicMetadata.role;

  if (role !== "admin" && role !== "superadmin") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  const orders = await getAllServiceOrders();

  return (
    <>
      <PageTitle title={mainTitle} />

      {role === "superadmin" ? (
        <div className="flex justify-end">
          <Link
            href={ROUTES.DASHBOARD.SERVICE_CATALOG}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Settings2Icon className="size-4" /> Kelola layanan & harga
          </Link>
        </div>
      ) : null}

      <ServiceOrderList orders={orders} viewer="admin" />
    </>
  );
}
