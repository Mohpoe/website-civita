"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatRupiah } from "@/lib/utils";
import { ReportChartData, ReportKPI, ReportOrderHistory, TopProduct } from "@/types/global";
import { columnFilteringFeature, ColumnFiltersState, columnVisibilityFeature, ColumnVisibilityState, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_text, SortingState, tableFeatures, useTable } from "@tanstack/react-table";
import { ActivityIcon, BadgeAlertIcon, BadgeCheckIcon, BadgeXIcon, ChevronDownIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, ChevronUpIcon, Columns3Icon, CreditCardIcon, FilterIcon, GhostIcon, PackageIcon, PercentIcon, RefreshCcwIcon, Rows3Icon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface DashboardReportProps {
  kpi: ReportKPI;
  chartData: ReportChartData[];
  orderHistory: ReportOrderHistory[];
}

const chartConfig = {
  revenue: { label: "Pendapatan", color: "var(--success)" },
  ordersSuccess: { label: "Pesanan Sukses", color: "var(--success)" },
  ordersPending: { label: "Pesanan Pending", color: "var(--warning)" },
  ordersFailed: { label: "Pesanan Gagal", color: "var(--destructive)" },
} satisfies ChartConfig;

export default function DashboardReport({ kpi, chartData, orderHistory }: DashboardReportProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "30d";

  const [activeMetric, setActiveMetric] = useState<"revenue" | "orders">("revenue");

  const handleRangeChange = (value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const conversionRate = kpi.total_orders > 0
    ? ((kpi.total_success / kpi.total_orders) * 100).toFixed(1)
    : "0.0";

  // #region Table Config
  const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    sortFns: {
      alphanumeric: sortFn_alphanumeric,
      text: sortFn_text,
    },
    filterFns: {
      includesString: filterFn_includesString,
    }
  });

  const columnHelper = createColumnHelper<typeof features, ReportOrderHistory>();

  const columns = useMemo(() =>
    columnHelper.columns([
      columnHelper.accessor("created_at", {
        id: "tanggal",
        header: "Tanggal",
        cell: (info) => (
          <div className="font-mono text-xs">
            {new Date(info.getValue()).toLocaleString("id-ID", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })}
          </div>
        ),
      }),
      columnHelper.accessor("order_id", {
        id: "order_id",
        header: "Order ID",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Email Pembeli",
        cell: (info) => (
          <span className="font-medium text-sm">
            {info.getValue() || <span className="italic opacity-50">Tanpa email</span>}
          </span>
        ),
      }),
      columnHelper.accessor("product_title", {
        id: "nama_produk",
        header: "Nama Produk",
        cell: (info) => (
          <span className="font-medium max-w-[200px] truncate block" title={info.getValue() || ""}>
            {info.getValue() || <span className="italic opacity-50">Produk Dihapus</span>}
          </span>
        ),
      }),
      columnHelper.accessor("amount", {
        id: "harga",
        header: () => <div className="text-right">Harga</div>,
        cell: (info) => (
          <div className="text-right font-mono text-sm font-bold text-foreground">
            {formatRupiah(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          if (status === "success") {
            return <Badge variant="secondary" className="bg-success/15 text-success hover:bg-success/25"><BadgeCheckIcon className="w-3 h-3 mr-1" /> Sukses</Badge>;
          }
          if (status === "pending" || status === "challenge") {
            return <Badge variant="secondary" className="bg-warning/15 text-warning hover:bg-warning/25"><BadgeAlertIcon className="w-3 h-3 mr-1" /> Tertunda</Badge>;
          }
          return <Badge variant="secondary" className="bg-destructive/15 text-destructive hover:bg-destructive/25"><BadgeXIcon className="w-3 h-3 mr-1" /> Gagal/Batal</Badge>;
        },
        filterFn: (row, id, value) => {
          if (!value || value === "all") return true;
          const status = row.getValue(id) as string;
          if (value === "success") return status === "success";
          if (value === "pending") return status === "pending" || status === "challenge";
          if (value === "failed") return status === "failed" || status === "canceled" || status === "expired" || status === "deny";
          return true;
        },
      }),
    ]),
    [columnHelper]
  );

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useTable({
    features,
    columns,
    data: orderHistory || [],
    globalFilterFn: "includesString",
    state: { sorting, pagination, globalFilter, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: true,
  }, (state) => state);

  const handleResetFilters = () => {
    setGlobalFilter("");
    setSorting([]);
    setColumnFilters([]);
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  const filteredStatusValue = table.getColumn("status")?.getFilterValue() as string | undefined;
  const filteredStatus = filteredStatusValue || "all";
  // #endregion

  return (
    <div className="w-full space-y-6 pb-12">
      {/* HEADER & FILTER RANGE WAKTU */}
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
                if (value !== null) handleRangeChange(value);
              }}
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

      {
        // #region KPI Cards
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
        // #endregion
      }
      {
        // #region Grafik Penjualan
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
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillOrdersSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ordersSuccess)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-ordersSuccess)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillOrdersPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ordersPending)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-ordersPending)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillOrdersFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ordersFailed)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-ordersFailed)" stopOpacity={0.0} />
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
                        className="shadow-xl"
                        labelFormatter={(label) => new Date(label).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        formatter={(value, name, item, index) => {
                          let labelText = "";
                          if (activeMetric === "revenue") {
                            labelText = name === "success_revenue" ? "Pendapatan Bersih" : "Potensi (Gagal/Tunda)";
                          } else {
                            if (name === "success_orders") labelText = "Selesai";
                            else if (name === "pending_orders") labelText = "Tertunda";
                            else if (name === "failed_orders") labelText = "Gagal/Batal";
                          }

                          const valueText = activeMetric === "revenue" ? formatRupiah(value as number) : value;
                          const indicatorColor = item.color || item.payload?.fill;

                          return (
                            <div key={index} className="flex w-full items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: indicatorColor }} />
                                <span className="text-muted-foreground flex-1">{labelText}</span>
                              </div>
                              <span className="font-mono font-medium text-foreground tabular-nums">{valueText}</span>
                            </div>
                          );
                        }}
                      />
                    }
                  />

                  {activeMetric === "revenue" ? (
                    <Area
                      dataKey="success_revenue"
                      type="monotone"
                      fill="url(#fillRevenue)"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  ) : (
                    <>
                      {/* Urutan penting: Dari yang paling bawah (gagal) ditumpuk ke atas (sukses) */}
                      <Area
                        dataKey="failed_orders"
                        type="monotone"
                        fill="url(#fillOrdersFailed)"
                        stroke="var(--color-ordersFailed)"
                        strokeWidth={2}
                      // stackId="orders"
                      />
                      <Area
                        dataKey="pending_orders"
                        type="monotone"
                        fill="url(#fillOrdersPending)"
                        stroke="var(--color-ordersPending)"
                        strokeWidth={2}
                      // stackId="orders"
                      />
                      <Area
                        dataKey="success_orders"
                        type="monotone"
                        fill="url(#fillOrdersSuccess)"
                        stroke="var(--color-ordersSuccess)"
                        strokeWidth={2}
                        // stackId="orders"
                        activeDot={{ r: 6 }}
                      />
                    </>
                  )}
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        // #endregion
      }
      {
        // #region Riwayat Transaksi
        <Card className="shadow-md mt-6">
          <CardHeader className="border-b">
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>Daftar lengkap seluruh aktivitas pesanan.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 mt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">

              {/* DATATABLE MENU */}
              <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="min-h-8 text-sm w-full" />}>
                    <SlidersHorizontalIcon className="mr-2" /> Atur Tabel <ChevronDownIcon className="size-4 ml-2 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-64" align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Filter</DropdownMenuLabel>

                      {/* Status Filter */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger><FilterIcon /> Status Pesanan</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuLabel>Pilih Status</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={filteredStatus} onValueChange={(val) => {
                              table.getColumn("status")?.setFilterValue(val === "all" ? undefined : val);
                            }}>
                              <DropdownMenuRadioItem value="all">Semua Status</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="success">Sukses</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="pending">Tertunda (Pending)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="failed">Gagal / Dibatalkan</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Tampilan</DropdownMenuLabel>

                      {/* Column Visibility */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger><Columns3Icon /> Tampilkan Kolom</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Daftar Kolom</DropdownMenuLabel>
                              {table.getAllColumns().filter(col => col.getCanHide()).map(col => (
                                <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={val => col.toggleVisibility(!!val)}>
                                  {col.id.replace("_", " ")}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      {/* Rows per page */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger><Rows3Icon /> Jumlah Baris</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuLabel>Tampilkan baris</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={table.state.pagination.pageSize === table.getCoreRowModel().rows.length ? "all" : String(table.state.pagination.pageSize)} onValueChange={val => {
                              table.setPageSize(val === "all" ? table.getCoreRowModel().rows.length : Number(val));
                            }}>
                              {[10, 20, 50, 100].map(size => <DropdownMenuRadioItem key={size} value={String(size)}>{size}</DropdownMenuRadioItem>)}
                              <DropdownMenuRadioItem value="all">Semua ({table.getCoreRowModel().rows.length})</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleResetFilters}>
                        <RefreshCcwIcon /> Reset Pengaturan
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* DATATABLE SEARCH */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto border-t pt-4 lg:border-none lg:pt-0">
                <Field className="flex-1 lg:w-64">
                  <InputGroup className="w-full min-h-8">
                    <InputGroupInput className="text-sm!" type="search" placeholder="Cari pesanan, email, dll..." autoComplete="off" value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} />
                    <InputGroupAddon><SearchIcon className="size-4" /></InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>
            </div>

            {/* UPPER PAGINATION */}
            {table.getRowModel().rows?.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-medium text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                    Baris <span className="font-bold text-foreground">{table.getFilteredRowModel().rows.length > 0 ? table.state.pagination.pageIndex * table.state.pagination.pageSize + 1 : 0}</span> s/d <span className="font-bold text-foreground">{Math.min(table.state.pagination.pageIndex * table.state.pagination.pageSize + table.state.pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> dari <span className="font-bold text-foreground">{table.getFilteredRowModel().rows.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button variant="outline" className="size-8 p-0" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronFirstIcon className="size-4" /></Button>
                    <Button variant="outline" className="size-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeftIcon className="size-4" /></Button>
                    <div className="flex h-8 items-center justify-center rounded-md border bg-muted/40 px-3 text-xs font-bold tabular-nums">
                      {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
                    </div>
                    <Button variant="outline" className="size-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRightIcon className="size-4" /></Button>
                    <Button variant="outline" className="size-8 p-0" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronLastIcon className="size-4" /></Button>
                  </div>
                </div>
              </>
            )}

            {/* TABLE COMPONENT */}
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                          {header.column.getCanSort() ? (
                            <Button variant="ghost" className="p-0 m-0 flex justify-between w-full">
                              <div className="flex">{header.isPlaceholder ? null : <table.FlexRender header={header} />}</div>
                              <div className="flex">
                                {header.column.getCanSort() && (
                                  <span className="opacity-40">
                                    {(() => {
                                      const sortState = header.column.getIsSorted();
                                      if (sortState === 'asc') return <ChevronUpIcon />;
                                      if (sortState === 'desc') return <ChevronDownIcon />;
                                      return <ChevronsUpDownIcon />;
                                    })()}
                                  </span>
                                )}
                              </div>
                            </Button>
                          ) : header.isPlaceholder ? null : <table.FlexRender header={header} />}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="*:border-border [&>:not(:last-child)]:border-r">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50 py-10">
                          <GhostIcon className="size-20" />
                          <p className="font-medium italic">Tidak ada riwayat transaksi ditemukan.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* LOWER PAGINATION */}
          {table.getRowModel().rows?.length > 0 && (
            <CardFooter>
              <div className="flex w-full flex-col items-center justify-between gap-4 py-1 lg:flex-row lg:gap-8">
                <div className="order-2 text-xs font-medium lg:order-1 lg:flex-1">
                  <span className="opacity-50">Baris</span> {table.getFilteredRowModel().rows.length > 0 ? table.state.pagination.pageIndex * table.state.pagination.pageSize + 1 : 0} <span className="opacity-50">s/d</span> {Math.min(table.state.pagination.pageIndex * table.state.pagination.pageSize + table.state.pagination.pageSize, table.getFilteredRowModel().rows.length)} <span className="opacity-50">dari</span> <span className="font-bold">{table.getFilteredRowModel().rows.length}</span>
                </div>
                <div className="order-1 flex items-center gap-1.5 lg:order-2">
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronFirstIcon className="size-4" /></Button>
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeftIcon className="size-4" /></Button>
                  <div className="flex h-8 items-center justify-center rounded-md border bg-muted/50 px-3 text-xs font-bold sm:hidden">
                    {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
                  </div>
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRightIcon className="size-4" /></Button>
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronLastIcon className="size-4" /></Button>
                </div>
                <div className="order-3 hidden text-right text-xs font-medium lg:block lg:flex-1">
                  <span className="opacity-50">Halaman</span> <span className="font-bold">{table.state.pagination.pageIndex + 1}</span> <span className="opacity-50">dari</span> <span className="font-bold">{table.getPageCount()}</span>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
        // #endregion
      }
    </div>
  );
}