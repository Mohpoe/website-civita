import { neon } from "@neondatabase/serverless";

export { cn } from "cn"

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const sql = neon(`${process.env.NEONDB_DATABASE_URL}`);

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));