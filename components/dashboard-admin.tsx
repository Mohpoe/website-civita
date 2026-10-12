"use client";

import { upsertProductAction } from "@/lib/actions/product";
import { formatRupiah } from "@/lib/utils";
import { Category, Order, Product } from "@/types/global";
import { columnFilteringFeature, ColumnFiltersState, columnVisibilityFeature, ColumnVisibilityState, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_text, SortingState, tableFeatures, useTable } from "@tanstack/react-table";
import { BadgeCheckIcon, BadgeXIcon, ChevronDownIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon, Columns3Icon, EyeIcon, GhostIcon, ImageIcon, LinkIcon, MoreHorizontalIcon, PlusIcon, RefreshCcwIcon, Rows3Icon, SearchIcon, SlidersHorizontalIcon, SquarePenIcon, TagsIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/toast";

interface DashboardAdminProps {
  products: Product[],
  categories: Category[],
  orders: Order[],
}

export default function DashboardAdmin({ products, categories, orders }: DashboardAdminProps) {
  const [isPending, startTransition] = useTransition();

  // #region CREATE & UPDATE STATES (Tambah & Edit Produk)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState<Product | null>(null);
  const [upsertState, upsertFormAction, upsertIsPending] = useActionState(upsertProductAction, null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // 1. Trigger untuk Tambah Produk
  const handleCreate = () => {
    setProductToUpdate(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };
  // 2. Toast Handler
  useEffect(() => {
    if (!upsertState) return;
    if (upsertState.success) {
      toast.add({
        type: "success",
        description: upsertState.message,
      });
      setIsDialogOpen(false);
      setImagePreview(null);
      setProductToUpdate(null);
    } else {
      toast.add({
        type: "error",
        description: upsertState.message,
        priority: "high",
      });
    }
  }, [upsertState]);
  // #endregion CREATE & UPDATE STATES (Tambah & Edit Produk)

  // #region DELETE STATES (Hapus Produk)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;

    // startTransition(async () => {
    //   const res = await deleteProductAction(productToDelete);

    //   if (res.success) {
    //     mutate("/api/products");
    //     toast.add({
    //       type: "success",
    //       description: res.message,
    //     });
    //   } else {
    //     toast.add({
    //       type: "error",
    //       description: res.message,
    //     });
    //   }
    // });
  };
  // #endregion DELETE STATES (Hapus Produk)

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

  // #region COLUMN DEFINITION
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
        header: () => <div className="text-right">Harga</div>,
        cell: (info) => (
          <div className="text-right font-mono text-sm font-medium">
            {formatRupiah(info.getValue())}
          </div>
        ),
      }),

      // 6. Kolom Status
      columnHelper.accessor("is_active", {
        id: "status",
        header: "Status",
        cell: (info) => {
          return info.getValue() ? (
            <Badge variant="secondary">
              <BadgeCheckIcon data-icon="inline-start" className="text-emerald-500" /> Aktif
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
                    <DropdownMenuSeparator />

                    {/* Memanggil fungsi edit/hapus dari table.options.meta (Best Practice TanStack) */}
                    <DropdownMenuItem onClick={() => {
                      // handleEdit(product);
                      setProductToUpdate(product);
                      setImagePreview(product.image_url || null);
                      setIsDialogOpen(true);
                    }}>
                      <SquarePenIcon />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      disabled={isPending}
                    >
                      <Trash2Icon />
                      Hapus
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
    []
  );
  // #endregion COLUMN DEFINITION

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const handleResetFilters = () => {
    setGlobalFilter("");
    setSorting([]);
    setColumnFilters([]);
    setColumnVisibility({});
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
  };

  // #region TABLE DEFINITION
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

  const filteredKategori = (table.getColumn("kategori")?.getFilterValue() as string[]) ?? [];
  const filteredStatusValue = table.getColumn("status")?.getFilterValue() as boolean[] | undefined;
  const filteredStatus = filteredStatusValue !== undefined ? String(filteredStatusValue[0]) : "all";
  // #endregion TABLE DEFINITION

  // #region LIST DEFINITION
  const categoryList = useMemo(() => categories?.map((cat) => ({
    label: cat.name,
    value: cat.id
  })), [categories]);
  // #endregion

  return (
    <>
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
              // #region DATATABLE MENU
            }
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
            {
              // #endregion DATATABLE MENU

              // #region DATATABLE SEARCH
            }
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
            {
              // #endregion DATATABLE SEARCH
            }
          </div>

          {
            // #region UPPER PAGINATION
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
            // #endregion UPPER PAGINATION
          }
          {
            // #region DATATABLE
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                          {header.isPlaceholder
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
            // #endregion DATATABLE
          }
        </CardContent>
      </Card>

      {
        // #region CREATE & UPDATE DIALOG
      }
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setProductToUpdate(null);
            setImagePreview(null);
          }
        }}
      >
        <DialogContent className="w-full sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{productToUpdate ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
            <DialogDescription>
              {productToUpdate
                ? "Ubah detail informasi produk di bawah ini."
                : "Isi form di bawah ini untuk menambahkan produk baru ke katalog."}
              <span className="block text-xs text-destructive">Semua form wajib diisi!</span>
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
                  <FieldLabel>Thumbnail Produk</FieldLabel>
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
                          required={!productToUpdate}
                          id="imageFile"
                          name="imageFile"
                          type="file"
                          accept="image/*"
                          className="hidden"
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
                        Rekomendasi rasio 1:1, ukuran maksimal 2MB. <br />
                        Format .JPG atau .PNG.
                      </p>
                    </div>
                  </div>
                </Field>

                <Field>
                  <Label htmlFor="title">Nama Produk</Label>
                  <Input
                    required
                    id="title"
                    name="title"
                    placeholder="Nama produk"
                    defaultValue={productToUpdate?.title || ""}
                    minLength={3}
                  />
                </Field>

                <FieldGroup className="grid md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="price">Harga</FieldLabel>
                    <Input
                      required
                      id="price"
                      name="price"
                      inputMode="numeric"
                      placeholder="Harga Produk"
                      defaultValue={productToUpdate?.price || ""}
                      min={0}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="isActive">Status Publikasi</FieldLabel>
                    <div className="flex items-center space-x-3 h-full">
                      <Switch
                        required
                        id="isActive"
                        name="isActive"
                        defaultChecked={productToUpdate ? productToUpdate.is_active : true}
                      />
                      <Label htmlFor="isActive">Aktifkan di toko</Label>
                    </div>
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel htmlFor="category">Kategori</FieldLabel>
                  <Select
                    required
                    items={categoryList}
                    name="category"
                    defaultValue={productToUpdate?.category_id || ""}
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
                  <FieldLabel htmlFor="shortDesc">Deskripsi Singkat</FieldLabel>
                  <Textarea
                    required
                    id="shortDesc"
                    name="shortDesc"
                    placeholder="Tulis ringkasan singkat (maks. 150 karakter)..."
                    defaultValue={productToUpdate?.short_desc || ""}
                    minLength={10}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="longDesc">Deskripsi Lengkap</FieldLabel>
                  <Textarea
                    required
                    id="longDesc"
                    name="longDesc"
                    className="min-h-[120px]"
                    placeholder="Jelaskan detail produk selengkap-lengkapnya di sini..."
                    defaultValue={productToUpdate?.long_desc || ""}
                    minLength={10}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="features">Fitur (JSONB)</FieldLabel>
                  <Textarea
                    required
                    id="features"
                    name="features"
                    placeholder="Ketik setiap fitur di baris baru (Enter)..."
                    // Konversi array fitur dari DB menjadi string multi-baris
                    defaultValue={productToUpdate?.features ? productToUpdate.features.join("\n") : ""}
                    minLength={1}
                  />
                  <FieldDescription className="text-xs">Pisahkan dengan Enter</FieldDescription>
                </Field>

                <FieldGroup className="space-y-4 p-4 rounded-xl border border-dashed bg-muted/40">
                  {/* <Field>
                    <FieldLabel htmlFor="imageUrl">
                      <ImageIcon className="w-4 h-4 mr-2 inline-block text-muted-foreground" />
                      URL Thumbnail
                    </FieldLabel>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      placeholder="https://..."
                      defaultValue={productToUpdate?.image_url || ""}
                    />
                  </Field> */}

                  <Field>
                    <FieldLabel htmlFor="fileUrl">
                      <LinkIcon className="w-4 h-4 mr-2 inline-block text-muted-foreground" />
                      URL File Produk
                    </FieldLabel>
                    <Input
                      id="fileUrl"
                      name="fileUrl"
                      placeholder="https://drive.google.com/..."
                      defaultValue={productToUpdate?.file_url || ""}
                    />
                  </Field>
                </FieldGroup>

              </FieldGroup>
            </form>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose render={<Button variant="outline" />}>
              Batal
            </DialogClose>
            <Button form="productForm" type="submit" disabled={upsertIsPending}>
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
      {
        // #endregion CREATE & UPDATE DIALOG
      }


      {
        // #region DELETE ALERT DIALOG
      }
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus produk secara permanen dan tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" onClick={() => setProductToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={upsertIsPending} onClick={confirmDelete}>{upsertIsPending ? "Menghapus..." : "Hapus"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {
        // #endregion DELETE ALERT DIALOG
      }
    </>
  );
}