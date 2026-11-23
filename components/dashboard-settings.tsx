"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { updateSiteSettingsAction } from "@/lib/actions/settings";
import type { SiteSettings } from "@/lib/site-config";
import { sanitizeFileName } from "@/lib/utils";
import { uploadPresigned } from "@vercel/blob/client";
import {
  AtSign,
  Building2,
  ImageUp,
  LayoutTemplate,
  Loader2,
  Info,
  Save,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

interface DashboardSettingsProps {
  settings: SiteSettings;
}

export default function DashboardSettings({ settings }: DashboardSettingsProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSiteSettingsAction, null);

  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.add({ type: "success", description: state.message });
      router.refresh();
    } else {
      toast.add({ type: "error", description: state.message, priority: "high" });
    }
  }, [state, router]);

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.add({ type: "error", description: "Logo harus berupa gambar." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.add({ type: "error", description: "Ukuran logo maksimal 2 MB." });
      return;
    }

    setIsUploading(true);
    try {
      const blob = await uploadPresigned(`brand/${sanitizeFileName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload/public",
      });
      setLogoUrl(blob.url);
      toast.add({ type: "success", description: "Logo berhasil diunggah. Jangan lupa simpan." });
    } catch (error) {
      console.error(error);
      toast.add({ type: "error", description: "Gagal mengunggah logo. Coba lagi." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" /> Identitas Situs
            </CardTitle>
            <CardDescription>
              Nama brand, tagline, dan deskripsi yang tampil di halaman utama serta footer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="brandName">Nama brand</FieldLabel>
                  <Input id="brandName" name="brandName" defaultValue={settings.brandName} required maxLength={60} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
                  <Input id="tagline" name="tagline" defaultValue={settings.tagline} maxLength={120} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="description">Deskripsi singkat</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={settings.description}
                  rows={3}
                  maxLength={400}
                />
                <FieldDescription>Dipakai sebagai ringkasan brand dan pratinjau saat halaman dibagikan.</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageUp className="size-5" /> Logo
            </CardTitle>
            <CardDescription>PNG/SVG transparan, maksimal 2 MB.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Pratinjau logo"
                  width={96}
                  height={96}
                  className="h-20 w-20 object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-sm text-muted-foreground">Belum ada logo</span>
              )}
            </div>

            <input type="hidden" name="logoUrl" value={logoUrl} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleLogoUpload(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
              {isUploading ? "Mengunggah..." : "Ganti logo"}
            </Button>

            <Field>
              <FieldLabel htmlFor="logoUrlManual">Atau tempel tautan logo</FieldLabel>
              <Input
                id="logoUrlManual"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://..."
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AtSign className="size-5" /> Kontak
            </CardTitle>
            <CardDescription>Email dan WhatsApp yang dipakai tombol konsultasi.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="emailPrimary">Email utama</FieldLabel>
                  <Input id="emailPrimary" name="emailPrimary" type="email" defaultValue={settings.emailPrimary} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="emailSupport">Email alternatif</FieldLabel>
                  <Input id="emailSupport" name="emailSupport" type="email" defaultValue={settings.emailSupport} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="whatsappNumber">Nomor WhatsApp</FieldLabel>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  defaultValue={settings.whatsappNumber}
                  placeholder="628xxxxxxxxxx"
                />
                <FieldDescription>Hanya angka, format internasional tanpa tanda +.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="consultMessage">Pesan konsultasi WhatsApp</FieldLabel>
                <Textarea
                  id="consultMessage"
                  name="consultMessage"
                  defaultValue={settings.consultMessage}
                  rows={3}
                  maxLength={500}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="size-5" /> Media Sosial
            </CardTitle>
            <CardDescription>Tautan yang tampil di footer.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="instagramUrl">Instagram</FieldLabel>
                <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl} placeholder="https://instagram.com/..." />
              </Field>
              <Field>
                <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
                <Input id="linkedinUrl" name="linkedinUrl" defaultValue={settings.linkedinUrl} placeholder="https://linkedin.com/company/..." />
              </Field>
              <Field>
                <FieldLabel htmlFor="twitterHandle">Handle X / Twitter</FieldLabel>
                <Input id="twitterHandle" name="twitterHandle" defaultValue={settings.twitterHandle} placeholder="@brand" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="size-5" /> Teks Halaman Utama
          </CardTitle>
          <CardDescription>Judul dan subjudul utama di bagian atas halaman utama.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="heroHeadline">Judul utama</FieldLabel>
              <Input id="heroHeadline" name="heroHeadline" defaultValue={settings.heroHeadline} maxLength={160} />
            </Field>
            <Field>
              <FieldLabel htmlFor="heroSubheadline">Subjudul utama</FieldLabel>
              <Textarea
                id="heroSubheadline"
                name="heroSubheadline"
                defaultValue={settings.heroSubheadline}
                rows={3}
                maxLength={400}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col items-start justify-between gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="size-4" />
          Perubahan langsung tampil di halaman utama setelah disimpan.
        </p>
        <Button type="submit" disabled={isPending || isUploading} className="min-w-40">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  );
}
