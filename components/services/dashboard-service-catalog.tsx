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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  deleteServiceAction,
  toggleServiceAction,
  upsertServiceAction,
} from "@/lib/actions/services";
import { formatRupiah } from "@/lib/utils";
import type { Service } from "@/types/global";
import {
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

interface DashboardServiceCatalogProps {
  services: Service[];
}

export function DashboardServiceCatalog({ services }: DashboardServiceCatalogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("50000");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [languages, setLanguages] = useState<string[]>(["id", "en"]);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice("50000");
    setSortOrder(String(services.length * 10 + 10));
    setIsActive(true);
    setLanguages(["id", "en"]);
    setIsDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setName(service.name);
    setSlug(service.slug);
    setDescription(service.description);
    setPrice(String(service.price));
    setSortOrder(String(service.sort_order));
    setIsActive(service.is_active);
    setLanguages(service.languages);
    setIsDialogOpen(true);
  };

  const toggleLanguage = (code: string) => {
    setLanguages((previous) =>
      previous.includes(code)
        ? previous.filter((item) => item !== code)
        : [...previous, code],
    );
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await upsertServiceAction(null, formData);

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

  const toggleActive = (service: Service) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", service.id);
      formData.append("isActive", String(!service.is_active));
      const result = await toggleServiceAction(formData);

      if (result.success) {
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
      const result = await deleteServiceAction(formData);

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2Icon className="size-5" /> Katalog Layanan
              </CardTitle>
              <CardDescription>
                {services.filter((service) => service.is_active).length} layanan aktif dari{" "}
                {services.length} total. Harga di sini yang dipakai saat klien membayar.
              </CardDescription>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <PlusIcon className="size-4" /> Tambah Layanan
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
              <Settings2Icon className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Belum ada layanan.</p>
                <p className="text-sm text-muted-foreground">
                  Tambahkan layanan pertama agar bisa dipesan dari landing page.
                </p>
              </div>
              <Button onClick={openCreate} variant="outline">
                <PlusIcon className="size-4" /> Tambah layanan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div key={service.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{service.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{service.slug}</p>
                    </div>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {service.description || "Tanpa deskripsi."}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{formatRupiah(service.price)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {service.languages.map((code) => code.toUpperCase()).join(" · ")}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
                    <Switch
                      checked={service.is_active}
                      disabled={isPending}
                      onCheckedChange={() => toggleActive(service)}
                      aria-label={service.is_active ? "Sembunyikan layanan" : "Tampilkan layanan"}
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(service)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setDeleteTarget(service);
                          setIsAlertOpen(true);
                        }}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
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
            <DialogTitle>{editing ? "Ubah Layanan" : "Tambah Layanan"}</DialogTitle>
            <DialogDescription>
              Harga dipakai apa adanya saat klien membayar lewat Midtrans.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitForm} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <input type="hidden" name="isActive" value={String(isActive)} />
            {languages.map((code) => (
              <input key={code} type="hidden" name="languages" value={code} />
            ))}

            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="serviceName">Nama layanan</FieldLabel>
                  <Input
                    id="serviceName"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={120}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="serviceSlug">Slug</FieldLabel>
                  <Input
                    id="serviceSlug"
                    name="slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="otomatis dari nama"
                    maxLength={80}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="serviceDescription">Deskripsi</FieldLabel>
                <Textarea
                  id="serviceDescription"
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  maxLength={600}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="servicePrice">Harga (Rp)</FieldLabel>
                  <Input
                    id="servicePrice"
                    name="price"
                    inputMode="numeric"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                  />
                  <FieldDescription>Minimal Rp1.000.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="serviceOrder">Urutan tampil</FieldLabel>
                  <Input
                    id="serviceOrder"
                    name="sortOrder"
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Bahasa tersedia</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: "id", label: "Bahasa Indonesia" },
                    { code: "en", label: "English" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => toggleLanguage(item.code)}
                      className={
                        languages.includes(item.code)
                          ? "inline-flex h-9 items-center rounded-md border border-foreground bg-foreground px-3 text-sm font-medium text-background"
                          : "inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel htmlFor="serviceActive">Tampilkan di landing page</FieldLabel>
                <Switch
                  id="serviceActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked)}
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />} disabled={isPending}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={isPending || languages.length === 0}>
                {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                {editing ? "Simpan Perubahan" : "Tambah Layanan"}
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
            <AlertDialogTitle>Hapus layanan?</AlertDialogTitle>
            <AlertDialogDescription>
              Layanan hilang dari landing page. Riwayat pesanan lama tetap tersimpan dengan nama
              layanan saat itu.
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
