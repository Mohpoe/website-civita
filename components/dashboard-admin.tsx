"use client";

import { fetcher } from "@/lib/utils";
import { Product } from "@/types/global";
import { createColumnHelper, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import useSWR from "swr";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";

export default function DashboardAdmin() {
  const { data: products, error, isLoading } = useSWR<Product[]>("/api/products", fetcher);

  const features = tableFeatures({});

  const columnHelper = createColumnHelper<typeof features, Product>();

  const columns = columnHelper.columns([
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
      {error ? (
        <>
          <div className="p-4 text-red-500">Gagal memuat data produk.</div>
        </>
      ) : isLoading ? (
        <>
          <div className="p-4">Sedang memuat data...</div>
        </>
      ) : products?.map((product) => (
        <>
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row)=>(
                <TableRow>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ))}
    </>
  );
}