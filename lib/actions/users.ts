"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@/lib/utils";

// #region Get All Users
export async function getAllUsers() {
  // 1. Cek apakah yang mengakses adalah superadmin
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") {
    throw new Error("Akses ditolak.");
  }

  try {
    // 2. Inisialisasi Clerk Client
    const client = await clerkClient();

    // 3. Ambil daftar user (Clerk membatasi default 10, kita set limit lebih besar misal 100)
    const usersResponse = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });

    // 4. Hitung jumlah order per email dari tabel orders (untuk peringatan sebelum hapus)
    const orderCountsRaw = await sql`
      SELECT email, COUNT(*)::int as order_count
      FROM orders
      GROUP BY email
    `;
    const orderCountMap = new Map<string, number>();
    for (const row of orderCountsRaw as Array<{ email: string; order_count: number }>) {
      orderCountMap.set(row.email, row.order_count);
    }

    // 5. Petakan (mapping) data agar lebih bersih saat dikirim ke Frontend
    const users = usersResponse.data.map((u) => {
      const email = u.emailAddresses[0]?.emailAddress || "Tidak ada email";
      return {
        id: u.id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "[Tanpa_Nama]",
        email,
        role: (u.publicMetadata.role as string) || "user",
        imageUrl: u.imageUrl,
        createdAt: u.createdAt,
        orderCount: orderCountMap.get(email) ?? 0,
      };
    });

    return users;
  } catch (error) {
    console.error("Gagal mengambil data user dari Clerk:", error);
    throw new Error("Gagal mengambil data pengguna.");
  }
}
// #endregion

// #region Promote to Admin
export async function promoteToAdmin(targetUserId: string) {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") {
    throw new Error("Akses ditolak.");
  }

  try {
    const client = await clerkClient();

    // Update publicMetadata user yang ditargetkan
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: "admin"
      }
    });

    return { success: true, message: "User berhasil diubah menjadi Admin." };
  } catch (error) {
    console.error("Gagal update role:", error);
    throw new Error("Gagal memperbarui role pengguna.");
  }
}
// #endregion

// #region Demote to User
export async function demoteToUser(targetUserId: string) {
  const user = await currentUser();
  // Hanya superadmin yang boleh menurunkan hak akses admin
  if (!user || user.publicMetadata.role !== "superadmin") {
    throw new Error("Akses ditolak.");
  }

  try {
    const client = await clerkClient();

    // 1. Dapatkan metadata pengguna yang ada saat ini
    const targetUser = await client.users.getUser(targetUserId);
    const targetRole = targetUser.publicMetadata.role as string;

    // 2. Proteksi tambahan: Superadmin tidak boleh di-demote melalui fungsi ini
    if (targetRole === "superadmin") {
      throw new Error("Tidak dapat mencabut hak akses dari sesama Superadmin.");
    }

    // 3. Update publicMetadata menjadi "user"
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: {
        role: "user"
      }
    });

    return { success: true, message: "Hak akses berhasil dicabut. Akun kembali menjadi User." };
  } catch (error: any) {
    console.error("Gagal update role (demote):", error);
    throw new Error(error.message || "Gagal memperbarui role pengguna.");
  }
}
// #endregion

// #region Delete User
export async function deleteUserAction(targetUserId: string) {
  const user = await currentUser();
  // Hanya superadmin yang boleh menghapus akun
  if (!user || user.publicMetadata.role !== "superadmin") {
    throw new Error("Akses ditolak.");
  }

  try {
    const client = await clerkClient();

    // 1. Dapatkan metadata pengguna yang ada saat ini untuk proteksi
    const targetUser = await client.users.getUser(targetUserId);
    const targetRole = targetUser.publicMetadata.role as string;

    // 2. Proteksi tambahan: Superadmin tidak boleh menghapus akun sesama Superadmin
    if (targetRole === "superadmin") {
      throw new Error("Tidak dapat menghapus akun sesama Superadmin.");
    }

    // 3. Hapus pengguna menggunakan Clerk API.
    //    Pembersihan data order (user_id di-NULL-kan + clerk_user_deleted_at)
    //    ditangani oleh Clerk Webhook `user.deleted` sebagai titik tunggal.
    await client.users.deleteUser(targetUserId);

    return { success: true, message: "Pengguna berhasil dihapus. Data transaksi tetap dipertahankan (anonim)." };
  } catch (error: any) {
    console.error("Gagal menghapus pengguna:", error);
    throw new Error(error.message || "Gagal menghapus pengguna.");
  }
}
// #endregion