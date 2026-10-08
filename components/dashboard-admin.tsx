"use client";

import { fetcher } from "@/lib/utils";
import { Product } from "@/types/global";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function DashboardAdmin() {
  const { data: products, error, isLoading } = useSWR<Product[]>("/api/products", fetcher);

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
        <div key={product.id} className="p-4 border rounded">
          <h3>{product.title}</h3>
          <p>Harga: Rp {product.price}</p>
        </div>
      ))}
    </>
  );
}