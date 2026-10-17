import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardCategory from "@/components/dashboard-category";
import { getCategories } from "@/lib/actions/category";
import { Category } from "@/types/global";
import { Metadata } from "next";

const mainTitle = "Kelola Kategori";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function CategoryPage() {
  try {
    const [categories] = await Promise.all([
      getCategories() as Promise<Category[]>,
    ]);

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardCategory categories={categories} />
      </>
    )
  } catch (error) {
    throw error;
  }
}
