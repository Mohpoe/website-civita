import { PageTitle } from "@/components/context/dashboard-page-title";
import { getProducts } from "@/lib/actions/product";
import { Product } from "@/types/global";
import { Metadata } from "next";
import DashboardProducts from "./test-page";
import { Resend } from "resend";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import DashboardTest from "./test-page";
import { redirect } from "next/navigation";

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function TestPage() {
  redirect(ROUTES.DASHBOARD.HOME)
  // throw new Error("Ini adalah pesan error simulasi untuk keperluan desain!");
  // await delay(10000);
  try {
    const [products] = await Promise.all([
      getProducts(true) as Promise<Product[]>,
    ]);

    // console.log("Test Env", process.env.RESEND_API_KEY);

    return (
      <>
        <PageTitle title="Produk Digital" />
        Percobaan
        {/* <DashboardTest /> */}
      </>
    );
  } catch (error) {
    throw error;
  }
}
