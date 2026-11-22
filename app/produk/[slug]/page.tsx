import { ProductDetail } from "@/components/products/product-detail";
import {
  getProductBySlug,
  getRelatedProducts,
  userOwnsProduct,
} from "@/lib/products";
import { createPageMetadata } from "@/lib/seo";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    // Panggil di sini juga supaya status HTTP tetap 404, bukan hanya UI-nya.
    notFound();
  }

  const path = `/produk/${product.slug || product.id}`;
  const metadata = createPageMetadata({
    title: product.title,
    description:
      product.short_desc ||
      product.long_desc ||
      "Template digital siap pakai untuk kebutuhan lamaran kerja.",
    path,
  });

  if (product.image_url) {
    metadata.openGraph = {
      ...(metadata.openGraph ?? {}),
      images: [{ url: product.image_url, alt: product.title }],
    };
    metadata.twitter = {
      ...(metadata.twitter ?? {}),
      images: [product.image_url],
    };
  }

  return metadata;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, user] = await Promise.all([
    getRelatedProducts(product.id, product.category_id),
    currentUser(),
  ]);

  const owned = user ? await userOwnsProduct(user.id, product.id) : false;

  return <ProductDetail product={product} related={related} owned={owned} />;
}
