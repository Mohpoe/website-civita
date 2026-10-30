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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { cn } from "cn";
import JSZip from "jszip";
import {
  ArchiveIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  PlusIcon,
  RefreshCwIcon,
  ScissorsIcon,
  XIcon,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useRef, useState } from "react";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type SplitMode = "all" | "range" | "custom";

interface SplitResult {
  blob: Blob;
  filename: string;
  pageRange: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DashboardPdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>("all");
  const [rangeFrom, setRangeFrom] = useState("1");
  const [rangeTo, setRangeTo] = useState("1");
  const [customPages, setCustomPages] = useState("");
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.add({
        type: "error",
        description: "Hanya file PDF yang diperbolehkan.",
        priority: "high",
      });
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.add({
        type: "error",
        description: `File terlalu besar. Maksimal ${MAX_FILE_SIZE_MB} MB.`,
        priority: "high",
      });
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setSplitResults([]);
    setIsLoading(true);
    e.target.value = "";

    try {
      const buffer = await selectedFile.arrayBuffer();
      setArrayBuffer(buffer.slice(0));

      const pdf = await pdfjsLib.getDocument({
        data: buffer,
        useWorkerFetch: false,
        useSystemFonts: true,
      } as any).promise;

      setTotalPages(pdf.numPages);
      setRangeFrom("1");
      setRangeTo(String(pdf.numPages));
      toast.add({
        type: "success",
        description: "PDF berhasil dimuat!",
      });
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        description: "Gagal memuat file PDF.",
        priority: "high",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplit = async () => {
    if (!file || !arrayBuffer) {
      toast.add({
        type: "error",
        description: "Pilih file PDF terlebih dahulu.",
        priority: "high",
      });
      return;
    }

    setIsSplitting(true);
    setSplitResults([]);
    toast.add({
      type: "info",
      description: "Sedang memisahkan PDF...",
    });

    try {
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const results: SplitResult[] = [];
      const originalName = file.name.replace(/\.pdf$/i, "");

      if (splitMode === "all") {
        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
          results.push({
            blob,
            filename: `${originalName}-page-${i + 1}.pdf`,
            pageRange: `Halaman ${i + 1}`,
          });
        }
      } else if (splitMode === "range") {
        const from = parseInt(rangeFrom);
        const to = parseInt(rangeTo);
        if (isNaN(from) || isNaN(to) || from < 1 || to > totalPages || from > to) {
          toast.add({
            type: "error",
            description: "Rentang halaman tidak valid.",
            priority: "high",
          });
          setIsSplitting(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const pagesToCopy = [];
        for (let i = from - 1; i < to; i++) {
          pagesToCopy.push(i);
        }
        const copiedPages = await newPdf.copyPages(sourcePdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
        results.push({
          blob,
          filename: `${originalName}-pages-${from}-${to}.pdf`,
          pageRange: `Halaman ${from}-${to}`,
        });
      } else if (splitMode === "custom") {
        const pageNumbers = customPages
          .split(/[,;\s]+/)
          .filter((p) => p.trim())
          .map((p) => parseInt(p.trim()))
          .filter((p) => !isNaN(p) && p >= 1 && p <= totalPages);

        if (pageNumbers.length === 0) {
          toast.add({
            type: "error",
            description: "Masukkan nomor halaman yang valid.",
            priority: "high",
          });
          setIsSplitting(false);
          return;
        }

        for (const pageNum of pageNumbers) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
          results.push({
            blob,
            filename: `${originalName}-page-${pageNum}.pdf`,
            pageRange: `Halaman ${pageNum}`,
          });
        }
      }

      setSplitResults(results);
      toast.add({
        type: "success",
        description: `Berhasil memisahkan menjadi ${results.length} file PDF!`,
      });
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        description: "Gagal memisahkan PDF. Silakan coba lagi.",
        priority: "high",
      });
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownloadSingle = (result: SplitResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (splitResults.length === 0) return;

    try {
      const zip = new JSZip();
      const originalName = file?.name.replace(/\.pdf$/i, "") || "pdf";

      for (const result of splitResults) {
        zip.file(result.filename, result.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${originalName}-split.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.add({
        type: "success",
        description: "Berhasil mengunduh semua file dalam format ZIP!",
      });
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        description: "Gagal membuat file ZIP.",
        priority: "high",
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setArrayBuffer(null);
    setTotalPages(0);
    setSplitResults([]);
    setSplitMode("all");
    setRangeFrom("1");
    setRangeTo("1");
    setCustomPages("");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">PDF Splitter</h1>
          <p className="text-sm text-muted-foreground">
            Pisahkan file PDF menjadi beberapa file terpisah. Proses dilakukan di browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!file || isSplitting}
            className="w-full sm:w-auto"
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
            <label
              className="flex flex-col items-center justify-center py-6 sm:py-8 md:py-12 border-2 border-dashed border-input rounded-lg text-center hover:bg-muted transition-colors gap-2 sm:gap-3 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusIcon className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Klik untuk memilih file PDF
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
            </label>
          </CardContent>
        </Card>
      )}

      {file && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal">File yang Dipilih</CardTitle>
            <CardDescription>
              {totalPages} halaman
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-input rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <FileTextIcon className="w-7 h-7 sm:w-8 sm:h-8 text-destructive shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
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
                onClick={handleReset}
                disabled={isSplitting}
                className="self-end sm:self-auto"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {file && splitResults.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Mode Pemisahan</CardTitle>
            <CardDescription>
              Pilih cara memisahkan file PDF Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={splitMode}
              onValueChange={(value) => setSplitMode(value as SplitMode)}
              className="space-y-2 sm:space-y-3"
            >
              <Label
                htmlFor="mode-all"
                className={cn(
                  "flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors",
                  splitMode === "all"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value="all" id="mode-all" className="mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Pisahkan Semua Halaman</div>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    Setiap halaman akan menjadi file PDF terpisah ({totalPages} file)
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="mode-range"
                className={cn(
                  "flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors",
                  splitMode === "range"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value="range" id="mode-range" className="mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Ekstrak Rentang Halaman</div>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    Ekstrak beberapa halaman berurutan menjadi satu file
                  </p>
                </div>
              </Label>

              <Label
                htmlFor="mode-custom"
                className={cn(
                  "flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors",
                  splitMode === "custom"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value="custom" id="mode-custom" className="mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Pilih Halaman Tertentu</div>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    Pisahkan halaman pilihan menjadi file terpisah
                  </p>
                </div>
              </Label>
            </RadioGroup>

            {splitMode === "range" && (
              <div className="space-y-4 p-4 border border-input rounded-lg bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="range-from" className="text-sm">Dari Halaman</Label>
                    <Input
                      id="range-from"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="range-to" className="text-sm">Sampai Halaman</Label>
                    <Input
                      id="range-to"
                      type="number"
                      min="1"
                      max={totalPages}
                      value={rangeTo}
                      onChange={(e) => setRangeTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {splitMode === "custom" && (
              <div className="space-y-2 p-4 border border-input rounded-lg bg-muted/30">
                <Label htmlFor="custom-pages" className="text-sm">Nomor Halaman</Label>
                <Input
                  id="custom-pages"
                  placeholder="Contoh: 1, 3, 5-7 atau 2 4 6"
                  value={customPages}
                  onChange={(e) => setCustomPages(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Pisahkan dengan koma, titik koma, spasi, atau tanda hubung untuk rentang
                </p>
              </div>
            )}

            <Button
              type="button"
              onClick={handleSplit}
              disabled={isSplitting || isLoading}
              className="w-full"
              size="lg"
            >
              {isSplitting ? (
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
                  Sedang Memisahkan...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ScissorsIcon className="w-4 h-4" />
                  Pisahkan PDF
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {splitResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              Pemisahan Berhasil
            </CardTitle>
            <CardDescription>
              Berhasil memisahkan menjadi {splitResults.length} file PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={handleDownloadAll}
                className="w-full sm:flex-1 flex items-center gap-2"
                size="lg"
              >
                <ArchiveIcon className="w-4 h-4" />
                Unduh Semua (.ZIP)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSplitResults([])}
                className="w-full sm:flex-1"
              >
                Pisahkan Lagi
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Hasil Pemisahan</h3>
              {splitResults.map((result, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 sm:p-3 border border-input rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <FileTextIcon className="w-5 h-5 text-destructive shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{result.filename}</p>
                      <p className="text-xs text-muted-foreground">{result.pageRange}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadSingle(result)}
                    className="w-full sm:w-auto"
                  >
                    <DownloadIcon className="w-3 h-3" />
                    Unduh
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
