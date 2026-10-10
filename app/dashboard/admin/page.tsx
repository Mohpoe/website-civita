import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardAdmin from "@/components/dashboard-admin";
import { getCategories, getOrders, getProducts } from "@/lib/actions/product";
import { Category, Order, Product } from "@/types/global";
import { Metadata } from "next";

const mainTitle = "Kelola Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function AdminPage() {
  try {
    const [products, categories, orders] = await Promise.all([
      getProducts(false) as Promise<Product[]>,
      getCategories() as Promise<Category[]>,
      getOrders() as Promise<Order[]>,
    ]);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardAdmin products={products} categories={categories} orders={orders} />
      </>
    )
  } catch (error) {
    throw error;
  }
}
