import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingInventory() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="relative w-full sm:w-72">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-6 overflow-x-auto no-scrollbar border-b border-border pb-2">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Order Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden transition-colors group hover:border-foreground/20 border rounded-lg bg-card"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0 sm:p-5 flex flex-col sm:flex-row gap-0 sm:gap-5">
                <div className="relative w-full sm:w-32 aspect-video sm:aspect-square sm:rounded-xl overflow-hidden bg-muted shrink-0 border-b sm:border border-border flex items-center justify-center">
                  <Skeleton className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between p-4 sm:p-0">
                  <div className="space-y-1 mb-4 sm:mb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-4 w-1/3" />
                      <Badge variant="outline" className="h-6 w-24">
                        <Skeleton className="h-4 w-12" />
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/6" />
                    </div>
                    <Skeleton className="mt-2 h-4 w-1/3" />
                    <Skeleton className="mt-1 h-3 w-1/4 sm:hidden" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                    <Skeleton className="h-6 w-1/3 font-bold" />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Skeleton className="h-10 w-1/3" />
                      <Skeleton className="h-10 w-1/3" />
                      <Skeleton className="h-10 w-1/3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}
