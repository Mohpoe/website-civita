"use server";

import { sql } from "@/lib/utils";
import { ReportChartData, ReportKPI, TopProduct, ReportOrderHistory } from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getReportData(range: string) {
  await auth.protect();
  const user = await currentUser();
  if (!user || (user.publicMetadata.role !== "admin" && user.publicMetadata.role !== "superadmin")) {
    throw new Error("Akses ditolak");
  }

  let startDate: string | null = null;
  const now = new Date();
  if (range === "7d") startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
  else if (range === "30d") startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
  else if (range === "90d") startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();

  try {
    // 1. Ambil KPI
    const kpiData = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0)::numeric AS total_revenue,
        COUNT(order_id)::int AS total_orders,
        COUNT(CASE WHEN status = 'success' THEN 1 END)::int AS total_success
      FROM orders
      WHERE ${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz
    `;

    // 2. Ambil Data Grafik Harian
    const chartData = await sql`
      SELECT
        TO_CHAR(created_at AT TIME ZONE 'Asia/Makassar', 'YYYY-MM-DD') AS date,
        COALESCE(SUM(CASE WHEN status IN ('success', 'challenge') THEN amount ELSE 0 END), 0)::numeric AS success_revenue,
        COALESCE(SUM(CASE WHEN status NOT IN ('success', 'challenge') THEN amount ELSE 0 END), 0)::numeric AS failed_revenue,
        COUNT(CASE WHEN status IN ('success', 'challenge') THEN 1 END)::int AS success_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_orders,
        COUNT(CASE WHEN status NOT IN ('success', 'challenge', 'pending') THEN 1 END)::int AS failed_orders
      FROM orders
      WHERE ${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Makassar', 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    // 3. Ambil 5 Produk Terlaris
    const topProducts = await sql`
      SELECT
        p.id,
        p.title,
        COALESCE(c.name, 'Tanpa Kategori') AS category,
        COUNT(o.order_id)::int AS sold_count,
        COALESCE(SUM(o.amount), 0)::numeric AS revenue
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN orders o ON p.id = o.product_id
      WHERE o.status = 'success'
        AND (${startDate}::timestamptz IS NULL OR o.created_at >= ${startDate}::timestamptz)
      GROUP BY p.id, p.title, c.name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    // 4. Ambil Riwayat Transaksi Lengkap
    const orderHistory = await sql`
      SELECT
        o.order_id,
        o.email,
        o.amount,
        o.status,
        o.created_at,
        o.clerk_user_deleted_at,
        p.title as product_title
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE ${startDate}::timestamptz IS NULL OR o.created_at >= ${startDate}::timestamptz
      ORDER BY o.created_at DESC
    `;

    return {
      kpi: kpiData[0] as ReportKPI,
      chart: chartData as ReportChartData[],
      topProducts: topProducts as TopProduct[],
      orderHistory: orderHistory as ReportOrderHistory[],
    };
  } catch (error) {
    console.error("Gagal mengambil data laporan:", error);
    return {
      kpi: { total_revenue: 0, total_orders: 0, total_success: 0 },
      chart: [],
      topProducts: [],
      orderHistory: [],
    };
  }
}