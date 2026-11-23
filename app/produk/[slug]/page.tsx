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

  // Gambar OG dibuat oleh `opengraph-image.tsx` di folder ini supaya semua
  // pratinjau tautan produk memakai template neo-brutalis yang sama. Jangan
  // menimpa `images` di sini, karena metadata akan mengalahkan file convention.
  return createPageMetadata({
    title: product.title,
    description:
      product.short_desc ||
      product.long_desc ||
      "Template digital siap pakai untuk kebutuhan lamaran kerja.",
    path,
    ogImage: `${path}/opengraph-image`,
  });
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
