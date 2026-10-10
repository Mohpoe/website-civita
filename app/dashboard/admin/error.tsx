"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, TriangleAlertIcon } from "lucide-react";

export default function ErrorProducts({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle>Terjadi Kesalahan!</CardTitle>
        <CardDescription>Sistem gagal memuat informasi.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
          <TriangleAlertIcon className="w-10 h-10" />
          <p className="font-medium">Terjadi kesalahan... Hubungi Administrator!</p>
          <Button variant="outline" onClick={() => reset()} className="mt-2 text-foreground">
            <RefreshCcw className="w-4 h-4 mr-2" /> Coba Lagi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}