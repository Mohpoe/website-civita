import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardAdmin from "@/components/dashboard-admin";
import { getCategories } from "@/lib/actions/category";
import { getOrders } from "@/lib/actions/order";
import { getProducts } from "@/lib/actions/product";
import { getSnapshots } from "@/lib/actions/snapshots";
import { delay } from "@/lib/utils";
import { Category, Order, Product, ProductSnapshot } from "@/types/global";
import { Metadata } from "next";

const mainTitle = "Kelola Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function AdminPage() {
  // throw new Error("Ini adalah pesan error simulasi untuk keperluan desain!");
  // await delay(10000);
  try {
    const [products, categories, orders, snapshots] = await Promise.all([
      getProducts(false) as Promise<Product[]>,
      getCategories() as Promise<Category[]>,
      getOrders() as Promise<Order[]>,
      getSnapshots() as Promise<ProductSnapshot[]>,
    ]);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardAdmin products={products} categories={categories} orders={orders} snapshots={snapshots} />
      </>
    )
  } catch (error) {
    throw error;
  }
}
