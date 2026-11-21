import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardProducs from "@/components/dashboard-products";
import { getCategories } from "@/lib/actions/category";
import { getOrdersForUser } from "@/lib/actions/order";
import { getProducts } from "@/lib/actions/product";
import { Category, Order, Product } from "@/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const mainTitle = "Daftar Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const [products, categories, orders] = await Promise.all([
    getProducts(true) as Promise<Product[]>,
    getCategories() as Promise<Category[]>,
    getOrdersForUser(user.id) as Promise<Order[]>,
  ]);

  return (
    <>
      <PageTitle title={mainTitle} />
      <DashboardProducs products={products} categories={categories} orders={orders} />
    </>
  );
}
