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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  deleteServiceAction,
  reorderServicesAction,
  toggleServiceAction,
  upsertServiceAction,
} from "@/lib/actions/services";
import { cn, formatRupiah } from "@/lib/utils";
import type { Service } from "@/types/global";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUpDownIcon,
  CheckIcon,
  GripVerticalIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { Separator } from "../ui/separator";

interface DashboardServiceCatalogProps {
  services: Service[];
}

const LANGUAGE_OPTIONS = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
] as const;

type StatusFilter = "all" | "active" | "inactive";

function toPriceNumber(value: string | undefined): number {
  const digits = (value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/** Baris layanan yang bisa diseret saat mode "Atur Urutan". */
function SortableServiceRow({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        isDragging && "relative z-10 opacity-90 shadow-md",
      )}
    >
      <button
        type="button"
        className="touch-none rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Geser ${service.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>

      <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-muted-foreground">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{service.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {service.slug} · {formatRupiah(service.price)}
        </p>
      </div>

      <Badge variant={service.is_active ? "default" : "secondary"}>
        {service.is_active ? "Aktif" : "Nonaktif"}
      </Badge>
    </div>
  );
}

export function DashboardServiceCatalog({ services }: DashboardServiceCatalogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [languages, setLanguages] = useState<string[]>(["id", "en"]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const [isReordering, setIsReordering] = useState(false);
  const [orderedServices, setOrderedServices] = useState<Service[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredServices = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return services.filter((service) => {
      if (statusFilter === "active" && !service.is_active) return false;
      if (statusFilter === "inactive" && service.is_active) return false;
      if (!needle) return true;

      return (
        service.name.toLowerCase().includes(needle) ||
        service.slug.toLowerCase().includes(needle) ||
        service.description.toLowerCase().includes(needle)
      );
    });
  }, [services, query, statusFilter]);

  const activeCount = services.filter((service) => service.is_active).length;

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrices({ id: "50000", en: "50000" });
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
    setPrices(
      Object.fromEntries(
        service.languages.map((code) => [
          code,
          String(service.prices[code] ?? service.price),
        ]),
      ),
    );
    setSortOrder(String(service.sort_order));
    setIsActive(service.is_active);
    setLanguages(service.languages);
    setIsDialogOpen(true);
  };

  const toggleLanguage = (code: string) => {
    if (languages.includes(code)) {
      setLanguages((previous) => previous.filter((item) => item !== code));
      return;
    }

    // Saat bahasa baru diaktifkan, isi harga dengan harga bahasa lain agar
    // admin hanya perlu menyesuaikan, bukan mengisi dari nol.
    const fallback = prices.id || prices.en || "50000";
    setPrices((current) => (current[code] ? current : { ...current, [code]: fallback }));
    setLanguages((previous) => [...previous, code]);
  };

  const pricesValid =
    languages.length > 0 && languages.every((code) => toPriceNumber(prices[code]) >= 1000);

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pricesValid) {
      toast.add({
        type: "error",
        description: "Isi harga minimal Rp1.000 untuk setiap bahasa yang dipilih.",
        priority: "high",
      });
      return;
    }

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

  const startReorder = () => {
    setOrderedServices(services);
    setIsReordering(true);
  };

  const cancelReorder = () => {
    setIsReordering(false);
    setOrderedServices([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedServices((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const saveOrder = async () => {
    if (isSavingOrder || orderedServices.length === 0) return;

    setIsSavingOrder(true);
    try {
      const result = await reorderServicesAction(orderedServices.map((item) => item.id));

      if (result.success) {
        toast.add({ type: "success", description: result.message });
        setIsReordering(false);
        setOrderedServices([]);
        router.refresh();
      } else {
        toast.add({ type: "error", description: result.message, priority: "high" });
      }
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2Icon className="size-5" /> Kelola Layanan
              </CardTitle>
              <CardDescription>
                {activeCount} layanan aktif dari {services.length} total. Harga per bahasa di
                sini yang dipakai saat klien membayar.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {services.length > 1 ? (
                isReordering ? (
                  <>
                    <Button variant="outline" onClick={cancelReorder} disabled={isSavingOrder}>
                      Batal
                    </Button>
                    <Button onClick={() => void saveOrder()} disabled={isSavingOrder}>
                      {isSavingOrder ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <CheckIcon className="size-4" />
                      )}
                      Simpan Urutan
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={startReorder}>
                    <ArrowUpDownIcon className="size-4" /> Atur Urutan
                  </Button>
                )
              ) : null}

              {!isReordering ? (
                <Button onClick={openCreate}>
                  <PlusIcon className="size-4" /> Tambah Layanan
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {services.length > 0 && !isReordering ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="sm:max-w-sm">
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari nama, kode, atau deskripsi layanan"
                  aria-label="Cari layanan"
                />
                {query ? (
                  <InputGroupAddon align="inline-end">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Hapus pencarian"
                      onClick={() => setQuery("")}
                    >
                      <XIcon />
                    </Button>
                  </InputGroupAddon>
                ) : null}
              </InputGroup>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { key: "all", label: "Semua", count: services.length },
                    { key: "active", label: "Aktif", count: activeCount },
                    {
                      key: "inactive",
                      label: "Nonaktif",
                      count: services.length - activeCount,
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={statusFilter === item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
                      statusFilter === item.key
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[10px]",
                        statusFilter === item.key
                          ? "bg-background/20"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isReordering ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Seret pegangan di kiri untuk mengubah urutan tampil. Perubahan baru tersimpan
                setelah menekan <strong className="text-foreground">Simpan Urutan</strong>.
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedServices.map((service) => service.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {orderedServices.map((service, index) => (
                      <SortableServiceRow
                        key={service.id}
                        service={service}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-16 text-center">
              <Settings2Icon className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Belum ada layanan.</p>
                <p className="text-sm text-muted-foreground">
                  Tambahkan layanan pertama agar bisa dipesan dari halaman utama.
                </p>
              </div>
              <Button onClick={openCreate} variant="outline">
                <PlusIcon className="size-4" /> Tambah layanan
              </Button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-12 text-center">
              <SearchIcon className="size-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Tidak ada layanan yang cocok.</p>
                <p className="text-sm text-muted-foreground">
                  Coba kata kunci lain atau ubah filter status.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                }}
              >
                Reset pencarian
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => {
                const distinctPrices = new Set(
                  service.languages.map((code) => service.prices[code] ?? service.price),
                );

                return (
                  <div key={service.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{service.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">Kode: {service.slug}</p>
                      </div>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>

                    <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                      {service.description || "Tanpa deskripsi."}
                    </p>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-1.5">
                        {distinctPrices.size > 1 ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Mulai dari
                          </span>
                        ) : null}
                        <span className="text-sm font-bold">{formatRupiah(service.price)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {service.languages.map((code) => (
                          <span
                            key={code}
                            className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {code.toUpperCase()} {formatRupiah(service.prices[code] ?? service.price)}
                          </span>
                        ))}
                      </div>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Layanan" : "Tambah Layanan"}</DialogTitle>
            <DialogDescription>
              Atur nama, bahasa, dan harga layanan di katalog.
            </DialogDescription>
          </DialogHeader>

          <Separator className="py-0" />

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Ditampilkan di katalog</p>
              <p className="text-[11px] text-muted-foreground">
                Nonaktifkan untuk menyembunyikan layanan dari halaman publik.
              </p>
            </div>
            <Switch
              id="serviceActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked)}
            />
          </div>

          <div className="dialog-scroll -mx-4 max-h-[60vh] overflow-y-auto px-4">
            <form onSubmit={submitForm} className="flex flex-col gap-4" id="serviceForm">
              <input type="hidden" name="id" value={editing?.id ?? ""} />
              <input type="hidden" name="isActive" value={String(isActive)} />
              <input type="hidden" name="sortOrder" value={sortOrder} />
              {languages.map((code) => (
                <input key={code} type="hidden" name="languages" value={code} />
              ))}

              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="serviceName">
                      Nama layanan <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="serviceName"
                      name="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="mis. CV ATS Friendly"
                      required
                      maxLength={120}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="serviceSlug">
                      Kode layanan <span className="text-muted-foreground">· opsional</span>
                    </FieldLabel>
                    <Input
                      id="serviceSlug"
                      name="slug"
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
                      placeholder="otomatis dari nama (mis. cv-ats)"
                      maxLength={80}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="serviceDescription">
                    Deskripsi <span className="text-muted-foreground">· opsional</span>
                  </FieldLabel>
                  <Textarea
                    id="serviceDescription"
                    name="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    maxLength={600}
                    placeholder="Ringkas manfaat & siapa yang cocok (maks. 600 karakter)."
                  />
                </Field>

                <Field>
                  <FieldLabel>Bahasa tersedia</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((item) => (
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {LANGUAGE_OPTIONS.filter((item) => languages.includes(item.code)).map((item) => (
                    <Field key={item.code}>
                      <FieldLabel htmlFor={`servicePrice-${item.code}`}>
                        Harga {item.label} (Rp) <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id={`servicePrice-${item.code}`}
                        name={`price_${item.code}`}
                        inputMode="numeric"
                        value={prices[item.code] ?? ""}
                        onChange={(event) =>
                          setPrices((previous) => ({
                            ...previous,
                            [item.code]: event.target.value,
                          }))
                        }
                        placeholder="mis. 75000"
                        required
                      />
                    </Field>
                  ))}
                </div>
              </FieldGroup>
            </form>
          </div>

          <DialogFooter>
            <p className="mr-auto text-[11px] text-muted-foreground">
              <span className="text-destructive">*</span> wajib · opsional boleh dikosongkan
            </p>
            <DialogClose render={<Button type="button" variant="outline" />} disabled={isPending}>
              Batal
            </DialogClose>
            <Button form="serviceForm" type="submit" disabled={isPending || !pricesValid}>
              {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
              {editing ? "Simpan Perubahan" : "Tambah Layanan"}
            </Button>
          </DialogFooter>
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
              Layanan akan hilang dari halaman utama. Riwayat pesanan lama tetap tersimpan dengan nama
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
