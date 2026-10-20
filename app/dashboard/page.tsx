import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardProducs from "@/components/dashboard-products";
import { getCategories } from "@/lib/actions/category";
import { getOrders } from "@/lib/actions/order";
import { getProducts } from "@/lib/actions/product";
import { Category, Order, Product } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function DashboardPage() {
  // throw new Error("Ini adalah pesan error simulasi untuk keperluan desain!");
  // await delay(10000);
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    const [products, categories, orders] = await Promise.all([
      getProducts(true) as Promise<Product[]>,
      getCategories() as Promise<Category[]>,
      getOrders(userEmail) as Promise<Order[]>,
    ]);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardProducs products={products} categories={categories} orders={orders} />
      </>
    );
  } catch (error) {
    throw error;
  }
}
