import { Category, Order, Product } from "@/types/global";

interface DashboardReportProps {
  products: Product[],
  categories: Category[],
  orders: Order[],
}

export default function DashboardReport({ products, categories, orders }: DashboardReportProps) {
  return (
    <>
      Percobaan
    </>
  );
}