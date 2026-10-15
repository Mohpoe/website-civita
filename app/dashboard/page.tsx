import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardProducs from "@/components/dashboard-products";
import { getCategories } from "@/lib/actions/category";
import { getProducts } from "@/lib/actions/product";
import { Category, Product } from "@/types/global";
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
    const [products, categories] = await Promise.all([
      getProducts(true) as Promise<Product[]>,
      getCategories() as Promise<Category[]>,
    ]);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardProducs products={products} categories={categories} />
      </>
    );
  } catch (error) {
    throw error;
  }
}
