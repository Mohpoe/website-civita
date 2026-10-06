import { neon } from "@neondatabase/serverless";

export { cn } from "cn"

export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export const sql = neon(`${process.env.DATABASE_URL}`);