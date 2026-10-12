"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { upsertProductAction } from "@/lib/actions/product";
import { formatRupiah } from "@/lib/utils";
import { Category, Order, Product } from "@/types/global";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { BadgeCheckIcon, BadgeXIcon, ImageIcon, LinkIcon, MoreHorizontalIcon, PlusIcon, SquarePenIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

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

  // State untuk Pratinjau Gambar Thumbnail
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [upsertState, upsertFormAction, upsertIsPending] = useActionState(upsertProductAction, null);

  // 1. Trigger untuk Tambah Produk
  const handleCreate = () => {
    setProductToUpdate(null);
    setImagePreview(null); // Reset preview gambar
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
      setProductToUpdate(null);
      setImagePreview(null);
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
  const features = tableFeatures({});
  const columnHelper = createColumnHelper<typeof features, Product>();

  const columns = columnHelper.columns([
    columnHelper.display({
      id: "nomor",
      header: () => <div className="text-center w-8 text-muted-foreground w-full">#</div>,
      cell: ({ row }) => <div className="text-center font-mono text-sm text-muted-foreground">{row.index + 1}</div>
    }),

    columnHelper.accessor("id", {
      header: "ID Produk",
      cell: (info) => (
        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
          {info.getValue()}
        </span>
      )
    }),

    columnHelper.accessor("title", {
      header: "Informasi Produk",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border shrink-0 overflow-hidden">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
              )}
            </div>
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

    columnHelper.accessor("category.name", {
      header: "Kategori",
      cell: (info) => (
        <Badge variant="outline" className="font-medium bg-muted/50 border-border">
          {info.getValue() || "[Tanpa_kategori]"}
        </Badge>
      )
    }),

    columnHelper.accessor("price", {
      header: () => <div className="text-right">Harga</div>,
      cell: (info) => (
        <div className="text-right font-mono text-sm font-medium">
          {formatRupiah(info.getValue())}
        </div>
      ),
    }),

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

    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
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

                  <DropdownMenuItem onClick={() => {
                    setProductToUpdate(product);
                    setImagePreview(product.image_url || null); // Load thumbnail produk saat edit
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
            <Button variant="outline" onClick={handleCreate}>
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
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4">
            <form
              id="productForm"
              action={upsertFormAction}
              autoCapitalize="off"
              key={productToUpdate ? productToUpdate.id : "new-product-form"}
            >
              {productToUpdate && <input type="hidden" name="id" value={productToUpdate.id} />}

              <FieldGroup>

                {/* --- UI PENGATURAN THUMBNAIL BARU --- */}
                <Field className="mb-2">
                  <FieldLabel>Thumbnail Produk</FieldLabel>
                  <div className="flex items-center gap-5 mt-2">
                    {/* Area Kotak Preview */}
                    <div className="relative group w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                      {imagePreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreview} alt="Preview Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      )}

                      {/* Overlay Hover untuk Upload/Ubah */}
                      <label
                        htmlFor="thumbnailUpload"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm"
                      >
                        <UploadIcon className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium tracking-wide">Ubah</span>
                      </label>
                    </div>

                    {/* Kontrol Aksi (Ganti & Hapus) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById('thumbnailUpload')?.click()}
                        >
                          {imagePreview ? 'Ganti File' : 'Upload Foto'}
                        </Button>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="px-2.5"
                            onClick={() => {
                              setImagePreview(null);
                              // Reset nilai input file
                              const fileInput = document.getElementById('thumbnailUpload') as HTMLInputElement;
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                        Rekomendasi rasio 1:1, ukuran maksimal 2MB. Format .JPG atau .PNG.
                      </p>
                    </div>

                    {/* Input Element File asli disembunyikan */}
                    <input
                      type="file"
                      id="thumbnailUpload"
                      name="thumbnailFile" // Ini dikirim ke backend sebagai Form Data jika ada upload file fisik
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />

                    {/* Fallback ke String URL (jika form backend Anda sebelumnya hanya memproses string URL) */}
                    <input type="hidden" name="imageUrl" value={imagePreview || ""} />
                  </div>
                </Field>
                {/* --- END UI PENGATURAN THUMBNAIL BARU --- */}

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
                    defaultValue={productToUpdate?.features ? productToUpdate.features.join("\n") : ""}
                  />
                  <FieldDescription className="text-xs">Pisahkan dengan Enter</FieldDescription>
                </Field>

                <FieldGroup className="space-y-4 p-4 rounded-xl border border-dashed bg-muted/40">
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