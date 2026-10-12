import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardProducs from "@/components/dashboard-products";
import { getProducts } from "@/lib/actions/product";
import { Product } from "@/types/global";
import { Metadata } from "next";

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function DashboardPage() {
  try {
    const [products] = await Promise.all([
      getProducts(false) as Promise<Product[]>,
    ]);

    return (
      <>
        <PageTitle title="Produk Digital" />
        <DashboardProducs products={products} />
      </>
    );
  } catch (error) {
    throw error;
  }
}
