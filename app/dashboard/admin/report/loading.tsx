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
              <p className="text-xs text-muted-foreground mt-1">
                <Skeleton className="h-3 w-3/4" />
              </p>
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
          <div className="mt-4 sm:mt-0 flex p-1 bg-muted rounded-lg w-fit">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-6 sm:px-6">
          <div className="aspect-auto h-[300px] w-full">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Order History Table Skeleton */}
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
          {/* Table Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
            <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
              <Skeleton className="h-10 w-64 rounded-full" />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto border-t pt-4 lg:border-none lg:pt-0">
              <Skeleton className="h-10 w-64 rounded-full" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="h-12 px-4">
                      <Skeleton className="h-4 w-32 rounded-full" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="*:border-border [&>:not(:last-child)]:border-r">
                    {Array.from({ length: 5 }).map((_, cellIdx) => (
                      <td key={cellIdx} className="py-2 px-4">
                        <Skeleton className="h-5 w-48 rounded-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex w-full flex-col items-center justify-between gap-4 py-1 lg:flex-row lg:gap-8">
            <div className="order-1 flex items-center gap-1.5 lg:order-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
