"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatRupiah } from "@/lib/utils";
import { ReportChartData, ReportKPI, TopProduct } from "@/types/global";
import { ActivityIcon, CreditCardIcon, PackageIcon, PercentIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface DashboardReportProps {
  kpi: ReportKPI;
  chartData: ReportChartData[];
  topProducts: TopProduct[];
}

const chartConfig = {
  revenue: { label: "Pendapatan", color: "var(--success)" },
  orders: { label: "Pesanan", color: "var(--warning)" },
} satisfies ChartConfig;

export default function DashboardReport({ kpi, chartData, topProducts }: DashboardReportProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "30d";

  const [activeMetric, setActiveMetric] = useState<"revenue" | "orders">("revenue");

  // Handler untuk mengubah parameter URL berdasarkan filter
  const handleRangeChange = (value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Kalkulasi Tingkat Konversi (Success / Total * 100)
  const conversionRate = kpi.total_orders > 0
    ? ((kpi.total_success / kpi.total_orders) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Laporan Analitik</h2>
          <p className="text-muted-foreground">Ringkasan performa penjualan produk digital (WITA).</p>
        </div>

        {
          // #region Filter Rentang Waktu
          <div className="flex items-center">
            <ToggleGroup
              multiple={false}
              value={currentRange ? [currentRange] : []}
              onValueChange={(value) => handleRangeChange(value[0] ?? "30d")}
              variant="outline"
              className="hidden md:flex"
            >
              <ToggleGroupItem value="7d">7 Hari</ToggleGroupItem>
              <ToggleGroupItem value="30d">30 Hari</ToggleGroupItem>
              <ToggleGroupItem value="90d">90 Hari</ToggleGroupItem>
              <ToggleGroupItem value="all">Semua Waktu</ToggleGroupItem>
            </ToggleGroup>

            <Select
              value={currentRange}
              onValueChange={(value) => {
                if (value !== null) {
                  handleRangeChange(value);
                }
              }}
              items={[
                { value: "7d", label: "7 Hari Terakhir" },
                { value: "30d", label: "30 Hari Terakhir" },
                { value: "90d", label: "90 Hari Terakhir" },
                { value: "all", label: "Semua Waktu" },
              ]}
            >
              <SelectTrigger className="w-full md:hidden">
                <SelectValue placeholder="Pilih rentang waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                <SelectItem value="all">Semua Waktu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          // #endregion
        }
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Bersih</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(kpi.total_revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Dari {kpi.total_success} pesanan berhasil</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.total_orders}</div>
            <p className="text-xs text-muted-foreground mt-1">Termasuk pesanan tertunda & batal</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Konversi</CardTitle>
            <PercentIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Persentase keberhasilan bayar</p>
          </CardContent>
        </Card>
      </div>

      {
        // #region Interactive Chart
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <CardTitle>Grafik Penjualan</CardTitle>
              <CardDescription>Visualisasi performa berdasarkan rentang waktu terpilih</CardDescription>
            </div>
            <div className="mt-4 sm:mt-0 flex p-1 bg-muted rounded-lg w-fit">
              <button
                onClick={() => setActiveMetric("revenue")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeMetric === "revenue" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Pendapatan
              </button>
              <button
                onClick={() => setActiveMetric("orders")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeMetric === "orders" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Pesanan
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-6 sm:px-6">
            {chartData.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ActivityIcon className="w-10 h-10 opacity-20" />
                <p>Belum ada data untuk rentang waktu ini.</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
                <AreaChart data={chartData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeMetric === "revenue" ? "var(--color-revenue)" : "var(--color-orders)"} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={activeMetric === "revenue" ? "var(--color-revenue)" : "var(--color-orders)"} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => activeMetric === "revenue" ? `Rp ${(value / 1000)}k` : value}
                    width={activeMetric === "revenue" ? 60 : 30}
                  />
                  <ChartTooltip
                    cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={
                      <ChartTooltipContent
                        // className="w-[260px] gap-3 p-3 shadow-xl"
                        labelFormatter={(label) => new Date(label).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        formatter={(value, name) => {
                          if (activeMetric === "revenue") {
                            return [formatRupiah(value as number), name === "success_revenue" ? "Pendapatan Bersih" : "Potensi (Gagal/Tunda)"];
                          }
                          return [value, name === "success_orders" ? "Pesanan Sukses" : "Pesanan Gagal/Tunda"];
                        }}
                      />
                    }
                  />
                  <Area
                    dataKey={activeMetric === "revenue" ? "success_revenue" : "success_orders"}
                    type="monotone"
                    fill="url(#fillGradient)"
                    stroke={activeMetric === "revenue" ? "var(--color-revenue)" : "var(--color-orders)"}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        // #endregion
      }

      {
        // #region Top Products
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
            <CardDescription>Berdasarkan pendapatan bersih dalam rentang waktu terpilih.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Terjual</TableHead>
                    <TableHead className="text-right">Pendapatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                        Belum ada penjualan produk.
                      </TableCell>
                    </TableRow>
                  ) : (
                    topProducts.map((product, idx) => (
                      <TableRow key={product.id}>
                        <TableCell className="text-center font-medium text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell><span className="bg-muted px-2 py-1 rounded-md text-xs">{product.category}</span></TableCell>
                        <TableCell className="text-center font-mono">{product.sold_count}</TableCell>
                        <TableCell className="text-right font-mono font-medium text-success">{formatRupiah(product.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        // #endregion
      }
    </div>
  );
}