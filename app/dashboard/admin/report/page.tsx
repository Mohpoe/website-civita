import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardReport from "@/components/dashboard-report";
import { getCategories } from "@/lib/actions/category";
import { getOrders } from "@/lib/actions/order";
import { getProducts } from "@/lib/actions/product";
import { Category, Order, Product } from "@/types/global";
import { Metadata } from "next";

const mainTitle = "Laporan";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function ReportPage() {
  try {
    const [products, categories, orders] = await Promise.all([
      getProducts(false) as Promise<Product[]>,
      getCategories() as Promise<Category[]>,
      getOrders() as Promise<Order[]>,
    ]);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardReport products={products} categories={categories} orders={orders} />
      </>
    )
  } catch (error) {
    throw error;
  }
}
