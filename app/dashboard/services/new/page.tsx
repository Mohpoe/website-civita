import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

/** Alamat lama formulir pesanan jasa; parameter layanan tetap dibawa. */
export default async function NewServiceOrderRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const target = service
    ? `${ROUTES.DASHBOARD.SERVICE_NEW}?service=${encodeURIComponent(service)}`
    : ROUTES.DASHBOARD.SERVICE_NEW;

  redirect(target);
}
