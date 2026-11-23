"use server";

import { sql } from "@/lib/utils";
import type {
  ReportChartData,
  ReportKPI,
  SalesReportData,
  ServiceOrderHistory,
  TopProduct,
  TopService,
  ReportOrderHistory,
} from "@/types/global";
import { auth, currentUser } from "@clerk/nextjs/server";

const ALLOWED_ROLES = ["admin", "superadmin"];

async function requireReportAccess() {
  await auth.protect();
  const user = await currentUser();

  if (!user || !ALLOWED_ROLES.includes(user.publicMetadata.role as string)) {
    throw new Error("Akses ditolak");
  }
}

/** Rentang hari dari filter laporan; `null` berarti semua waktu. */
function resolveStartDate(range: string): string | null {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
  if (!days) return null;

  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function emptyKpi(): ReportKPI {
  return { total_revenue: 0, total_orders: 0, total_success: 0 };
}

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// #region Produk digital
async function loadProductReport(
  startDate: string | null,
): Promise<SalesReportData["product"]> {
  // 1. KPI
  const kpiData = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0)::numeric AS total_revenue,
      COUNT(order_id)::int AS total_orders,
      COUNT(CASE WHEN status = 'success' THEN 1 END)::int AS total_success
    FROM orders
    WHERE ${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz
  `;

  // 2. Grafik harian
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

  // 3. Lima produk terlaris
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

  // 4. Riwayat transaksi
  const orderHistory = await sql`
    SELECT
      o.order_id,
      o.user_id,
      o.email,
      o.amount,
      o.status,
      o.created_at,
      o.clerk_user_deleted_at,
      p.title AS product_title
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
}
// #endregion

// #region Layanan jasa
async function loadServiceReport(
  startDate: string | null,
): Promise<SalesReportData["service"]> {
  // 1. KPI
  const kpiData = await sql`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0)::numeric AS total_revenue,
      COUNT(order_id)::int AS total_orders,
      COUNT(CASE WHEN status = 'success' THEN 1 END)::int AS total_success
    FROM service_orders
    WHERE ${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz
  `;

  // 2. Grafik harian
  const chartData = await sql`
    SELECT
      TO_CHAR(created_at AT TIME ZONE 'Asia/Makassar', 'YYYY-MM-DD') AS date,
      COALESCE(SUM(CASE WHEN status IN ('success', 'challenge') THEN amount ELSE 0 END), 0)::numeric AS success_revenue,
      COALESCE(SUM(CASE WHEN status NOT IN ('success', 'challenge') THEN amount ELSE 0 END), 0)::numeric AS failed_revenue,
      COUNT(CASE WHEN status IN ('success', 'challenge') THEN 1 END)::int AS success_orders,
      COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_orders,
      COUNT(CASE WHEN status NOT IN ('success', 'challenge', 'pending') THEN 1 END)::int AS failed_orders
    FROM service_orders
    WHERE ${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz
    GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Makassar', 'YYYY-MM-DD')
    ORDER BY date ASC
  `;

  // 3. Lima layanan terlaris (satu baris per layanan + bahasa)
  const topServices = await sql`
    SELECT
      COALESCE(service_id, service_name) AS id,
      service_name AS name,
      language,
      COUNT(*)::int AS sold_count,
      COALESCE(SUM(amount), 0)::numeric AS revenue
    FROM service_orders
    WHERE status = 'success'
      AND (${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz)
    GROUP BY service_id, service_name, language
    ORDER BY revenue DESC
    LIMIT 5
  `;

  // 4. Riwayat pesanan jasa
  const orderHistory = await sql`
    SELECT
      order_id,
      user_id,
      email,
      service_name,
      service_slug,
      language,
      amount,
      status,
      whatsapp,
      created_at
    FROM service_orders
    WHERE ${startDate}::timestamptz IS NULL OR created_at >= ${startDate}::timestamptz
    ORDER BY created_at DESC
  `;

  return {
    kpi: kpiData[0] as ReportKPI,
    chart: chartData as ReportChartData[],
    topServices: topServices as TopService[],
    orderHistory: orderHistory as ServiceOrderHistory[],
  };
}
// #endregion

/**
 * Data laporan penjualan lengkap: produk digital, layanan jasa, dan KPI
 * gabungan. Satu pintu masuk supaya halaman cukup memanggil sekali.
 */
export async function getReportData(range: string): Promise<SalesReportData> {
  await requireReportAccess();
  const startDate = resolveStartDate(range);

  try {
    const [product, service] = await Promise.all([
      loadProductReport(startDate),
      loadServiceReport(startDate),
    ]);

    const productRevenue = num(product.kpi.total_revenue);
    const serviceRevenue = num(service.kpi.total_revenue);
    const productOrders = num(product.kpi.total_orders);
    const serviceOrders = num(service.kpi.total_orders);
    const productSuccess = num(product.kpi.total_success);
    const serviceSuccess = num(service.kpi.total_success);

    return {
      product,
      service,
      combined: {
        total_revenue: productRevenue + serviceRevenue,
        total_orders: productOrders + serviceOrders,
        total_success: productSuccess + serviceSuccess,
        product_revenue: productRevenue,
        service_revenue: serviceRevenue,
        product_orders: productOrders,
        service_orders: serviceOrders,
        product_success: productSuccess,
        service_success: serviceSuccess,
      },
    };
  } catch (error) {
    console.error("Gagal mengambil data laporan:", error);

    return {
      product: {
        kpi: emptyKpi(),
        chart: [],
        topProducts: [],
        orderHistory: [],
      },
      service: {
        kpi: emptyKpi(),
        chart: [],
        topServices: [],
        orderHistory: [],
      },
      combined: {
        ...emptyKpi(),
        product_revenue: 0,
        service_revenue: 0,
        product_orders: 0,
        service_orders: 0,
        product_success: 0,
        service_success: 0,
      },
    };
  }
}
