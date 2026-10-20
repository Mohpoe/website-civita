import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAdminProducts() {
  return (
    <Card className="shadow-md">
      {/* Header Skeleton */}
      <CardHeader className="border-b">
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/2" />
            </CardDescription>
          </div>
          <CardAction>
            <Skeleton className="h-10 w-24 rounded-full" />
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Table Controls Skeleton */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
          <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
            <Skeleton className="h-10 w-64 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto border-t pt-4 lg:border-none lg:pt-0">
            <Skeleton className="h-10 w-64 rounded-full" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <th key={i} className="h-12 px-4">
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="*:border-border [&>:not(:last-child)]:border-r hover:bg-muted/30">
                    {Array.from({ length: 3 }).map((_, cellIdx) => (
                      <td key={cellIdx} className="py-2 px-4">
                        <Skeleton className="h-5 w-48 rounded-full" />
                      </td>
                    ))}
                    <td className="py-2 px-4">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex w-full flex-col items-center justify-between gap-4 py-1 lg:flex-row lg:gap-8">
          <div className="flex items-center gap-1.5 lg:order-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full flex-col items-center justify-between gap-4 py-1 lg:flex-row lg:gap-8">
          <div className="order-2 text-xs font-medium lg:order-1 lg:flex-1">
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="order-1 flex items-center gap-1.5 lg:order-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
