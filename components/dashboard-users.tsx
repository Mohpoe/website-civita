"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoteToUser, promoteToAdmin } from "@/lib/actions/users";
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
import {
  ChevronDownIcon, ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon,
  ChevronRightIcon, ChevronsUpDownIcon, ChevronUpIcon,
  GhostIcon, RefreshCcwIcon, Rows3Icon, SearchIcon,
  ShieldAlertIcon, ShieldCheckIcon, ShieldIcon, SlidersHorizontalIcon
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "./ui/toast";

// Definisikan tipe user (sesuaikan jika Anda sudah punya di types/global)
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl: string;
}

interface DashboardUsersProps {
  users: UserData[];
}

export default function DashboardUsers({ users }: DashboardUsersProps) {
  // 1. Inisialisasi Hook
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const uniqueRoles = useMemo(() => {
    // Gunakan Set untuk menyaring nilai yang duplikat, lalu ubah kembali menjadi array
    const roles = new Set(users.map((user) => user.role));
    return Array.from(roles);
  }, [users]);

  // 2. Fungsi Handler untuk menaikkan role
  const handlePromote = (userId: string, userName: string) => {
    // Tampilkan konfirmasi sederhana sebelum eksekusi (atau Anda bisa gunakan AlertDialog seperti saat hapus produk)
    if (confirm(`Apakah Anda yakin ingin menjadikan ${userName} sebagai Admin?`)) {
      startTransition(async () => {
        try {
          const res = await promoteToAdmin(userId);
          if (res.success) {
            toast.add({ type: "success", description: res.message });
            router.refresh(); // Segarkan halaman agar data baru termuat
          }
        } catch (error: any) {
          toast.add({ type: "error", description: error.message || "Gagal memperbarui role", priority: "high" });
        }
      });
    }
  };

  // 3. Fungsi Handler untuk menurunkan role
  const handleDemote = (userId: string, userName: string) => {
    if (confirm(`Apakah Anda yakin ingin MENCABUT hak akses admin dari ${userName}?`)) {
      startTransition(async () => {
        try {
          const res = await demoteToUser(userId);
          if (res.success) {
            toast.add({ type: "success", description: res.message });
            router.refresh();
          }
        } catch (error: any) {
          toast.add({ type: "error", description: error.message || "Gagal memperbarui role", priority: "high" });
        }
      });
    }
  };

  // #region Column
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

  const columnHelper = createColumnHelper<typeof features, UserData>();

  const columns = useMemo(() =>
    columnHelper.columns([
      // 1. Kolom #
      columnHelper.display({
        id: "nomor",
        header: () => <div className="text-center text-muted-foreground w-full">#</div>,
        cell: ({ row }) => <div className="text-center font-mono text-sm text-muted-foreground">{row.index + 1}</div>,
        enableHiding: false,
      }),

      // 2. Kolom Profil + Nama + Email (Digabung)
      columnHelper.accessor("name", {
        id: "informasi_pengguna",
        header: "Informasi Pengguna",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Image
                src={user.imageUrl || "/default-avatar.png"}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full object-cover border bg-muted shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          );
        },
      }),

      // 3. Kolom Role (Ditambah fungsi filter)
      columnHelper.accessor("role", {
        id: "role",
        header: "Hak Akses",
        cell: (info) => {
          const role = info.getValue();
          return (
            <Badge variant={role === "superadmin" ? "destructive" : role === "admin" ? "default" : "secondary"}>
              {role === "superadmin" && <ShieldAlertIcon data-icon="inline-start" className="w-3 h-3" />}
              {role === "admin" && <ShieldCheckIcon data-icon="inline-start" className="w-3 h-3" />}
              {role === "user" && <ShieldIcon data-icon="inline-start" className="w-3 h-3" />}
              {role.toUpperCase()}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          if (!value || value.length === 0) return true;
          return value.includes(row.getValue(id));
        },
      }),

      // 4. Kolom Aksi
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right w-full">Aksi</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex justify-end gap-2">
              {/* Jika perannya user, tampilkan tombol Jadikan Admin */}
              {user.role === "user" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromote(user.id, user.name)}
                  disabled={isPending}
                >
                  {isPending ? "Memproses..." : "Jadikan Admin"}
                </Button>
              )}

              {/* Jika perannya admin, tampilkan tombol Cabut Akses dengan warna merah (destructive) */}
              {user.role === "admin" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDemote(user.id, user.name)}
                  disabled={isPending}
                >
                  {isPending ? "Memproses..." : "Cabut Akses"}
                </Button>
              )}

              {/* Jika perannya superadmin, jangan tampilkan aksi apa-apa */}
              {user.role === "superadmin" && (
                <span className="text-xs text-muted-foreground italic">-</span>
              )}
            </div>
          );
        },
        enableHiding: false,
      }),
    ]),
    [columnHelper, isPending, handlePromote, handleDemote]
  );
  // #endregion

  // #region Table
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]); // <-- Tambahkan ini
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useTable({
    features,
    columns,
    data: users || [],
    globalFilterFn: "includesString",
    state: {
      sorting,
      pagination,
      globalFilter,
      columnVisibility,
      columnFilters
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    autoResetPageIndex: true,
  }, (state) => state);

  // Ambil nilai filter role saat ini untuk digunakan di menu dropdown UI
  // Defaultkan menjadi array kosong jika belum ada filter
  const filteredRoles = (table.getColumn("role")?.getFilterValue() as string[]) ?? [];
  // #endregion

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b">
        <CardTitle>Kelola Pengguna</CardTitle>
        <CardDescription>Daftar semua pengguna yang terdaftar di sistem melalui Clerk.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 py-6">
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
                <DropdownMenuContent className="min-w-50" align="start">
                  <DropdownMenuGroup>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ShieldIcon />
                        Hak Akses
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Filter Role</DropdownMenuLabel>

                            {/* Opsi "Semua Role" */}
                            <DropdownMenuCheckboxItem
                              checked={filteredRoles.length === uniqueRoles.length || filteredRoles.length === 0}
                              onCheckedChange={() => table.getColumn("role")?.setFilterValue(undefined)}
                            >
                              Semua Role
                            </DropdownMenuCheckboxItem>

                            {/* Looping Checkbox untuk setiap Role Unik */}
                            {uniqueRoles.map((role) => (
                              <DropdownMenuCheckboxItem
                                key={role}
                                checked={filteredRoles.includes(role)}
                                onCheckedChange={(checked) => {
                                  // Logika untuk menambah atau menghapus role dari array filter
                                  const newFilters = checked
                                    ? [...filteredRoles, role]
                                    : filteredRoles.filter((r) => r !== role);

                                  // Jika array kosong (tidak ada yang diceklis) ATAU semua role diceklis, hapus filter agar kembali ke default (Semua)
                                  table.getColumn("role")?.setFilterValue(
                                    newFilters.length === 0 || newFilters.length === uniqueRoles.length
                                      ? undefined
                                      : newFilters
                                  );
                                }}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

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
                            {[10, 20, 50].map((pageSize) => (
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
            // #region Datatable Search
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto border-t pt-4 lg:border-none lg:pt-0">
              <Field className="flex-1 lg:w-64">
                <InputGroup className="w-full min-h-8">
                  <InputGroupInput
                    className="text-sm!"
                    type="search"
                    placeholder="Cari nama atau email..."
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
                      (table.state.pagination.pageIndex + 1) * table.state.pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}
                  </span>
                  {" "}dari{" "}
                  <span className="font-bold text-foreground">{table.getFilteredRowModel().rows.length}</span>
                </div>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                    <ChevronFirstIcon className="size-4" />
                  </Button>
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <div className="flex h-8 items-center justify-center rounded-md border bg-muted/40 px-3 text-xs font-bold tabular-nums">
                    {table.state.pagination.pageIndex + 1} / {table.getPageCount() || 1}
                  </div>
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  <Button variant="outline" className="size-8 p-0" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                    <ChevronLastIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )
          // #endregion
        }

        {
          // #region Datatable Core
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                        {header.column.getCanSort() ? (
                          <Button variant="ghost" className="p-0 m-0 flex justify-between w-full h-full">
                            <div className="flex">
                              {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                            </div>
                            <div className="flex items-center ml-2">
                              {header.column.getCanSort() && (
                                <span className="opacity-40">
                                  {(() => {
                                    const sortState = header.column.getIsSorted();
                                    if (sortState === 'asc') return <ChevronUpIcon className="size-4" />;
                                    if (sortState === 'desc') return <ChevronDownIcon className="size-4" />;
                                    return <ChevronsUpDownIcon className="size-4" />;
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
                    <TableCell colSpan={columns.length} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-50 justify-center h-full">
                        <GhostIcon className="size-16" />
                        <p className="font-medium italic">Pengguna tidak ditemukan!</p>
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
        // #endregion LOWER PAGINATION
      }
    </Card>
  );
}