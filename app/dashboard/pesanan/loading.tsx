import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Kerangka daftar pesanan (produk maupun jasa). */
export default function OrdersLoading() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md sm:w-64" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-5 sm:p-5">
              <Skeleton className="aspect-video w-full shrink-0 rounded-md sm:aspect-square sm:w-28" />
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-5 w-28 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
                <Skeleton className="h-5 w-2/3 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md" />
                <div className="mt-2 flex items-center justify-between gap-3 border-t-2 border-ink/10 pt-3">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
