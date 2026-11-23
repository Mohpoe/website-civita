import { PageTitle } from "@/components/context/dashboard-page-title";
import { ServiceOrderRoom } from "@/components/services/service-order-room";
import { getServiceAttachments, getServiceOrderForUser } from "@/lib/actions/services";
import { readServiceMessages } from "@/lib/service-access";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ruang Pesanan",
};

export default async function ServiceOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/");

  const { orderId } = await params;
  const order = await getServiceOrderForUser(orderId, user.id);

  if (!order) notFound();

  const messages = await readServiceMessages(order.order_id);
  const attachments = await getServiceAttachments(order.order_id);

  return (
    <>
      <PageTitle title="Ruang Pesanan" />
      <ServiceOrderRoom
        order={order}
        initialMessages={messages}
        attachments={attachments}
        viewer="user"
      />
    </>
  );
}
