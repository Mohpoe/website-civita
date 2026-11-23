import { ServiceDetail } from "@/components/services/service-detail";
import { ROUTES } from "@/lib/constants";
import { getActiveServices, getServiceBySlug } from "@/lib/service-catalog";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    // Panggil di sini juga supaya status HTTP tetap 404, bukan hanya UI-nya.
    notFound();
  }

  return createPageMetadata({
    title: service.name,
    description: service.description,
    path: `${ROUTES.SERVICES}/${service.slug}`,
    ogImage: `${ROUTES.SERVICES}/${service.slug}/opengraph-image`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const services = await getActiveServices();
  const index = services.findIndex((item) => item.id === service.id);
  const ordered =
    index >= 0
      ? [...services.slice(index + 1), ...services.slice(0, index)]
      : services;

  return (
    <ServiceDetail
      service={service}
      related={ordered.filter((item) => item.id !== service.id).slice(0, 3)}
    />
  );
}
