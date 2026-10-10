"use client";

import { upsertProductAction } from "@/lib/actions/product";
import { APP_CONFIG } from "@/lib/constants";
import { fetcher, formatRupiah } from "@/lib/utils";
import { Category, Order, Product } from "@/types/global";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { BadgeCheckIcon, BadgeXIcon, ImageIcon, LinkIcon, MoreHorizontalIcon, PlusIcon, SquarePenIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import useSWR, { useSWRConfig } from "swr";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
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
  // 1. Trigger untuk Tambah Produk
  const handleCreate = () => {
    setProductToUpdate(null);
    setIsDialogOpen(true);
  };
  // 2. Trigger untuk Edit Produk
  const handleEdit = (product: Product) => {
    setProductToUpdate(product);
    setIsDialogOpen(true);
  };
  // 3. Toast Handler
  useEffect(() => {
    if (!upsertState) return;
    if (upsertState.success) {
      toast.add({
        type: "success",
        description: upsertState.message,
      });
      setIsDialogOpen(false);
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

  // #region TABLE DEFINITION
  // 1. Table Initiation
  const features = tableFeatures({});
  const columnHelper = createColumnHelper<typeof features, Product>();

  // 2. Column Definition
  const columns = columnHelper.columns([
    // 1. Kolom Nomor Urut
    columnHelper.display({
      id: "nomor",
      header: () => <div className="text-center w-8 text-muted-foreground w-full">#</div>,
      cell: ({ row }) => <div className="text-center font-mono text-sm text-muted-foreground">{row.index + 1}</div>
    }),

    // 2. Kolom ID Produk (Opsional, disembunyikan jika memakan tempat)
    columnHelper.accessor("id", {
      header: "ID Produk",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {info.getValue()}
        </span>
      )
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
    columnHelper.accessor("category.name", {
      header: "Kategori",
      cell: (info) => (
        <Badge variant="outline" className="font-medium bg-muted/50 border-border">
          {info.getValue() || "[Tanpa_kategori]"}
        </Badge>
      )
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
      }
    }),
  ]);

  // 3. Table Definition
  const table = useTable({
    features,
    columns,
    data: products || [],
  });
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
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="*:border-border [&>:not(:last-child)]:border-r">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="*:border-border [&>:not(:last-child)]:border-r">
                    {row.getAllCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE & UPDATE DIALOG */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setProductToUpdate(null);
        }}
      >
        <DialogContent className="w-full sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{productToUpdate ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
            <DialogDescription>
              {productToUpdate
                ? "Ubah detail informasi produk di bawah ini."
                : "Isi form di bawah ini untuk menambahkan produk baru ke katalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
            {/* Satu form untuk Create & Update */}
            <form
              id="productForm"
              action={upsertFormAction}
              autoCapitalize="off"
              key={productToUpdate ? productToUpdate.id : "new-product-form"}
            >
              {/* Hidden input untuk melempar ID jika mode edit */}
              {productToUpdate && <input type="hidden" name="id" value={productToUpdate.id} />}

              <FieldGroup>
                <Field>
                  <Label htmlFor="title">Nama Produk</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Nama produk"
                    defaultValue={productToUpdate?.title || ""}
                  />
                </Field>

                <FieldGroup className="grid md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="price">Harga</FieldLabel>
                    <Input
                      id="price"
                      name="price"
                      inputMode="numeric"
                      placeholder="Harga Produk"
                      defaultValue={productToUpdate?.price || ""}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="isActive">Status Publikasi</FieldLabel>
                    <div className="flex items-center space-x-3 h-full">
                      <Switch
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
                    id="shortDesc"
                    name="shortDesc"
                    placeholder="Tulis ringkasan singkat (maks. 150 karakter)..."
                    defaultValue={productToUpdate?.short_desc || ""}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="longDesc">Deskripsi Lengkap</FieldLabel>
                  <Textarea
                    id="longDesc"
                    name="longDesc"
                    className="min-h-[120px]"
                    placeholder="Jelaskan detail produk selengkap-lengkapnya di sini..."
                    defaultValue={productToUpdate?.long_desc || ""}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="features">Fitur (JSONB)</FieldLabel>
                  <Textarea
                    id="features"
                    name="features"
                    placeholder="Ketik setiap fitur di baris baru (Enter)..."
                    // Konversi array fitur dari DB menjadi string multi-baris
                    defaultValue={productToUpdate?.features ? productToUpdate.features.join("\n") : ""}
                  />
                  <FieldDescription className="text-xs">Pisahkan dengan Enter</FieldDescription>
                </Field>

                <FieldGroup className="space-y-4 p-4 rounded-xl border border-dashed bg-muted/40">
                  <Field>
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
                  </Field>

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

      {/* DELETE ALERT DIALOG */}
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
    </>
  );
}