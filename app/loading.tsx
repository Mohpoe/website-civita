import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-[600px] flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-6xl w-full space-y-12">
        {/* Hero Header Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-14 w-48 rounded-full" />
            <Skeleton className="h-14 w-32 rounded-full" />
          </div>
        </div>

        {/* Services Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-[2rem]">
              <Skeleton className="h-16 w-16 rounded-2xl mb-6" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>

        {/* CTA Section Skeleton */}
        <div className="pt-12 rounded-2xl p-12">
          <Skeleton className="h-16 w-1/2 mx-auto mb-6" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-14 w-48 rounded-full mx-auto" />
        </div>
      </div>
    </main>
  );
}
