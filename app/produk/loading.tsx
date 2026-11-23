import { Skeleton } from "@/components/ui/skeleton";

/** Kerangka katalog produk saat data sedang dimuat. */
export default function ProductsLoading() {
  return (
    <main className="bg-paper">
      <section className="border-b-2 border-ink bg-paper-2 px-4 pt-28 pb-10 sm:px-6 md:pt-32 md:pb-14">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-full max-w-xl rounded-md" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <Skeleton className="h-11 w-full rounded-md" />
        <div className="mt-5 flex flex-col gap-3 border-b-2 border-ink/10 pb-5 sm:flex-row sm:justify-between">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-6 w-52 rounded-full" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="nb-sm flex flex-col gap-3 rounded-lg bg-paper p-4"
            >
              <Skeleton className="aspect-[4/3] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-2/3 rounded-md" />
              <Skeleton className="mt-2 h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
