import { ROUTES } from "@/lib/constants";
import { getActiveServices } from "@/lib/service-catalog";
import { redirect } from "next/navigation";

/**
 * Formulir pesanan jasa sekarang berupa dialog di halaman detail layanan.
 * Rute lama tetap dipertahankan agar tautan lama tidak berakhir 404.
 */
export default async function NewServiceOrderPage({
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
