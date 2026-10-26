"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "cn";
import JSZip from "jszip";
import {
  ArchiveIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  InfoIcon,
  PlusIcon,
  RefreshCwIcon,
  XIcon
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { useRef, useState } from "react";
import { toast } from "sonner";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type ImageFormat = "jpg" | "png";
type ScaleOption = 1 | 1.5 | 2 | 2.5 | 3;

interface ConvertedImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
  filename: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DashboardPdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [quality, setQuality] = useState([90]);
  const [scale, setScale] = useState<ScaleOption>(2);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan.");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File terlalu besar. Maksimal ${MAX_FILE_SIZE_MB} MB.`);
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setConvertedImages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        useSystemFonts: true,
      } as any).promise;
      setTotalPages(pdf.numPages);
    } catch (error) {
      console.error(error);
      toast.error("Gagal membaca file PDF.");
    }

    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setFile(null);
    setConvertedImages([]);
    setTotalPages(0);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Pilih file PDF terlebih dahulu.");
      return;
    }

    setIsConverting(true);
    setConvertedImages([]);
    toast.info("Sedang mengkonversi PDF ke gambar...", {
      description: `Mengkonversi ${totalPages} halaman`,
    });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        useSystemFonts: true,
      } as any).promise;
      const images: ConvertedImage[] = [];
      const originalName = file.name.replace(/\.pdf$/i, "");

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Failed to get canvas context");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise;

        const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const qualityValue = format === "jpg" ? quality[0] / 100 : undefined;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to convert canvas to blob"));
            },
            mimeType,
            qualityValue
          );
        });

        const dataUrl = canvas.toDataURL(mimeType, qualityValue);
        const ext = format === "jpg" ? "jpg" : "png";
        const filename = `${originalName}-page-${pageNum}.${ext}`;

        images.push({
          pageNumber: pageNum,
          blob,
          dataUrl,
          filename,
        });
      }

      setConvertedImages(images);
      toast.success(`Berhasil mengkonversi ${images.length} halaman!`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengkonversi PDF. Silakan coba lagi.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadSingle = (image: ConvertedImage) => {
    const url = URL.createObjectURL(image.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = image.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (convertedImages.length === 0) return;

    try {
      const zip = new JSZip();
      const originalName = file?.name.replace(/\.pdf$/i, "") || "pdf";

      for (const image of convertedImages) {
        zip.file(image.filename, image.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${originalName}-images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Berhasil mengunduh semua gambar dalam format ZIP!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat file ZIP.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setConvertedImages([]);
    setTotalPages(0);
    setFormat("jpg");
    setQuality([90]);
    setScale(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">PDF to Image</h1>
          <p className="text-muted-foreground">
            Konversi halaman PDF menjadi gambar JPG atau PNG dengan berbagai pengaturan resolusi. Proses dilakukan di browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={(!file && convertedImages.length === 0) || isConverting}
          >
            <RefreshCwIcon className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      {!file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Pilih File PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-input rounded-lg text-center hover:bg-muted transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusIcon className="h-10 w-10 text-muted-foreground mb-4" />
              <span className="text-sm font-medium text-foreground mb-1">
                Klik untuk memilih file PDF
              </span>
              <span className="text-xs text-muted-foreground">
                Ukuran file maksimal {MAX_FILE_SIZE_MB} MB
              </span>
              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">File yang Dipilih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-input rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <FileTextIcon className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px] md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)} • {totalPages} halaman
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemoveFile}
                disabled={isConverting}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {file && convertedImages.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Pengaturan Konversi</CardTitle>
            <CardDescription>
              Atur format, kualitas, dan resolusi gambar hasil konversi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Format Gambar</Label>
              <RadioGroup
                value={format}
                onValueChange={(value) => setFormat(value as ImageFormat)}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="format-jpg"
                  className={cn(
                    "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                    format === "jpg"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value="jpg" id="format-jpg" />
                  <div>
                    <div className="text-sm font-medium">JPG/JPEG</div>
                    <p className="text-xs text-muted-foreground">Ukuran lebih kecil</p>
                  </div>
                </Label>
                <Label
                  htmlFor="format-png"
                  className={cn(
                    "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                    format === "png"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value="png" id="format-png" />
                  <div>
                    <div className="text-sm font-medium">PNG</div>
                    <p className="text-xs text-muted-foreground">Kualitas lebih tinggi, transparan</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {format === "jpg" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Kualitas JPG: {quality[0]}%</Label>
                  <span className="text-xs text-muted-foreground">
                    {quality[0] <= 70 && "Kompres tinggi"}
                    {quality[0] > 70 && quality[0] <= 85 && "Seimbang"}
                    {quality[0] > 85 && "Kualitas tinggi"}
                  </span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={(value) => setQuality(Array.isArray(value) ? value : [value])}
                  max={100}
                  min={10}
                  step={5}
                />
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">Resolusi/Skala</Label>
              <Select value={String(scale)} onValueChange={(value) => setScale(Number(value) as ScaleOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x (Normal) - Ukuran lebih kecil</SelectItem>
                  <SelectItem value="1.5">1.5x (Standar) - Seimbang</SelectItem>
                  <SelectItem value="2">2x (Tinggi) - Rekomendasi</SelectItem>
                  <SelectItem value="2.5">2.5x (Sangat Tinggi)</SelectItem>
                  <SelectItem value="3">3x (Maksimal) - File besar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Skala lebih tinggi menghasilkan gambar lebih tajam namun ukuran file lebih besar
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <InfoIcon className="w-4 h-4 shrink-0" />
              <p>
                Akan dikonversi semua {totalPages} halaman PDF menjadi {format.toUpperCase()}.
                Proses ini sepenuhnya dilakukan di browser Anda.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full"
              size="lg"
            >
              {isConverting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sedang Mengkonversi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Konversi {totalPages} Halaman
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {convertedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal flex items-center gap-2">
              <CheckCircle2Icon className="w-5 h-5 text-green-600" />
              Konversi Berhasil
            </CardTitle>
            <CardDescription>
              Berhasil mengkonversi {convertedImages.length} halaman menjadi {format.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={handleDownloadAll}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <ArchiveIcon className="w-4 h-4" />
                Unduh Semua (.ZIP)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConvertedImages([])}
                className="flex-1"
              >
                Konversi Ulang
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Hasil Konversi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {convertedImages.map((image) => (
                  <Card key={image.pageNumber} className="overflow-hidden">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.dataUrl}
                        alt={`Halaman ${image.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Halaman {image.pageNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(image.blob.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSingle(image)}
                        className="w-full"
                      >
                        <DownloadIcon className="w-3 h-3" />
                        Unduh
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
