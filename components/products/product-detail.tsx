import { ProductBuyPanel } from "@/components/products/product-buy-panel";
import { ProductCard, productPath } from "@/components/products/product-card";
import { APP_CONFIG } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type { Product } from "@/types/global";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const STEPS = [
  {
    title: "Beli produk",
    description: "Masuk ke akun, lalu selesaikan pembayaran lewat Midtrans.",
  },
  {
    title: "Akses langsung",
    description:
      "Setelah pembayaran berhasil, produk muncul di halaman Pesanan Saya.",
  },
  {
    title: "Unduh & pakai",
    description:
      "Unduh berkas kapan saja dan gunakan sesuai kebutuhanmu.",
  },
] as const;

/**
 * Tampilan halaman detail produk. Dipisah dari page supaya bisa dipakai ulang
 * saat memeriksa tampilan tanpa mengambil data dari database.
 */
export function ProductDetail({
  product,
  related,
  owned,
}: {
  product: Product;
  related: Product[];
  owned: boolean;
}) {
  const href = productPath(product);
  const features = product.features ?? [];
  const hasFileInfo = Boolean(product.file_format || product.file_size);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_desc || product.long_desc,
    image: product.image_url ? [product.image_url] : undefined,
    category: product.category?.name,
    brand: {
      "@type": "Brand",
      name: APP_CONFIG.NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${APP_CONFIG.URL}${href}`,
      price: product.price,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: APP_CONFIG.URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Produk",
        item: `${APP_CONFIG.URL}/produk`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${APP_CONFIG.URL}${href}`,
      },
    ],
  };

  return (
    <main className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 md:pt-32">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft"
        >
          <Link href="/" className="hover:text-ink">
            Beranda
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/produk" className="hover:text-ink">
            Produk
          </Link>
          <ChevronRight className="size-3" />
          <span className="truncate font-semibold text-ink">{product.title}</span>
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="nb overflow-hidden rounded-lg bg-paper-2">
              <div className="relative aspect-[4/3] w-full">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileCheck2 className="size-16 text-ink-soft/40" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              <div className="nb-sm rounded-md bg-paper p-2">
                <Download className="mx-auto mb-1 size-4 text-ink" />
                Unduh sepuasnya
              </div>
              <div className="nb-sm rounded-md bg-paper p-2">
                <ShieldCheck className="mx-auto mb-1 size-4 text-ink" />
                Pembayaran aman
              </div>
              <div className="nb-sm rounded-md bg-paper p-2">
                <Lock className="mx-auto mb-1 size-4 text-ink" />
                Akses privat
              </div>
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full border border-ink/25 bg-paper-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              {product.category?.name ?? "Template"}
            </span>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {product.title}
            </h1>
            {product.short_desc ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {product.short_desc}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-ink">
                {formatRupiah(Number(product.price))}
              </span>
              <span className="pb-1 text-xs text-ink-soft">
                Sekali bayar, tanpa langganan
              </span>
            </div>

            <div className="mt-5">
              <ProductBuyPanel
                productId={product.id}
                productTitle={product.title}
                owned={owned}
                detailPath={href}
              />
            </div>

            {features.length > 0 ? (
              <div className="nb-sm mt-6 rounded-lg bg-paper p-4">
                <h2 className="text-sm font-bold text-ink">Yang kamu dapat</h2>
                <ul className="mt-3 grid gap-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-coral-deep" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {hasFileInfo ? (
              <dl className="mt-4 grid grid-cols-2 gap-2">
                {product.file_format ? (
                  <div className="nb-sm rounded-md bg-paper p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
                      Format
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-ink">
                      {product.file_format}
                    </dd>
                  </div>
                ) : null}
                {product.file_size ? (
                  <div className="nb-sm rounded-md bg-paper p-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
                      Ukuran
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-ink">
                      {product.file_size}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>

        {product.long_desc ? (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-xl font-bold text-ink">Detail produk</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {product.long_desc}
            </p>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">
            Cara mendapatkan produk
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="nb-sm rounded-lg bg-paper p-4">
                <span className="flex size-8 items-center justify-center rounded-md border-2 border-ink bg-butter text-sm font-bold text-on-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-sm font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {related.length > 0 ? (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-xl font-bold text-ink">
                Produk lain yang mungkin cocok
              </h2>
              <Link
                href="/produk"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-2 underline-offset-4 hover:text-coral-deep"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
