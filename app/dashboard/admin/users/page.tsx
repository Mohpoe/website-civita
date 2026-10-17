import { PageTitle } from "@/components/context/dashboard-page-title";
import DashboardUsers from "@/components/dashboard-users";
import { getAllUsers } from "@/lib/actions/users";
import { Metadata } from "next";

const mainTitle = "Kelola Pengguna";

export const metadata: Metadata = {
  title: mainTitle,
}

export default async function UsersPage() {
  try {
    const users = await getAllUsers();

    return (
      <>
        <PageTitle title={mainTitle} />
        <DashboardUsers users={users} />
      </>
    )
  } catch (error) {
    throw error;
  }
}
