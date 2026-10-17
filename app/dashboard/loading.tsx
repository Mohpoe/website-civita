import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProducts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Card className="relative w-full mx-auto pt-0">
            <Skeleton className="relative z-20 aspect-video w-full object-cover rounded-none" />
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-2/4" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-5 w-3/4" />
              </CardDescription>
              <CardAction>
                <Skeleton className="h-8 w-20" />
              </CardAction>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}