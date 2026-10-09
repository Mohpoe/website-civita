"use client";

import { fetcher } from "@/lib/utils";
import { Product } from "@/types/global";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import useSWR from "swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { PlusIcon, TriangleAlertIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { APP_CONFIG } from "@/lib/constants";

export default function DashboardAdmin() {
  const { data: products, error, isLoading } = useSWR<Product[]>("/api/products", fetcher);

  const features = tableFeatures({});

  const columnHelper = createColumnHelper<typeof features, Product>();

  const columns = columnHelper.columns([
    columnHelper.display({
      id: "nomor",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>
    }),
    columnHelper.accessor("id", {
      header: () => <div className="text-center">#</div>,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("title", {
      header: "Nama Produk"
    })
  ])

  const table = useTable({
    features,
    columns,
    data: products || [],
  });

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Kelola Produk {APP_CONFIG.NAME}</CardTitle>
          <CardDescription>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</CardDescription>
          <CardAction>
            <Button variant="outline">
              <PlusIcon />
              <span className="hidden md:block">Tambah</span>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-destructive">
              <TriangleAlertIcon className="w-8 h-8" />
              Gagal memuat data... Hubungi Administrator!
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-foreground rounded-full animate-spin mb-4"></div>
              Memuat daftar produk...
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : <table.FlexRender header={header} />
                            }
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="*:border-border [&>:not(:last-child)]:border-r">
                        {row.getAllCells().map((cell) => (
                          <TableCell key={cell.id}>
                            <table.FlexRender cell={cell} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}