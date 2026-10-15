"use client";

import { deleteCategoryAction, upsertCategoryAction } from "@/lib/actions/category"; // Sesuaikan path ini
import { Category } from "@/types/global";
import {
  columnFilteringFeature,
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
import {
  ChevronDownIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon,
  ChevronRightIcon, ChevronsUpDownIcon, ChevronUpIcon,
  GhostIcon, MoreHorizontalIcon, PlusIcon, RefreshCcwIcon, Rows3Icon,
  SearchIcon, SlidersHorizontalIcon, SquarePenIcon, Trash2Icon
} from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Separator } from "./ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/toast";

interface DashboardCategoryProps {
  categories: Category[],
}

export default function DashboardCategory({ categories }: DashboardCategoryProps) {
  const [isPending, startTransition] = useTransition();

  // #region CREATE/UPDATE STATES
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToUpdate, setCategoryToUpdate] = useState<Category | null>(null);
  const [upsertState, upsertFormAction, upsertIsPending] = useActionState(upsertCategoryAction, null);
  const [formSession, setFormSession] = useState<string>("");

  const handleCreate = () => {
    setCategoryToUpdate(null);
    setFormSession(Date.now().toString());
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (!upsertState) return;
    if (upsertState.success) {
      setIsDialogOpen(false);
      setCategoryToUpdate(null);
      toast.add({ type: "success", description: upsertState.message });
    } else {
      toast.add({ type: "error", description: upsertState.message, priority: "high" });
    }
  }, [upsertState]);
  // #endregion

  // #region DELETE STATES
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", categoryToDelete);
      const res = await deleteCategoryAction(formData);

      if (res.success) {
        setIsAlertOpen(false);
        setCategoryToDelete(null);
        toast.add({ type: "success", description: res.message });
      } else {
        toast.add({ type: "error", description: res.message, priority: "high" });
      }
    });
  };
  // #endregion

  // #region COLUMN
  const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    columnVisibilityFeature,
    globalFilteringFeature,
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
    filterFns: { includesString: filterFn_includesString }
  });

  const columnHelper = createColumnHelper<typeof features, Category>();

  const columns = useMemo(() =>
    columnHelper.columns([
      columnHelper.display({
        id: "nomor",
        header: () => <div className="text-center text-muted-foreground w-full">#</div>,
        cell: ({ row }) => <div className="text-center font-mono text-sm text-muted-foreground">{row.index + 1}</div>,
        enableHiding: false,
      }),
      columnHelper.accessor("id", {
        header: "ID Kategori",
        cell: (info) => <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{info.getValue()}</span>,
        enableHiding: false,
      }),
      columnHelper.accessor("name", {
        id: "nama_kategori",
        header: "Nama Kategori",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("slug", {
        header: "Slug",
        cell: (info) => (
          <span className="font-mono text-xs text-muted-foreground/80">
            /{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("description", {
        id: "deskripsi",
        header: "Deskripsi",
        cell: (info) => <div className="text-xs max-w-lg text-wrap">{info.getValue()}</div>,
      }),
      columnHelper.accessor("product_count", {
        id: "total_produk",
        header: () => <div className="text-center w-full">Total Produk</div>,
        cell: (info) => {
          const count = info.getValue() || 0;
          return (
            <div>
              {count} <span className="text-muted-foreground">produk</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                  <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg">
                  <DropdownMenuItem onClick={() => {
                    setCategoryToUpdate(cat);
                    setFormSession(Date.now().toString());
                    setIsDialogOpen(true);
                  }}>
                    <SquarePenIcon /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => {
                    setCategoryToDelete(cat.id);
                    setIsAlertOpen(true);
                  }} disabled={isPending}>
                    <Trash2Icon /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ]),
    [columnHelper, isPending]
  );

  // #region TABLE
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useTable({
    features,
    columns,
    data: categories || [],
    globalFilterFn: "includesString",
    state: {
      sorting,
      pagination,
      globalFilter,
      columnVisibility
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: true,
  }, (state) => state);
  // #endregion

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="border-b">
          <CardTitle>Kelola Kategori</CardTitle>
          <CardDescription>Atur daftar kategori untuk produk digital Anda.</CardDescription>
          <CardAction>
            <Button variant="outline" onClick={handleCreate}>
              <PlusIcon /> <span className="hidden md:block">Tambah Kategori</span>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
            {
              // #region DATATABLE MENU
              <div className="flex flex-row items-center gap-2 w-full lg:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="min-h-8 text-sm w-full" />}>
                    <SlidersHorizontalIcon />
                    Atur Tabel
                    <ChevronDownIcon className="size-4 ml-2 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-50" align="start">
                    <DropdownMenuGroup>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Rows3Icon />
                          Atur Baris
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

                      <DropdownMenuItem onClick={() => { setGlobalFilter(""); setSorting([]); setPagination({ pageIndex: 0, pageSize: 10 }); }}>
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
              // #region DATATABLE SEARCH
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
            // #endregion
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
                          <p className="font-medium italic">Belum ada kategori!</p>
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
          // #region LOWER PAGINATION
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
          // #endregion LOWER PAGINATION
        }
      </Card>

      {
        // #region CREATE & UPDATE DIALOG
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{categoryToUpdate ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
              <DialogDescription>
                Masukkan nama kategori untuk mengelompokkan produk Anda.
              </DialogDescription>
            </DialogHeader>
            <form id="categoryForm" action={upsertFormAction} key={formSession} autoComplete="off">
              {categoryToUpdate && <input type="hidden" name="id" value={categoryToUpdate.id} />}
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="name">Nama Kategori <span className="text-destructive">*</span></FieldLabel>
                  <Input
                    required
                    id="name"
                    name="name"
                    placeholder="Misal: Template Website, E-Book..."
                    defaultValue={categoryToUpdate?.name || ""}
                    minLength={2}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Deskripsi <span className="text-destructive">*</span></FieldLabel>
                  <Textarea
                    required
                    id="description"
                    name="description"
                    placeholder="Deskripsi singkat mengenai kategori ini..."
                    defaultValue={categoryToUpdate?.description || ""}
                    className="min-h-[100px]"
                  />
                </Field>
              </FieldGroup>
            </form>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
              <Button form="categoryForm" type="submit" disabled={upsertIsPending}>
                {upsertIsPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        // #endregion
      }
      {
        // #region DELETE ALERT DIALOG
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive"><Trash2Icon /></AlertDialogMedia>
              <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dipulihkan. Pastikan tidak ada produk yang sedang menggunakan kategori ini!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" disabled={isPending} onClick={() => setCategoryToDelete(null)}>Batal</AlertDialogCancel>
              <AlertDialogAction variant="destructive" disabled={isPending} onClick={confirmDelete}>
                {isPending ? "Menghapus..." : "Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        // #endregion
      }
    </>
  );
}