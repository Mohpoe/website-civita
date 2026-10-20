import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducts() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>

      <Separator />

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-foreground/10 dark:hover:border-white/10 bg-muted dark:bg-card/50"
          >
            <div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div className={`relative mt-6 overflow-hidden rounded-2xl shadow-md`}>
                <Skeleton className="aspect-[5/4] w-full" />
              </div>
              <Skeleton className="mt-6 h-10 w-full" />
              <Skeleton className="mt-2 h-6 w-3/4" />
            </div>
            <div className="mt-8">
              <Skeleton className="h-10 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-8 flex items-center gap-4 justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}
