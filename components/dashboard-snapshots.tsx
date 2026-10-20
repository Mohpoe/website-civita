"use client";

import {
  columnFilteringFeature,
  ColumnFiltersState,
  columnVisibilityFeature,
  ColumnVisibilityState,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  SortingState,
  tableFeatures,
  useTable
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArchiveRestoreIcon,
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  Columns3Icon,
  GhostIcon,
  MoreHorizontalIcon,
  RefreshCcwIcon,
  Rows3Icon,
  SearchIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UserX
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { restoreSnapshotAction } from "@/lib/actions/snapshots";
import { ProductSnapshot } from "@/types/global";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "./ui/alert-dialog";

interface DashboardSnapshotsProps {
  snapshots: ProductSnapshot[];
}

export default function DashboardSnapshots({ snapshots: initialSnapshots }: DashboardSnapshotsProps) {
  const [isPending, startTransition] = useTransition();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  const confirmRestore = () => {
    if (!selectedSnapshotId) return;

    startTransition(async () => {
      try {
        const res = await restoreSnapshotAction(selectedSnapshotId);

        if (res?.success) {
          toast.add({ type: "success", description: res.message });
          setIsAlertOpen(false);
          setSelectedSnapshotId(null);
          // Refresh halaman untuk memuat ulang data
          window.location.reload();
        } else {
          toast.add({ type: "error", description: res.message || "Gagal memulihkan produk.", priority: "high" });
        }
      } catch (error: any) {
        toast.add({ type: "error", description: error.message || "Gagal memulihkan produk.", priority: "high" });
      }
    });
  };

  // #region Column Config
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

  const columnHelper = createColumnHelper<typeof features, ProductSnapshot>();

  const columns = useMemo(() =>
    columnHelper.columns([
      // 1. Kolom Nomor
      columnHelper.display({
        id: "nomor",
        header: () => <div className="text-center text-muted-foreground w-full">#</div>,
        cell: ({ row }) => <div className="text-center font-mono text-sm text-muted-foreground">{row.index + 1}</div>,
        enableHiding: false,
      }),

      // 2. Kolom Informasi Produk + Thumbnail
      columnHelper.accessor("title", {
        id: "informasi_produk",
        header: "Informasi Produk",
        cell: ({ row }) => {
          const snap = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border shrink-0 overflow-hidden">
                {snap.image_url ? (
                  <img src={snap.image_url} alt={snap.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserX className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex flex-col max-w-[250px]">
                <span className="font-semibold text-foreground truncate" title={snap.title}>
                  {snap.title}
                </span>
                <span className="text-xs text-muted-foreground truncate" title={snap.short_desc || ""}>
                  {snap.short_desc || "Tidak ada deskripsi"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  <UserX className="w-3 h-3 inline mr-1" /> Dihapus pada{" "}
                  <time dateTime={snap.deleted_at}>
                    {new Date(snap.deleted_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </span>
              </div>
            </div>
          );
        },
      }),

      // 3. Kolom Harga
      columnHelper.accessor("price", {
        id: "harga",
        header: () => <div className="text-right">Harga</div>,
        cell: (info) => (
          <div className="text-right font-mono text-sm font-bold text-foreground">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(info.getValue())}
          </div>
        ),
      }),

      // 4. Kolom Aksi (Restore & Hapus Permanen Coming Soon)
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          const snap = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                  <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full rounded-xl shadow-lg">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Pilih Menu</DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedSnapshotId(snap.id);
                        setIsAlertOpen(true);
                      }}
                      disabled={isPending}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      {isPending && selectedSnapshotId === snap.id ? "Memulihkan..." : "Pulihkan Produk"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => { /* coming soon - no action */ }}
                      disabled
                    >
                      <Trash2Icon className="w-4 h-4 mr-2 opacity-50" />
                      Hapus Permanen <span className="text-xs opacity-60">(Coming Soon)</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableHiding: false,
      }),
    ]),
    [columnHelper, isPending, selectedSnapshotId]
  );
  // #endregion

  // #region Table State
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useTable({
    features,
    columns,
    data: initialSnapshots || [],
    globalFilterFn: "includesString",
    state: {
      sorting,
      pagination,
      globalFilter,
      columnVisibility,
      columnFilters,
    },
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
    setColumnVisibility({});
    setPagination({ pageIndex: 0, pageSize: 10 });
  };
  // #endregion

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Arsip Produk</CardTitle>
          <CardDescription>Daftar produk yang telah dihapus karena memiliki transaksi. Data dapat dipulihkan kapan saja.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
            {
              // #region Datatable Menu
              <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="min-h-8 text-sm w-full" />}>
                    <SlidersHorizontalIcon />
                    Atur Tabel
                    <ChevronDownIcon className="size-4 ml-2 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-64" align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Kolom</DropdownMenuLabel>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Columns3Icon />
                          Tampilkan
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Tampilkan kolom</DropdownMenuLabel>
                              {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                                <DropdownMenuCheckboxItem
                                  key={col.id}
                                  className="capitalize"
                                  checked={col.getIsVisible()}
                                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                                >
                                  {col.id.replace("_", " ")}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Baris</DropdownMenuLabel>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Rows3Icon />
                          Tampilkan
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuLabel>Tampilkan baris</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                              value={
                                table.state.pagination.pageSize === table.getCoreRowModel().rows.length
                                  ? "all"
                                  : String(table.state.pagination.pageSize)
                              }
                              onValueChange={(val) => {
                                if (val === "all") {
                                  table.setPageSize(table.getCoreRowModel().rows.length);
                                } else {
                                  table.setPageSize(Number(val));
                                }
                              }}
                            >
                              {[10, 20, 50, 100].map((size) => (
                                <DropdownMenuRadioItem key={size} value={String(size)}>
                                  {size}
                                </DropdownMenuRadioItem>
                              ))}
                              <DropdownMenuRadioItem value="all">
                                Semua ({table.getCoreRowModel().rows.length})
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={handleResetFilters}>
                        <RefreshCcwIcon />
                        Reset
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              // #endregion
            }


            {
              // #region Datatable Search
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto border-t pt-4 lg:border-none lg:pt-0">
                <Field className="flex-1 lg:w-64">
                  <InputGroup className="w-full min-h-8">
                    <InputGroupInput
                      className="text-sm!"
                      type="search"
                      placeholder="Cari nama produk..."
                      autoComplete="off"
                      value={globalFilter ?? ""}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                    <InputGroupAddon>
                      <SearchIcon className="size-4" />
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </div>
              // #endregion
            }
          </div>

          {
            // #region Upper Pagination
            table.getRowModel().rows?.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-medium text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                    Baris{" "}
                    <span className="font-bold text-foreground">
                      {table.getFilteredRowModel().rows.length > 0
                        ? table.state.pagination.pageIndex * table.state.pagination.pageSize + 1
                        : 0}
                    </span>
                    {" "}s/d{" "}
                    <span className="font-bold text-foreground">
                      {Math.min(
                        table.state.pagination.pageIndex * table.state.pagination.pageSize +
                        table.getRowModel().rows.length,
                        table.getFilteredRowModel().rows.length
                      )}
                    </span>
                    {" "}dari{" "}
                    <span className="font-bold text-foreground">{table.getFilteredRowModel().rows.length}</span>
                  </div>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      className="size-8 p-0"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                      title="Halaman Pertama"
                    >
                      <ChevronFirstIcon className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8 p-0"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeftIcon className="size-4" />
                    </Button>

                    <div className="flex h-8 items-center justify-center rounded-md border bg-muted/40 px-3 text-xs font-bold tabular-nums">
                      {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
                    </div>

                    <Button
                      variant="outline"
                      className="size-8 p-0"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      title="Halaman Selanjutnya"
                    >
                      <ChevronRightIcon className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8 p-0"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                      title="Halaman Terakhir"
                    >
                      <ChevronLastIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            )
            // #endregion
          }

          {
            // #region Datatable
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                          {header.column.getCanSort() ? (
                            <Button variant="ghost" className="p-0 m-0 flex justify-between w-full">
                              <div className="flex">
                                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                              </div>
                              <div className="flex">
                                {header.column.getCanSort() && (
                                  <span className="opacity-40">
                                    {(() => {
                                      const sortState = header.column.getIsSorted();
                                      if (sortState === "asc") return <ChevronUpIcon />;
                                      if (sortState === "desc") return <ChevronDownIcon />;
                                      return <ChevronsUpDownIcon />;
                                    })()}
                                  </span>
                                )}
                              </div>
                            </Button>
                          ) : header.isPlaceholder ? null : (
                            <table.FlexRender header={header} />
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="*:border-border [&>:not(:last-child)]:border-r hover:bg-muted/30">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2 px-4">
                            <table.FlexRender cell={cell} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50 py-10">
                          <GhostIcon className="size-20" />
                          <p className="font-medium italic">Belum ada produk di arsip.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            // #endregion
          }
        </CardContent>

        {
          // #region Lower Pagination
          table.getRowModel().rows?.length > 0 && (
            <CardFooter>
              <div className="flex w-full flex-col items-center justify-between gap-4 py-1 lg:flex-row lg:gap-8">
                <div className="order-2 text-xs font-medium lg:order-1 lg:flex-1">
                  <span className="opacity-50">Baris</span>{" "}
                  {table.getFilteredRowModel().rows.length > 0
                    ? table.state.pagination.pageIndex * table.state.pagination.pageSize + 1
                    : 0}
                  {" "}<span className="opacity-50">s/d</span>{" "}
                  {table.state.pagination.pageIndex * table.state.pagination.pageSize + table.getRowModel().rows.length}
                  {" "}<span className="opacity-50">dari</span>{" "}
                  <span className="font-bold">{table.getFilteredRowModel().rows.length}</span>
                </div>

                <div className="order-1 flex items-center gap-1.5 lg:order-2">
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    title="Halaman Pertama"
                  >
                    <ChevronFirstIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>

                  <div className="flex h-8 items-center justify-center rounded-md border bg-muted/50 px-3 text-xs font-bold sm:hidden">
                    {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
                  </div>

                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    title="Halaman Terakhir"
                  >
                    <ChevronLastIcon className="size-4" />
                  </Button>
                </div>

                <div className="order-3 hidden text-right text-xs font-medium lg:block lg:flex-1">
                  <span className="opacity-50">Halaman</span>{" "}
                  <span className="font-bold">{table.state.pagination.pageIndex + 1}</span>{" "}
                  <span className="opacity-50">dari</span>{" "}
                  <span className="font-bold">{table.getPageCount()}</span>
                </div>
              </div>
            </CardFooter>
          )
          // #endregion
        }
      </Card>

      {
        // #region Restore Confirm Dialog
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <ArchiveRestoreIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Pulihkan Produk?</AlertDialogTitle>
              <AlertDialogDescription>
                Yakin akan memulihkan produk ini untuk ditampilkan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setIsAlertOpen(false);
                  setSelectedSnapshotId(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                variant="default"
                disabled={isPending}
                onClick={confirmRestore}
              >
                {isPending ? "Memproses..." : "Pulihkan Produk"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        // #endregion
      }
    </>
  );
}

