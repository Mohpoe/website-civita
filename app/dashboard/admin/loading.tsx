import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Table Controls Skeleton (main search + filter only) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
          <Skeleton className="h-10 w-full sm:w-80 rounded-full" />
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>

        {/* Table Skeleton - no overflow-x-auto, fixed columns */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="h-10 px-3">
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="*:border-t border-t border-muted/30">
                  {Array.from({ length: 4 }).map((_, cellIdx) => (
                    <td key={cellIdx} className="py-2 px-3">
                      <Skeleton className="h-4 w-32 rounded-full" />
                    </td>
                  ))}
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
  );
}
