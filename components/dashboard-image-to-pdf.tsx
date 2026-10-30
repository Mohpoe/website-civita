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
import { toast } from "@/components/ui/toast";
import { cn } from "cn";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DownloadIcon,
  FileImageIcon,
  GripVerticalIcon,
  ImagesIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

type PageSizeMode = "original" | "custom";
type PageOrientation = "portrait" | "landscape";

interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface SortableImageItemProps {
  item: ImageFileItem;
  index: number;
  total: number;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}

function SortableImageItem({
  item,
  index,
  total,
  onMove,
  onRemove,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const stopPointer = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-input rounded-lg bg-background hover:bg-muted/50 transition-colors"
    >
      <button
        type="button"
        className="!cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Seret untuk mengurutkan"
        title="Seret untuk mengurutkan"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="w-4 h-4" />
      </button>

      <span className="text-xs font-medium text-muted-foreground w-5 text-center shrink-0">
        {index + 1}
      </span>

      <div className="w-12 h-12 rounded-md overflow-hidden border border-input shrink-0 bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.previewUrl}
          alt={item.file.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FileImageIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm truncate">{item.file.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {(item.file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onPointerDown={stopPointer}
          onClick={() => onMove(item.id, "up")}
          disabled={index === 0}
          aria-label="Naikkan"
          title="Naikkan"
        >
          <ChevronUpIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onPointerDown={stopPointer}
          onClick={() => onMove(item.id, "down")}
          disabled={index === total - 1}
          aria-label="Turunkan"
          title="Turunkan"
        >
          <ChevronDownIcon />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          onPointerDown={stopPointer}
          onClick={() => onRemove(item.id)}
          aria-label="Hapus"
          title="Hapus"
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}

export default function DashboardImageToPdf() {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pageSizeMode, setPageSizeMode] = useState<PageSizeMode>("original");
  const [pageOrientation, setPageOrientation] = useState<PageOrientation>("portrait");
  const [outputFileName, setOutputFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (!selectedFiles.length) return;

    if (images.length + selectedFiles.length > MAX_FILES) {
      toast.add({
        type: "error",
        description: `Maksimal ${MAX_FILES} file. Sudah ada ${images.length} file.`,
        priority: "high",
      });
      return;
    }

    const accepted: ImageFileItem[] = [];

    for (const file of selectedFiles) {
      const isValidType = ACCEPTED_TYPES.includes(file.type) ||
        ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isValidType) {
        toast.add({
          type: "error",
          description: `"${file.name}" bukan file gambar yang didukung (JPG, JPEG, PNG).`,
          priority: "high",
        });
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.add({
          type: "error",
          description: `"${file.name}" melebihi ${MAX_FILE_SIZE_MB} MB.`,
          priority: "high",
        });
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      accepted.push({
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl,
      });
    }

    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
      setPdfBlob(null);
    }
  };

  const handleRemoveFile = (id: string) => {
    setImages((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
    setPdfBlob(null);
  };

  const handleMoveFile = (id: string, direction: "up" | "down") => {
    setImages((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      return arrayMove(prev, index, newIndex);
    });
    setPdfBlob(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    setPdfBlob(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      toast.add({
        type: "error",
        description: "Pilih minimal 1 file gambar untuk dikonversi.",
        priority: "high",
      });
      return;
    }

    setIsConverting(true);
    toast.add({
      type: "info",
      description: "Sedang mengkonversi gambar ke PDF...",
    });

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageItem of images) {
        const arrayBuffer = await imageItem.file.arrayBuffer();
        const fileType = imageItem.file.type.toLowerCase();
        const fileName = imageItem.file.name.toLowerCase();

        let image;
        if (fileType === "image/png" || fileName.endsWith(".png")) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else if (fileType === "image/jpeg" || fileType === "image/jpg" || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else {
          // try to detect
          if (fileName.endsWith(".png")) {
            image = await pdfDoc.embedPng(arrayBuffer);
          } else {
            image = await pdfDoc.embedJpg(arrayBuffer);
          }
        }

        let page;
        if (pageSizeMode === "original") {
          page = pdfDoc.addPage([image.width, image.height]);
        } else {
          // A4 size in points (1 point = 1/72 inch, A4 is 595 x 842 points)
          if (pageOrientation === "portrait") {
            page = pdfDoc.addPage([595.28, 841.89]);
          } else {
            page = pdfDoc.addPage([841.89, 595.28]);
          }
          // Fit image to page maintaining aspect ratio
          const pageWidth = page.getWidth();
          const pageHeight = page.getHeight();
          const scale = Math.min(pageWidth / image.width, pageHeight / image.height);
          const scaledWidth = image.width * scale;
          const scaledHeight = image.height * scale;
          const x = (pageWidth - scaledWidth) / 2;
          const y = (pageHeight - scaledHeight) / 2;
          page.drawImage(image, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
          });
          continue;
        }

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setPdfBlob(blob);

      toast.add({
        type: "success",
        description: "Berhasil mengkonversi gambar ke PDF!",
      });
    } catch (error) {
      console.error(error);
      toast.add({
        type: "error",
        description: "Gagal mengkonversi gambar ke PDF. Silakan coba lagi.",
        priority: "high",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;

    let filename = outputFileName.trim();
    if (!filename) {
      // use first image name without extension
      if (images.length > 0) {
        const firstName = images[0].file.name.replace(/\.[^/.]+$/, "");
        filename = `${firstName}.pdf`;
      } else {
        filename = "images-to-pdf.pdf";
      }
    } else {
      if (!filename.toLowerCase().endsWith(".pdf")) {
        filename = `${filename}.pdf`;
      }
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setPdfBlob(null);
    setPageSizeMode("original");
    setPageOrientation("portrait");
    setOutputFileName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Image to PDF</h1>
          <p className="text-muted-foreground">
            Konversi gambar JPG, JPEG, atau PNG menjadi file PDF. Atur urutan halaman sesuai kebutuhan Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={images.length === 0 || isConverting}
          >
            <RefreshCwIcon className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Pilih Gambar</CardTitle>
          <CardDescription>
            {images.length} / {MAX_FILES} file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label
            className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-input rounded-lg text-center hover:bg-muted transition-colors gap-3 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <PlusIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Klik untuk memilih gambar
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, JPEG, PNG • Maksimal {MAX_FILE_SIZE_MB} MB per file
            </span>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              multiple
              className="sr-only"
              onChange={handleFileSelect}
            />
          </label>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Daftar Gambar</CardTitle>
            <CardDescription>
              Urutkan gambar untuk mengatur urutan halaman PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((img) => img.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {images.map((item, index) => (
                    <SortableImageItem
                      key={item.id}
                      item={item}
                      index={index}
                      total={images.length}
                      onMove={handleMoveFile}
                      onRemove={handleRemoveFile}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && !pdfBlob && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Pengaturan PDF</CardTitle>
            <CardDescription>
              Atur ukuran halaman dan nama file hasil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ukuran Halaman</Label>
              <RadioGroup
                value={pageSizeMode}
                onValueChange={(value) => setPageSizeMode(value as PageSizeMode)}
                className="space-y-3"
              >
                <Label
                  htmlFor="page-original"
                  className={cn(
                    "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                    pageSizeMode === "original"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value="original" id="page-original" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Ikuti Ukuran Gambar</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Setiap halaman PDF disesuaikan dengan ukuran gambar asli
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="page-custom"
                  className={cn(
                    "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                    pageSizeMode === "custom"
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value="custom" id="page-custom" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Ukuran Halaman Kustom (A4)</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Semua gambar disesuaikan ke halaman A4 dengan proporsi terjaga
                    </p>
                  </div>
                </Label>
              </RadioGroup>

              {pageSizeMode === "custom" && (
                <div className="space-y-2 p-4 border border-input rounded-lg bg-muted/30">
                  <Label className="text-sm">Orientasi Halaman</Label>
                  <Select
                    value={pageOrientation}
                    onValueChange={(value) => setPageOrientation(value as PageOrientation)}
                    items={[
                      { value: "portrait", label: "Portrait (Vertikal)" },
                      { value: "landscape", label: "Landscape (Horizontal)" },
                    ]}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait (Vertikal)</SelectItem>
                      <SelectItem value="landscape">Landscape (Horizontal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="output-filename" className="text-sm font-medium">Nama File PDF</Label>
              <Input
                id="output-filename"
                placeholder={images.length > 0 ? images[0].file.name.replace(/\.[^/.]+$/, "") + ".pdf" : "images-to-pdf.pdf"}
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk menggunakan nama file pertama
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
                  <ImagesIcon className="w-4 h-4" />
                  Konversi {images.length} Gambar ke PDF
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {pdfBlob && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal flex items-center gap-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              Konversi Berhasil
            </CardTitle>
            <CardDescription>
              Berhasil mengkonversi {images.length} gambar menjadi file PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center gap-2"
                size="lg"
              >
                <DownloadIcon className="w-4 h-4" />
                Unduh PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPdfBlob(null)}
                className="flex-1"
              >
                Konversi Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
