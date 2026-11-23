import { PageTitle } from "@/components/context/dashboard-page-title";
import { ServiceOrderList } from "@/components/services/service-order-list";
import { getServiceOrdersForUser } from "@/lib/actions/services";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Pesanan Jasa";

export const metadata: Metadata = {
  title: mainTitle,
};

export default async function ServiceOrdersPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const orders = await getServiceOrdersForUser(user.id);

  return (
    <>
      <PageTitle title={mainTitle} />
      <ServiceOrderList orders={orders} viewer="user" />
    </>
  );
}
