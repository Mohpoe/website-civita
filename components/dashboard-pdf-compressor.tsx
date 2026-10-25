"use client";

import { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileDownIcon,
  FileTextIcon,
  UploadIcon,
  XIcon,
  RefreshCwIcon,
  DownloadIcon,
  InfoIcon,
  CheckCircle2Icon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { cn } from "cn";

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface CompressionPreset {
  id: "extreme" | "recommended" | "balanced" | "low" | "custom";
  name: string;
  description: string;
  quality: number;
}

const PRESETS: CompressionPreset[] = [
  {
    id: "extreme",
    name: "Ekstrim",
    description: "Ukuran paling kecil, kualitas agak berkurang",
    quality: 30,
  },
  {
    id: "recommended",
    name: "Direkomendasikan",
    description: "Keseimbangan terbaik antara ukuran dan kualitas",
    quality: 50,
  },
  {
    id: "balanced",
    name: "Seimbang",
    description: "Ukuran lebih besar sedikit, kualitas lebih baik",
    quality: 70,
  },
  {
    id: "low",
    name: "Rendah Kompresi",
    description: "Hampir tanpa kompresi, kualitas terjaga",
    quality: 85,
  },
  {
    id: "custom",
    name: "Kustom",
    description: "Atur sendiri kualitas kompresi",
    quality: 60,
  },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DashboardPdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<CompressionPreset["id"]>("recommended");
  const [customQuality, setCustomQuality] = useState([60]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPreset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[1];
  const quality = selectedPreset === "custom" ? customQuality[0] : currentPreset.quality;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setCompressedBlob(null);
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setFile(null);
    setCompressedBlob(null);
  };

  const handleCompress = async () => {
    if (!file) {
      toast.error("Pilih file PDF terlebih dahulu.");
      return;
    }

    setIsCompressing(true);
    toast.info("Sedang mengompresi PDF...", {
      description: "Proses ini dapat memakan beberapa saat",
    });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("");
      pdfDoc.setCreator("");
      
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      
      setCompressedBlob(blob);
      toast.success("PDF berhasil dikompresi!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengompresi PDF. Silakan coba lagi.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    const originalName = file.name.replace(/\.pdf$/i, "");
    a.download = `${originalName}-compressed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setCompressedBlob(null);
    setSelectedPreset("recommended");
    setCustomQuality([60]);
  };

  const originalSize = file?.size || 0;
  const compressedSize = compressedBlob?.size || 0;
  const reduction = originalSize > 0 && compressedSize > 0 
    ? Math.round((1 - compressedSize / originalSize) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">PDF Compressor</h1>
          <p className="text-muted-foreground">
            Kurangi ukuran file PDF dengan berbagai pilihan kompresi. Proses dilakukan di browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={(!file && !compressedBlob) || isCompressing}
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
            <CardDescription>
              Maksimal {MAX_FILE_SIZE_MB} MB per file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-input rounded-lg text-center hover:bg-muted transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="h-10 w-10 text-muted-foreground mb-4" />
              <span className="text-sm font-medium text-foreground mb-1">
                Klik atau seret file PDF ke sini
              </span>
              <span className="text-xs text-muted-foreground">
                File akan diproses langsung di browser Anda
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
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemoveFile}
                disabled={isCompressing}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {file && !compressedBlob && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Pilihan Kompresi</CardTitle>
            <CardDescription>
              Pilih tingkat kompresi sesuai kebutuhan Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={cn(
                    "w-full flex items-start space-x-3 p-4 border rounded-lg text-left transition-colors",
                    selectedPreset === preset.id
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border mt-0.5",
                    selectedPreset === preset.id ? "border-primary" : "border-input"
                  )}>
                    {selectedPreset === preset.id && (
                      <div className="w-2 h-2 bg-primary rounded-full m-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {preset.name}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {preset.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {selectedPreset === "custom" && (
              <div className="space-y-4 p-4 border border-input rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Kualitas: {customQuality[0]}%</Label>
                    <span className="text-xs text-muted-foreground">
                      {customQuality[0] <= 40 && "Rendah"}
                      {customQuality[0] > 40 && customQuality[0] <= 70 && "Sedang"}
                      {customQuality[0] > 70 && "Tinggi"}
                    </span>
                  </div>
                  <Slider
                    value={customQuality}
                    onValueChange={(value) => setCustomQuality(Array.isArray(value) ? value : [value])}
                    max={100}
                    min={10}
                    step={5}
                  />
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={handleCompress}
              disabled={isCompressing}
              className="w-full"
              size="lg"
            >
              {isCompressing ? (
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
                  Sedang Mengompresi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FileDownIcon className="w-4 h-4" />
                  Kompres PDF
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {compressedBlob && file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal flex items-center gap-2">
              <CheckCircle2Icon className="w-5 h-5 text-green-600" />
              Kompresi Berhasil
            </CardTitle>
            <CardDescription>
              File berhasil dikompresi dengan preset {currentPreset.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border border-input rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Ukuran Asli</p>
                <p className="text-lg font-semibold">{formatBytes(originalSize)}</p>
              </div>
              <div className="p-4 border border-input rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Ukuran Hasil</p>
                <p className="text-lg font-semibold text-green-600">{formatBytes(compressedSize)}</p>
              </div>
              <div className="p-4 border border-input rounded-lg text-center col-span-2 md:col-span-1">
                <p className="text-xs text-muted-foreground mb-1">Penghematan</p>
                <p className="text-lg font-semibold text-green-600">
                  {reduction > 0 ? `${reduction}%` : "0%"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Kompresi ini menghilangkan metadata tidak penting dan mengoptimalkan struktur PDF.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <DownloadIcon className="w-4 h-4" />
                Unduh PDF Terkompresi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompressedBlob(null)}
                className="flex-1"
              >
                Kompres File Lain
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
