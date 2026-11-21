import { PageTitle } from "@/components/context/dashboard-page-title";
import { ServiceOrderRoom } from "@/components/services/service-order-room";
import { getServiceOrderForAdmin } from "@/lib/actions/services";
import { ROUTES } from "@/lib/constants";
import { readServiceMessages } from "@/lib/service-access";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ruang Pesanan Jasa",
};

export default async function AdminServiceOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await currentUser();
  const role = user?.publicMetadata.role;

  if (role !== "admin" && role !== "superadmin") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  const { orderId } = await params;
  const order = await getServiceOrderForAdmin(orderId);

  if (!order) notFound();

  const messages = await readServiceMessages(order.order_id);

  return (
    <>
      <PageTitle title="Ruang Pesanan Jasa" />
      <ServiceOrderRoom order={order} initialMessages={messages} viewer="admin" />
    </>
  );
}
