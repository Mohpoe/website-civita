import { ROUTES } from "@/lib/constants";
import { getActiveServices } from "@/lib/service-catalog";
import { redirect } from "next/navigation";

/** Alamat lama formulir pesanan jasa; diarahkan ke halaman detail layanan. */
export default async function NewServiceOrderRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  if (service) {
    const services = await getActiveServices();
    const match = services.find(
      (item) => item.slug === service || item.id === service,
    );
    if (match) redirect(`${ROUTES.SERVICES}/${match.slug}`);
  }

  redirect(ROUTES.SERVICES);
}
