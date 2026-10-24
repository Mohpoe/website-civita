import { PageTitle } from "@/components/context/dashboard-page-title";
import { ROUTES } from "@/lib/constants";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Redis } from '@upstash/redis'

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function TestPage() {
  redirect(ROUTES.DASHBOARD.HOME);
  try {

    // const redis = new Redis({
    //   url: 'https://workable-boxer-238011.upstash.io',
    //   token: 'gQAAAAAAA6G7AAIgcDJmZGNhOTU3OTVmOWI0NTE1OTQ3YzE3ZjYxNjQ5OTA3MA',
    // })

    // await redis.set("foo", "bar");
    // await redis.get("foo");

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
