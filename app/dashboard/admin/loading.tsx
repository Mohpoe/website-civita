import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducts() {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle>
          <Skeleton className="h-6 w-50" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-5 w-80" />
        </CardDescription>
        <CardAction>
          <Skeleton className="h-8 w-30" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex w-full flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="flex gap-4" key={index}>
              <Skeleton className="h-20 w-20" />
              <Skeleton className="h-20 flex-1" />
              <Skeleton className="h-20 flex-3" />
              <Skeleton className="h-20 flex-2" />
              <Skeleton className="h-20 flex-1" />
              <Skeleton className="h-20 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}