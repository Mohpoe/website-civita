import { PageTitle } from "@/components/context/dashboard-page-title";
import { getProducts } from "@/lib/actions/product";
import { Product } from "@/types/global";
import { Metadata } from "next";
import DashboardProducts from "./test-page";

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function DashboardPage() {
  // throw new Error("Ini adalah pesan error simulasi untuk keperluan desain!");
  // await delay(10000);
  try {
    const [products] = await Promise.all([
      getProducts(true) as Promise<Product[]>,
    ]);

    return (
      <>
        <PageTitle title="Produk Digital" />
        <DashboardProducts products={products} />
      </>
    );
  } catch (error) {
    throw error;
  }
}
