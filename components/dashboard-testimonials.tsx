"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
  toggleTestimonialAction,
  updateTestimonialAction,
} from "@/lib/actions/testimonials";
import type { Testimonial } from "@/lib/site-config";
import { sanitizeFileName } from "@/lib/utils";
import { uploadPresigned } from "@vercel/blob/client";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ImagePlusIcon,
  Loader2Icon,
  MessageSquareQuoteIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";

interface DashboardTestimonialsProps {
  testimonials: Testimonial[];
}

export default function DashboardTestimonials({ testimonials }: DashboardTestimonialsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const openCreate = () => {
    setEditing(null);
    setImageUrl("");
    setAltText("");
    setSortOrder(String(testimonials.length));
    setIsDialogOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setImageUrl(testimonial.image_url);
    setAltText(testimonial.alt_text ?? "");
    setSortOrder(String(testimonial.sort_order));
    setIsDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.add({ type: "error", description: "File harus berupa gambar." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ type: "error", description: "Ukuran gambar maksimal 5 MB." });
      return;
    }

    setIsUploading(true);
    try {
      const blob = await uploadPresigned(`testimonials/${sanitizeFileName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload/public",
      });
      setImageUrl(blob.url);
      toast.add({ type: "success", description: "Gambar berhasil diunggah." });
    } catch (error) {
      console.error(error);
      toast.add({ type: "error", description: "Gagal mengunggah gambar. Coba lagi." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = editing
        ? await updateTestimonialAction(null, formData)
        : await createTestimonialAction(null, formData);

      if (result.success) {
        setIsDialogOpen(false);
        setEditing(null);
        toast.add({ type: "success", description: result.message });
        router.refresh();
      } else {
        toast.add({ type: "error", description: result.message, priority: "high" });
      }
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", deleteTarget.id);
      const result = await deleteTestimonialAction(formData);

      if (result.success) {
        setIsAlertOpen(false);
        setDeleteTarget(null);
        toast.add({ type: "success", description: result.message });
        router.refresh();
      } else {
        toast.add({ type: "error", description: result.message, priority: "high" });
      }
    });
  };

  const toggleActive = (testimonial: Testimonial) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", testimonial.id);
      formData.append("isActive", String(!testimonial.is_active));
      const result = await toggleTestimonialAction(formData);

      if (result.success) {
        toast.add({ type: "success", description: result.message });
        router.refresh();
      } else {
        toast.add({ type: "error", description: result.message, priority: "high" });
      }
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= testimonials.length) return;

    const next = [...testimonials];
    [next[index], next[target]] = [next[target], next[index]];

    startTransition(async () => {
      const result = await reorderTestimonialsAction(next.map((item) => item.id));
      if (result.success) {
        toast.add({ type: "success", description: result.message });
        router.refresh();
      } else {
        toast.add({ type: "error", description: result.message, priority: "high" });
      }
    });
  };

  const activeCount = testimonials.filter((item) => item.is_active).length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareQuoteIcon className="size-5" /> Kelola Testimoni
              </CardTitle>
              <CardDescription>
                {activeCount} testimoni aktif dari {testimonials.length} total. Halaman utama menampilkan
                maksimal 9 kartu yang dipilih acak.
              </CardDescription>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <PlusIcon className="size-4" /> Tambah Testimoni
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
              <MessageSquareQuoteIcon className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Belum ada testimoni.</p>
                <p className="text-sm text-muted-foreground">
                  Unggah tangkapan layar chat WhatsApp klien untuk mulai mengisi bagian testimoni.
                </p>
              </div>
              <Button onClick={openCreate} variant="outline">
                <PlusIcon className="size-4" /> Tambah yang pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="flex flex-col overflow-hidden rounded-lg border bg-card"
                >
                  <div className="relative aspect-[4/5] w-full bg-muted">
                    <Image
                      src={testimonial.image_url}
                      alt={testimonial.alt_text || "Tangkapan layar testimoni"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover object-top"
                    />
                    <Badge
                      variant={testimonial.is_active ? "default" : "secondary"}
                      className="absolute top-2 left-2"
                    >
                      {testimonial.is_active ? "Tampil" : "Disembunyikan"}
                    </Badge>
                    <Badge variant="outline" className="absolute top-2 right-2 bg-background/90">
                      #{index + 1}
                    </Badge>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {testimonial.alt_text || "Tanpa keterangan"}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          disabled={isPending || index === 0}
                          onClick={() => move(index, -1)}
                          title="Naikkan urutan"
                        >
                          <ArrowUpIcon className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          disabled={isPending || index === testimonials.length - 1}
                          onClick={() => move(index, 1)}
                          title="Turunkan urutan"
                        >
                          <ArrowDownIcon className="size-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={testimonial.is_active}
                          disabled={isPending}
                          onCheckedChange={() => toggleActive(testimonial)}
                          aria-label={testimonial.is_active ? "Sembunyikan testimoni" : "Tampilkan testimoni"}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(testimonial)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            setDeleteTarget(testimonial);
                            setIsAlertOpen(true);
                          }}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Testimoni" : "Tambah Testimoni"}</DialogTitle>
            <DialogDescription>
              Gunakan tangkapan layar chat WhatsApp asli. Gambar akan tampil sebagai kartu di
              halaman utama.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitForm} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <input type="hidden" name="imageUrl" value={imageUrl} />

            <FieldGroup>
              <Field>
                <FieldLabel>Gambar testimoni</FieldLabel>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Pratinjau testimoni"
                      width={400}
                      height={500}
                      className="max-h-64 w-auto object-contain"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-2 px-6 py-12 text-sm text-muted-foreground">
                      {isUploading ? (
                        <Loader2Icon className="size-8 animate-spin" />
                      ) : (
                        <ImagePlusIcon className="size-8" />
                      )}
                      {isUploading ? "Mengunggah..." : "Klik untuk memilih gambar"}
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUpload(file);
                  }}
                />
                <FieldDescription>PNG/JPG/WebP, maksimal 5 MB.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="altText">Keterangan singkat</FieldLabel>
                <Input
                  id="altText"
                  name="altText"
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  placeholder="Mis. testimoni CV ATS"
                  maxLength={200}
                />
                <FieldDescription>Tidak tampil di kartu, hanya dibacakan pembaca layar.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="sortOrder">Urutan</FieldLabel>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                />
                <FieldDescription>Angka kecil tampil lebih dulu di dashboard.</FieldDescription>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />} disabled={isPending}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={isPending || isUploading || !imageUrl}>
                {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                {editing ? "Simpan Perubahan" : "Tambah Testimoni"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Hapus testimoni?</AlertDialogTitle>
            <AlertDialogDescription>
              Gambar juga akan dihapus dari penyimpanan. Tindakan ini tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={confirmDelete}>
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
