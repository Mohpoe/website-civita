import type { Product } from "@/types/global";
import { formatRupiah } from "@/lib/utils";
import { ArrowRight, FileCheck2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** Alamat publik produk; id dipakai sebagai cadangan untuk data lama. */
export function productPath(product: Pick<Product, "id" | "slug">): string {
  return `/produk/${product.slug || product.id}`;
}

/**
 * Kartu produk yang dipakai di landing page, katalog publik, dan bagian
 * "Produk terkait". Seluruh kartu adalah satu tautan agar mudah diklik dan
 * tidak ada tautan bersarang.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <Link
      href={productPath(product)}
      aria-label={`Lihat detail ${product.title}`}
      className="nb nb-hover group flex flex-col overflow-hidden rounded-lg bg-paper"
    >
      <div className="relative aspect-[4/3] w-full border-b-2 border-ink bg-paper-2">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileCheck2 className="size-10 text-ink-soft/50" />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-full border border-ink bg-paper/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink">
          {product.category?.name ?? "Template"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">
          {product.title}
        </h3>
        {product.short_desc ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-soft">
            {product.short_desc}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-sm font-bold text-ink">
            {formatRupiah(Number(product.price))}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink underline decoration-2 underline-offset-4 group-hover:text-coral-deep">
            Lihat detail
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
