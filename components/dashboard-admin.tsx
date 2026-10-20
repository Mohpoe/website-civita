"use client";

import { deleteBlobFileAction, deleteProductAction, upsertProductAction } from "@/lib/actions/product";
import { formatRupiah } from "@/lib/utils";
import { Category, Order, Product, ProductSnapshot } from "@/types/global";
import { columnFilteringFeature, ColumnFiltersState, columnVisibilityFeature, ColumnVisibilityState, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_text, SortingState, tableFeatures, useTable } from "@tanstack/react-table";
import { uploadPresigned } from "@vercel/blob/client";
import { BadgeAlertIcon, BadgeCheckIcon, BadgeXIcon, ChevronDownIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsUpDownIcon, ChevronUpIcon, Columns3Icon, DownloadIcon, EyeIcon, FileTextIcon, GhostIcon, ImageIcon, MoreHorizontalIcon, PlusIcon, RefreshCcwIcon, Rows3Icon, SearchIcon, SlidersHorizontalIcon, SquarePenIcon, TagsIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "./ui/alert-dialog";
import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "./ui/attachment";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Spinner } from "./ui/spinner";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSnapshots from "@/components/dashboard-snapshots";

interface DashboardAdminProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  snapshots: ProductSnapshot[];
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function DashboardAdmin({ products, categories, orders, snapshots }: DashboardAdminProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("produk");

  // #region Create/Update States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [upsertState, upsertFormAction, upsertIsPending] = useActionState(upsertProductAction, null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // 1. Trigger untuk Tambah Produk
  const handleCreate = () => {
    setProductToUpdate(null);
    setImagePreview(null);
    setIsDialogOpen(true);
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setUploadProgress(0);
  };
  // 2. Toast Handler
  useEffect(() => {
    if (!upsertState) return;
    if (upsertState.success) {
      setIsDialogOpen(false);
      setImagePreview(null);
      setProductToUpdate(null);
      toast.add({
        type: "success",
        description: upsertState.message,
      });
    } else {
      toast.add({
        type: "error",
        description: upsertState.message,
        priority: "high",
      });
    }
  }, [upsertState]);
  // #endregion CREATE & UPDATE STATES (Tambah & Edit Produk)

  // #region Delete States
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", productToDelete);
      const res = await deleteProductAction(formData);

      if (res.success) {
        setIsAlertOpen(false);
        setProductToDelete(null);
        toast.add({
          type: "success",
          description: res.message,
        });
      } else {
        toast.add({
          type: "error",
          description: res.message,
          priority: "high"
        });
      }
    });
  };
  // #endregion

  // #region Column
  // 0. Rekap Statistik Pesanan
  const orderStats = useMemo(() => {
    const stats: Record<string, { success: number; pending: number; failed: number }> = {};
    orders?.forEach(order => {
      if (!order.product_id) return;
      if (!stats[order.product_id]) stats[order.product_id] = { success: 0, pending: 0, failed: 0 };

      // Hitung Success
      if (order.status === "success") stats[order.product_id].success += 1;

      // Hitung Pending (dan Challenge karena belum lunas)
      if (order.status === "pending" || order.status === "challenge") stats[order.product_id].pending += 1;

      // Hitung Semua Jenis Kegagalan
      if (order.status === "expired" || order.status === "failed" || order.status === "canceled") {
        stats[order.product_id].failed += 1;
      }
    });
    return stats;
  }, [orders]);

  // 1. Table Initiation
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

  const columnHelper = createColumnHelper<typeof features, Product>();
  const columns = useMemo(() =>
    columnHelper.columns([
      // 1. Kolom Nomor Urut
      columnHelper.display({
        id: "nomor",
        header: () => <div className="text-center w-8 text-muted-foreground w-full">#</div>,
        cell: ({ row }) => <div className="text-center font-mono text-sm text-muted-foreground">{row.index + 1}</div>,
        enableHiding: false,
      }),

      // 2. Kolom ID Produk (Opsional, disembunyikan jika memakan tempat)
      columnHelper.accessor("id", {
        header: "ID Produk",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {info.getValue()}
          </span>
        ),
        enableHiding: false,
      }),

      // 3. Kolom Nama Produk + Deskripsi Singkat + Thumbnail
      columnHelper.accessor("title", {
        id: "informasi_produk",
        header: "Informasi Produk",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-3">
              {/* Thumbnail Image */}
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border shrink-0 overflow-hidden">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                )}
              </div>
              {/* Teks Informasi */}
              <div className="flex flex-col max-w-[250px]">
                <span className="font-semibold text-foreground truncate" title={product.title}>
                  {product.title}
                </span>
                <span className="text-xs text-muted-foreground truncate" title={product.short_desc}>
                  {product.short_desc || "Tidak ada deskripsi"}
                </span>
              </div>
            </div>
          );
        },
      }),

      // 4. Kolom Kategori
      columnHelper.accessor("category_id", {
        id: "kategori",
        header: "Kategori",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-medium bg-muted/50 border-border">
            {row.original.category?.name || "[Tanpa_kategori]"}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          if (!value || value.length === 0) return true;
          return value.includes(row.getValue(id));
        },
      }),

      // 5. Kolom Harga
      columnHelper.accessor("price", {
        id: "harga",
        header: "Harga",
        // header: () => <div className="text-right">Harga</div>,
        cell: (info) => (
          <div className="text-right font-mono text-sm font-medium">
            {formatRupiah(info.getValue())}
          </div>
        ),
      }),

      columnHelper.accessor(row => orderStats[row.id]?.success || 0, {
        id: "terjual",
        header: () => <BadgeCheckIcon className="text-success" />,
        cell: (info) => (
          <div className="flex flex-col text-center">
            <span className="text-xs text-muted-foreground">Laku:</span>
            <span className="font-semibold bg-success/80 rounded-full text-background">{info.getValue() > 0 ? info.getValue() : "--"}</span>
          </div>
        )
      }),

      columnHelper.accessor(row => orderStats[row.id]?.pending || 0, {
        id: "menunggu",
        header: () => <BadgeAlertIcon className="text-warning" />,
        cell: (info) => (
          <div className="flex flex-col text-center">
            <span className="text-xs text-muted-foreground">Tunda:</span>
            <span className="font-semibold bg-warning/80 rounded-full text-background">{info.getValue() > 0 ? info.getValue() : "--"}</span>
          </div>
        )
      }),

      columnHelper.accessor(row => orderStats[row.id]?.failed || 0, {
        id: "gagal",
        header: () => <BadgeXIcon className="text-destructive" />,
        cell: (info) => (
          <div className="flex flex-col text-center">
            <span className="text-xs text-muted-foreground">Gagal:</span>
            <span className="font-semibold bg-destructive/80 rounded-full text-background">{info.getValue() > 0 ? info.getValue() : "--"}</span>
          </div>
        )
      }),

      // 6. Kolom Status
      columnHelper.accessor("is_active", {
        id: "status",
        header: "Status",
        cell: (info) => {
          return info.getValue() ? (
            <Badge variant="secondary">
              <BadgeCheckIcon data-icon="inline-start" className="text-success" /> Aktif
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-muted-foreground">
              <BadgeXIcon data-icon="inline-start" className="text-destructive" /> Nonaktif
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value.length === 0) return true;
          return value.includes(row.getValue(id));
        },
      }),

      columnHelper.accessor("short_desc", {
        id: "keterangan",
        header: "Keterangan",
      }),

      columnHelper.accessor("long_desc", {
        id: "deskripsi",
        header: "Deskripsi",
      }),

      // 7. Kolom Aksi (Edit & Delete)
      columnHelper.display({
        id: "actions",
        cell: ({ row, table }) => {
          const product = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" />}>
                  <span className="sr-only">Buka menu aksi</span>
                  <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-border shadow-lg">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      Pilih Menu
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => window.open(`/api/download?productId=${product.id}`, '_blank')}
                      disabled={!product.file_url}
                    >
                      <DownloadIcon />
                      Unduh Berkas
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => {
                      setProductToUpdate(product);
                      setImagePreview(product.image_url || null);
                      setIsDialogOpen(true);
                      if (product.file_url) {
                        const fileName = product.file_url.split('/').pop() || "file-produk";
                        const ext = fileName.split('.').pop()?.toUpperCase() || "FILE";
                        setSelectedFile({
                          name: fileName,
                          size: "Tersimpan di server",
                          type: ext,
                        });
                        setUploadedFileUrl(product.file_url);
                      } else {
                        setSelectedFile(null);
                        setUploadedFileUrl(null);
                      }
                    }}>
                      <SquarePenIcon />
                      Edit Produk
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      disabled={isPending}
                    >
                      <Trash2Icon />
                      Hapus Produk
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
    [columnHelper, isPending]
  );
  // #endregion

  // #region Table
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({
    keterangan: false,
    deskripsi: false,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const handleResetFilters = () => {
    setGlobalFilter("");
    setSorting([]);
    setColumnFilters([]);
    setColumnVisibility({
      keterangan: false,
      deskripsi: false,
    });
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
  };

  const table = useTable({
    features,
    columns,
    data: products || [],
    globalFilterFn: "includesString",
    state: {
      sorting,
      pagination,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: true,
  }, (state) => state);

  // Untuk menu dropdown di atas datatable
  const filteredKategori = (table.getColumn("kategori")?.getFilterValue() as string[]) ?? [];
  const filteredStatusValue = table.getColumn("status")?.getFilterValue() as boolean[] | undefined;
  const filteredStatus = filteredStatusValue !== undefined ? String(filteredStatusValue[0]) : "all";
  // #endregion

  // #region List Definition
  const categoryList = useMemo(() => categories?.map((cat) => ({
    label: cat.name,
    value: cat.id
  })), [categories]);
  // #endregion

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full mb-4" variant="line">
        <TabsTrigger value="produk" className="flex-1 px-4 py-2">
          Produk Digital
        </TabsTrigger>
        <TabsTrigger value="arsip" className="flex-1 px-4 py-2">
          Arsip Produk
        </TabsTrigger>
      </TabsList>

      <TabsContent value="produk" className="w-full">
        <Card className="shadow-md">
          <CardHeader className="border-b">
            <CardTitle>Kelola Produk Digital</CardTitle>
            <CardDescription>Silakan atur produk digital yang ingin dijual.</CardDescription>
            <CardAction>
              <Button variant="outline" onClick={() => {
                handleCreate();
                setIsDialogOpen(true);
              }}>
                <PlusIcon />
                <span className="hidden md:block">Tambah</span>
              </Button>
            </CardAction>
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
                            <TagsIcon />
                            Kategori
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Pilih kategori</DropdownMenuLabel>
                                <DropdownMenuCheckboxItem
                                  checked={filteredKategori.length === categories.length || filteredKategori.length === 0}
                                  onCheckedChange={() => table.getColumn("kategori")?.setFilterValue(undefined)}
                                >
                                  Semua kategori
                                </DropdownMenuCheckboxItem>
                                {categories.map((category) => (
                                  <DropdownMenuCheckboxItem
                                    key={category.id}
                                    checked={filteredKategori.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      const newFilters = checked
                                        ? [...filteredKategori, category.id]
                                        : filteredKategori.filter((id) => id !== category.id);
                                      table.getColumn("kategori")?.setFilterValue(newFilters.length === 0 || newFilters.length === categories.length ? undefined : newFilters);
                                    }}
                                  >
                                    {category.name}
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <EyeIcon />
                            Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuLabel>Pilih status produk</DropdownMenuLabel>
                              <DropdownMenuRadioGroup
                                value={filteredStatus}
                                onValueChange={(val) => {
                                  table.getColumn("status")?.setFilterValue(val === "all" ? undefined : [val === "true"]);
                                }}
                              >
                                <DropdownMenuRadioItem value="all">
                                  Semua
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="true">
                                  Aktif
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="false">
                                  Tidak aktif
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />
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
                                {[10, 20, 50, 100].map((pageSize) => (
                                  <DropdownMenuRadioItem key={pageSize} value={String(pageSize)}>
                                    {pageSize}
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
                        placeholder="Pencarian..."
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
                        {table.state.pagination.pageIndex * table.state.pagination.pageSize +
                          table.getRowModel().rows.length}
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
                                  {header.isPlaceholder
                                    ? null
                                    : <table.FlexRender header={header} />
                                  }
                                </div>
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
                            ) : header.isPlaceholder
                              ? null
                              : <table.FlexRender header={header} />
                            }
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
                            <TableCell key={cell.id}>
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
                            <p className="font-medium italic">Belum ada produk!</p>
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
                    <span className="font-bold">{table.getFilteredRowModel().rows.length}</span>{" "}
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
      </TabsContent>

      <TabsContent value="arsip" className="w-full">
        <DashboardSnapshots snapshots={snapshots} />
      </TabsContent>

      {
        // #region Create & Update Dialog
        <Dialog
          open={isDialogOpen}
          modal={isUploadingFile || upsertIsPending}
          onOpenChange={(open) => {
            if (!open && isUploadingFile) {
              toast.add({
                type: "error",
                description: "Harap tunggu, file sedang diunggah!",
                priority: "high"
              });
              return;
            }

            if (!open) {
              // Cek apakah ada file baru yang terlanjur di-upload namun batal disimpan
              if (uploadedFileUrl && uploadedFileUrl !== productToUpdate?.file_url) {
                // Jalankan proses hapus di background tanpa perlu await/memblokir UI
                deleteBlobFileAction(uploadedFileUrl);
              }

              // Reset semua state agar bersih untuk percobaan berikutnya
              setProductToUpdate(null);
              setImagePreview(null);
              setSelectedFile(null);
              setUploadedFileUrl(null);
              setUploadProgress(0);
            }

            setIsDialogOpen(open);
          }}
        >
          <DialogContent
            className="w-full sm:max-w-xl"
            showCloseButton={!isUploadingFile && !upsertIsPending}
          >
            <DialogHeader>
              <DialogTitle>{productToUpdate ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
              <DialogDescription>
                {productToUpdate
                  ? "Ubah detail informasi produk di bawah ini."
                  : "Isi form di bawah ini untuk menambahkan produk baru ke katalog."}
              </DialogDescription>
            </DialogHeader>
            <Separator className="py-0" />
            <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
              {/* Satu form untuk Create & Update */}
              <form
                id="productForm"
                action={upsertFormAction}
                autoComplete="off"
                key={productToUpdate ? productToUpdate.id : "new-product-form"}
              >
                {/* Hidden input untuk melempar ID jika mode edit */}
                {productToUpdate && <input type="hidden" name="id" value={productToUpdate.id} />}

                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="imageFile">Thumbnail Produk <span className="text-destructive">*</span></FieldLabel>
                    <div className="flex gap-4 items-start">
                      <div className={`relative group flex items-center justify-center w-20 h-20 shrink-0 overflow-hidden rounded-xl transition-all ${!imagePreview ? "border-2 border-dashed border-muted-foreground/100" : "border-2 border-muted-foreground"} rounded-xl`}>
                        {imagePreview ? (
                          <img id={`preview-${productToUpdate?.id || "new"}`} src={imagePreview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <Label htmlFor="imageFile" className="absolute flex flex-col gap-2 items-center justify-center text-foreground bg-background/50 backdrop-blur-xs inset-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <UploadIcon className="w-4 h-4" />
                          Ubah
                        </Label>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">

                          <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById("imageFile")?.click()}>
                            {imagePreview ? "Ganti Thumbnail" : "Upload Thumbnail"}
                          </Button>

                          <input type="hidden" name="oldImageUrl" value={productToUpdate?.image_url} required />
                          <input
                            disabled={upsertIsPending || isUploadingFile}
                            required={!productToUpdate}
                            id="imageFile"
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 4 * 1024 * 1024) {
                                  toast.add({
                                    type: "error",
                                    description: "Ukuran gambar tidak boleh melebihi 4 MB!",
                                    priority: "high",
                                  });
                                  e.target.value = "";
                                  return;
                                }

                                setImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />

                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rekomendasi rasio 1:1. <br />
                          Ukuran maksimal 4MB.
                        </p>
                      </div>
                    </div>
                  </Field>

                  <Field>
                    <Label htmlFor="title">Nama Produk <span className="text-destructive">*</span></Label>
                    <Input
                      required
                      id="title"
                      name="title"
                      placeholder="Nama produk"
                      defaultValue={productToUpdate?.title || ""}
                      minLength={3}
                      disabled={upsertIsPending || isUploadingFile}
                    />
                  </Field>

                  <FieldGroup className="grid md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="price">Harga <span className="text-destructive">*</span></FieldLabel>
                      <Input
                        required
                        id="price"
                        name="price"
                        inputMode="numeric"
                        placeholder="Harga Produk"
                        defaultValue={productToUpdate?.price || ""}
                        min={0}
                        disabled={upsertIsPending || isUploadingFile}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="isActive">Status Publikasi</FieldLabel>
                      <div className="flex items-center space-x-3 h-full">
                        <Switch
                          id="isActive"
                          name="isActive"
                          defaultChecked={productToUpdate ? productToUpdate.is_active : true}
                          disabled={upsertIsPending || isUploadingFile}
                        />
                        <Label htmlFor="isActive">Aktifkan di toko</Label>
                      </div>
                    </Field>
                  </FieldGroup>

                  <Field>
                    <FieldLabel htmlFor="category">Kategori <span className="text-destructive">*</span></FieldLabel>
                    <Select
                      required
                      items={categoryList}
                      name="category"
                      defaultValue={productToUpdate?.category_id || ""}
                      disabled={upsertIsPending || isUploadingFile}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Daftar Kategori</SelectLabel>
                          {categoryList?.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="shortDesc">Deskripsi Singkat <span className="text-destructive">*</span></FieldLabel>
                    <Textarea
                      required
                      id="shortDesc"
                      name="shortDesc"
                      placeholder="Tulis ringkasan singkat (maks. 150 karakter)..."
                      defaultValue={productToUpdate?.short_desc || ""}
                      minLength={10}
                      disabled={upsertIsPending || isUploadingFile}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="longDesc">Deskripsi Lengkap <span className="text-destructive">*</span></FieldLabel>
                    <Textarea
                      required
                      id="longDesc"
                      name="longDesc"
                      className="min-h-[120px]"
                      placeholder="Jelaskan detail produk selengkap-lengkapnya di sini..."
                      defaultValue={productToUpdate?.long_desc || ""}
                      minLength={10}
                      disabled={upsertIsPending || isUploadingFile}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="features">Fitur (JSONB) <span className="text-destructive">*</span></FieldLabel>
                    <Textarea
                      required
                      id="features"
                      name="features"
                      placeholder="Ketik setiap fitur di baris baru (Enter)..."
                      // Konversi array fitur dari DB menjadi string multi-baris
                      defaultValue={productToUpdate?.features ? productToUpdate.features.join("\n") : ""}
                      minLength={1}
                      disabled={upsertIsPending || isUploadingFile}
                    />
                    <FieldDescription className="text-xs">Pisahkan dengan Enter</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="fileUrl">File Produk Digital <span className="text-destructive">*</span></FieldLabel>

                    {(selectedFile || isUploadingFile) && (
                      <Attachment className="mt-3">
                        <AttachmentMedia>
                          {isUploadingFile ? (
                            <Spinner />
                          ) : (
                            <FileTextIcon />
                          )}
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{selectedFile?.name}</AttachmentTitle>
                          <AttachmentDescription>
                            {isUploadingFile ? (
                              <>
                                Mengunggah · {uploadProgress}%
                              </>
                            ) : (
                              <>
                                {selectedFile?.type} · {selectedFile?.size}
                              </>
                            )}
                          </AttachmentDescription>
                        </AttachmentContent>
                      </Attachment>
                    )}

                    <Label
                      htmlFor="fileUrl"
                      className={`flex justify-center space-x-4 rounded-md border border-input border-dashed px-6 py-10 transition-all duration-300 ${isUploadingFile ? 'opacity-50 pointer-events-none grayscale' : 'cursor-pointer hover:bg-muted-foreground/10'}`}
                    >
                      <div className="flex sm:flex-row flex-col items-center gap-3 sm:gap-4 text-center">
                        <UploadIcon
                          aria-hidden={true}
                          className="h-8 w-8 sm:h-6 sm:w-6 text-muted-foreground"
                        />
                        <div className="relative rounded-sm hover:underline hover:underline-offset-4">
                          <span>Klik di sini untuk unggah file</span>
                          <Input
                            required={!productToUpdate && !selectedFile && !uploadedFileUrl}
                            className="sr-only"
                            id="fileUrl"
                            type="file"
                            disabled={upsertIsPending || isUploadingFile}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              if (uploadedFileUrl && uploadedFileUrl !== productToUpdate?.file_url) {
                                deleteBlobFileAction(uploadedFileUrl); // Jalankan di background
                              }

                              const ext = file.name.split('.').pop()?.toUpperCase() || "FILE";
                              setSelectedFile({
                                name: file.name,
                                size: formatBytes(file.size),
                                type: ext,
                              });

                              setIsUploadingFile(true);
                              setUploadProgress(0);
                              toast.add({ description: "Memulai proses unggah..." });

                              try {
                                // PROSES CLIENT UPLOAD LANGSUNG KE VERCEL
                                const newBlob = await uploadPresigned(`products/${file.name}`, file, {
                                  access: "private",
                                  handleUploadUrl: "/api/upload",
                                  onUploadProgress: (progressEvent) => {
                                    const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                                    setUploadProgress(percentage);
                                  },
                                });

                                // Simpan URL yang didapat ke state
                                setUploadedFileUrl(newBlob.url);

                                toast.add({ type: "success", description: "File berhasil diunggah!" });
                              } catch (error) {
                                console.error(error);
                                toast.add({ type: "error", description: "Gagal mengunggah file. Coba lagi." });
                                setSelectedFile(null);
                                setUploadedFileUrl(null);
                              } finally {
                                setIsUploadingFile(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                        {/* <p className="text-pretty pl-1">untuk di-upload</p> */}
                      </div>
                    </Label>
                    {/* <p className="flex items-center justify-between text-pretty text-muted-foreground text-xs leading-5">
                      Recommended max. size: 10 MB, Accepted file types: XLSX, XLS, CSV.
                    </p> */}

                    <input type="hidden" name="oldFileUrl" value={productToUpdate?.file_url || ""} />
                    <input type="hidden" name="finalFileUrl" value={uploadedFileUrl || ""} />
                  </Field>
                </FieldGroup>
              </form>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose render={<Button variant="outline" />} disabled={upsertIsPending || isUploadingFile}>
                Batal
              </DialogClose>
              <Button form="productForm" type="submit" disabled={upsertIsPending || isUploadingFile}>
                {upsertIsPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Menyimpan...
                  </div>
                ) : productToUpdate ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambahkan Produk"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        // #endregion
      }
      {
        // #region Delete Alert
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus produk serta berkasnya secara permanen dan tidak dapat dipulihkan!<br />
                <span className="text-destructive">Disarankan pilih nonaktifkan produk saja.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" disabled={isPending} onClick={() => setProductToDelete(null)}>Batal</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={isPending} onClick={confirmDelete}>{isPending ? "Menghapus..." : "Hapus"}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        // #endregion
      }
    </Tabs>
  );
}