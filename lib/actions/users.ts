"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

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
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Tanpa Nama",
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