import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

export default function LoadingProducts() {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle>Sedang Memuat Data</CardTitle>
        <CardDescription>Harap bersabar data sedang dikumpulkan...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-foreground rounded-full animate-spin mb-4"></div>
          Memuat daftar produk...
        </div>
      </CardContent>
    </Card>
  );
}