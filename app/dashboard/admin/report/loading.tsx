import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingReport() {
  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-10 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="shadow-sm mt-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/2" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-6 sm:px-6">
          <div className="aspect-auto h-[300px] w-full">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Order History Table Skeleton - Simplified */}
      <Card className="shadow-md mt-6">
        <CardHeader className="border-b">
          <CardTitle>
            <Skeleton className="h-6 w-1/3" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2" />
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 mt-6">
          {/* Table Controls - Simplified */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            <Skeleton className="h-10 w-full sm:w-80 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>

          {/* Table Skeleton - no overflow-x-auto */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <th key={i} className="h-10 px-3">
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="*:border-t border-t border-muted/30">
                    <td className="py-2 px-3">
                      <Skeleton className="h-4 w-32 rounded-full" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </td>
                    <td className="py-2 px-3">
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Skeleton className="h-7 w-10 rounded-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-7 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
