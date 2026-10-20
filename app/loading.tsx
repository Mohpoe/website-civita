import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-[600px] flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-4xl w-full space-y-12">
        {/* Hero Header Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-1/3" />
          <div className="flex gap-4">
            <Skeleton className="h-14 w-48 rounded-full" />
            <Skeleton className="h-14 w-32 rounded-full" />
          </div>
        </div>

        {/* Services Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-[2rem] border-4 border-foreground bg-background">
              <Skeleton className="h-16 w-16 rounded-2xl mb-6" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>

        {/* Process Steps Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-6">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-[2rem] border-4 border-foreground bg-background">
              <Skeleton className="h-32 w-full rounded-xl mb-4" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>

        {/* Testimonials Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-8 rounded-[2rem] border-4 border-foreground bg-background">
              <Skeleton className="w-10 h-10 rounded-2xl mb-6" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-5 w-2/3 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>

        {/* CTA Section Skeleton */}
        <div className="pt-12 rounded-2xl border-4 border-foreground bg-background/50 p-12">
          <Skeleton className="h-16 w-1/2 mx-auto mb-6" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-14 w-48 rounded-full mx-auto" />
        </div>
      </div>
    </main>
  );
}
