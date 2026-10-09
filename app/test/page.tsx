"use client";

import {
  Image as ImageIcon,
  Link as LinkIcon,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useState } from "react";

// Komponen bawaan Shadcn UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---
// Sesuai dengan schema database Neon Postgres Anda
type Product = {
  id: string;
  title: string;
  short_desc: string;
  long_desc: string;
  price: number;
  category: string;
  features: string[]; // Direpresentasikan sebagai array dari JSONB
  image_url: string;
  is_active: boolean;
  created_at: string;
  file_url: string;
};

// Data Dummy untuk preview UI
const dummyProducts: Product[] = [
  {
    id: "prod-1",
    title: "Template CV ATS Friendly Premium",
    short_desc: "Template CV untuk perusahaan multinasional",
    long_desc: "Template CV berstandar ATS yang dirancang khusus untuk mempermudah lolos screening mesin HRD...",
    price: 49000,
    category: "Template CV",
    features: ["Format DOCX & PDF", "Panduan Pengisian", "Font Premium"],
    image_url: "https://example.com/cv.png",
    is_active: true,
    created_at: new Date().toISOString(),
    file_url: "https://example.com/download/cv.zip"
  },
  {
    id: "prod-2",
    title: "Bundle Surat Lamaran Kerja 2026",
    short_desc: "10+ Template Surat Lamaran berbagai industri",
    long_desc: "Kumpulan template surat lamaran bahasa Indonesia dan Inggris...",
    price: 25000,
    category: "Surat Lamaran",
    features: ["Bahasa Indonesia", "Bahasa Inggris", "Cover Letter"],
    image_url: "https://example.com/slk.png",
    is_active: false,
    created_at: new Date().toISOString(),
    file_url: "https://example.com/download/slk.zip"
  }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter pencarian
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler buka modal tambah/edit
  const handleOpenDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 w-full">

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kelola Produk</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Tambah, edit, dan kelola produk digital yang dijual di website Anda.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Button>
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kategori produk..."
            className="pl-9 w-full bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data Produk */}
      <div className="border rounded-xl bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{product.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {product.short_desc}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium bg-muted">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    Rp {product.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    {product.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                            <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <PackageOpen className="h-10 w-10 mb-2 opacity-20" />
                    <p>Tidak ada produk ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Form Tambah/Edit Produk */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/40">
            <DialogTitle className="text-xl">
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi informasi produk digital secara lengkap sesuai dengan field database.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Kolom Kiri */}
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Produk <span className="text-red-500">*</span></Label>
                  <Input id="title" defaultValue={editingProduct?.title} placeholder="Contoh: Template CV ATS Friendly" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga (Rp) <span className="text-red-500">*</span></Label>
                  <Input id="price" type="number" defaultValue={editingProduct?.price} placeholder="49000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select defaultValue={editingProduct?.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Template CV">Template CV</SelectItem>
                      <SelectItem value="Surat Lamaran">Surat Lamaran</SelectItem>
                      <SelectItem value="Portfolio">Portfolio</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status Publikasi</Label>
                  <div className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                    <Switch id="status" defaultChecked={editingProduct ? editingProduct.is_active : true} />
                    <Label htmlFor="status" className="font-normal cursor-pointer">
                      Produk Aktif (Tampil di toko)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="short_desc">Deskripsi Singkat</Label>
                  <Textarea
                    id="short_desc"
                    defaultValue={editingProduct?.short_desc}
                    placeholder="Tulis ringkasan singkat untuk tampilan card (Max 150 karakter)..."
                    className="resize-none h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long_desc">Deskripsi Lengkap</Label>
                  <Textarea
                    id="long_desc"
                    defaultValue={editingProduct?.long_desc}
                    placeholder="Jelaskan detail produk selengkap-lengkapnya di sini..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Fitur (JSONB)</Label>
                  <Textarea
                    id="features"
                    defaultValue={editingProduct?.features?.join("\n")}
                    placeholder="Ketik setiap fitur di baris baru (Enter)...&#10;Format PDF&#10;Mudah diedit&#10;Sesuai ATS"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">Pisahkan setiap fitur dengan baris baru (Enter). Sistem akan memformatnya menjadi array JSONB.</p>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2 p-4 rounded-xl border border-dashed bg-muted/10">
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" /> URL Gambar Thumbnail
                  </Label>
                  <Input id="image_url" defaultValue={editingProduct?.image_url} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file_url" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" /> URL File Master Digital (ZIP/PDF)
                  </Label>
                  <Input id="file_url" defaultValue={editingProduct?.file_url} placeholder="https://drive.google.com/..." />
                  <p className="text-xs text-muted-foreground mt-1">Link ini akan diberikan ke user setelah pembayaran berhasil.</p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button type="submit">
              {editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// "use client"

// export default function Page() {
//   const handleDownload = async () => {
//     const blobUrl = "https://y8qmrwks1jfedfqn.private.blob.vercel-storage.com";

//     // 1. Panggil API handler Anda
//     const response = await fetch(`/api/test?pathname=${encodeURIComponent(blobUrl)}`);

//     if (!response.ok) {
//       alert("Gagal mengunduh file atau Anda tidak memiliki akses.");
//       return;
//     }

//     // 2. Ubah response menjadi objek blob di sisi browser
//     const blobData = await response.blob();

//     // 3. Buat link unduhan sementara
//     const downloadUrl = window.URL.createObjectURL(blobData);
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = "laporan-terdownload.pdf"; // Nama file saat diunduh
//     document.body.appendChild(link);
//     link.click();

//     // Cleanup
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(downloadUrl);
//   };

//   return (
//     <>
//       <button onClick={handleDownload} className="btn-primary">
//         Download PDF Privat
//       </button>
//     </>
//   );
// }

// import { sql } from '@/lib/utils';

// export default function Page() {
//   async function create(formData: FormData) {
//     'use server';
//     // Connect to the Neon database
//     const comment = formData.get('comment');
//     // Insert the comment from the form into the Postgres database
//     await sql.query('INSERT INTO comments (comment) VALUES ($1)', [comment]);
//   }

//   return (
//     <form action={create}>
//       <input type="text" placeholder="write a comment" name="comment" />
//       <button type="submit">Submit</button>
//     </form>
//   );
// }