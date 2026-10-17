"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// #region Get All Users
export async function getAllUsers() {
  // 1. Cek apakah yang mengakses adalah superadmin
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") {
    throw new Error("Akses ditolak. Hanya superadmin yang diizinkan.");
  }

  try {
    // 2. Inisialisasi Clerk Client
    const client = await clerkClient();

    // 3. Ambil daftar user (Clerk membatasi default 10, kita set limit lebih besar misal 100)
    const usersResponse = await client.users.getUserList({
      limit: 100, // Anda bisa menambahkan offset/pagination jika user sangat banyak
      orderBy: "-created_at", // Urutkan dari yang terbaru mendaftar
    });

    // 4. Petakan (mapping) data agar lebih bersih saat dikirim ke Frontend
    const users = usersResponse.data.map((u) => ({
      id: u.id,
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "[Tanpa_Nama]",
      email: u.emailAddresses[0]?.emailAddress || "Tidak ada email",
      role: (u.publicMetadata.role as string) || "user", // Default ke 'user' jika kosong
      imageUrl: u.imageUrl,
      createdAt: u.createdAt,
    }));

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
    throw new Error("Akses ditolak. Hanya superadmin yang dapat melakukan ini.");
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