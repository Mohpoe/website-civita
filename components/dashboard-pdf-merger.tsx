"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  FileTextIcon,
  DownloadIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCwIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  GripVerticalIcon,
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
import { toast } from "sonner";

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface PdfFileItem {
  id: string;
  file: File;
  arrayBuffer: ArrayBuffer | null;
}

interface SortableFileItemProps {
  item: PdfFileItem;
  index: number;
  total: number;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
}

// Komponen item didefinisikan di level modul (bukan di dalam komponen induk)
// agar tidak di-remount setiap kali state berubah.
function SortableFileItem({
  item,
  index,
  total,
  onMove,
  onRemove,
}: SortableFileItemProps) {
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

  // Hentikan propagasi pointer agar klik tombol tidak memicu drag
  const stopPointer = (e: React.PointerEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-input rounded-lg bg-background hover:bg-muted/50 transition-colors"
    >
      {/* Handle drag: hanya bagian ini yang bisa menyeret */}
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FileTextIcon className="w-4 h-4 text-destructive shrink-0" />
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

export default function DashboardPdfMerger() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Drag baru aktif setelah pointer bergerak 8px,
      // sehingga klik biasa pada tombol tidak teranggap drag.
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Tambah file
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(
        `Maksimal ${MAX_FILES} file. Sudah ada ${files.length} file.`
      );
      e.target.value = "";
      return;
    }

    const accepted: PdfFileItem[] = [];

    for (const file of selectedFiles) {
      if (file.type !== "application/pdf") {
        toast.error(`"${file.name}" bukan file PDF.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" melebihi ${MAX_FILE_SIZE_MB} MB.`);
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      accepted.push({
        id: crypto.randomUUID(),
        file,
        arrayBuffer,
      });
    }

    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
      setMergedBlob(null);
    }

    e.target.value = "";
  };

  // Hapus file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedBlob(null);
  };

  // Pindahkan file lewat tombol naik/turun
  const handleMoveFile = (id: string, direction: "up" | "down") => {
    setFiles((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      return arrayMove(prev, index, newIndex);
    });
    setMergedBlob(null);
  };

  // Selesai drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFiles((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
    setMergedBlob(null);
  };

  // Proses merge
  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Pilih minimal 2 file PDF untuk digabung.");
      return;
    }

    setIsMerging(true);
    toast.info("Sedang menggabungkan PDF...", {
      description: "Mohon tunggu sebentar",
    });

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        if (!item.arrayBuffer) continue;
        const sourcePdf = await PDFDocument.load(item.arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setMergedBlob(blob);

      toast.success("PDF berhasil digabung!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menggabungkan PDF. Pastikan file tidak terkunci.");
    } finally {
      setIsMerging(false);
    }
  };

  // Download hasil merge
  const handleDownload = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gabungan-pdf-civita.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset semua
  const handleReset = () => {
    setFiles([]);
    setMergedBlob(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">PDF Merger</h1>
          <p className="text-muted-foreground">
            Gabungkan beberapa file PDF menjadi satu dokumen. Urutkan file dengan
            tombol panah atau dengan menyeret handle di samping kiri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={files.length === 0 || isMerging}
          >
            <RefreshCwIcon className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      {/* Upload Area */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-normal">Pilih File PDF</CardTitle>
          <CardDescription>
            {files.length} / {MAX_FILES} file
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-input rounded-lg text-center hover:bg-muted transition-colors"> */}
          <label
            className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-input rounded-lg text-center hover:bg-muted transition-colors gap-3 cursor-pointer"
            onClick={() => document.getElementById("pdf-file-input")?.click()}
          >
            <PlusIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Klik untuk memilih file PDF
            </span>
            <span className="text-xs text-muted-foreground">
              Maksimal {MAX_FILE_SIZE_MB} MB per file
            </span>
            <Input
              id="pdf-file-input"
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={handleFileSelect}
            />
          </label>
          {/* </div> */}
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal">Daftar File</CardTitle>
            <CardDescription>
              Gunakan tombol panah untuk mengubah urutan gabungan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={files.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {files.map((item, index) => (
                    <SortableFileItem
                      key={item.id}
                      item={item}
                      index={index}
                      total={files.length}
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

      {/* Action */}
      {files.length > 0 && (
        <Card>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Total file: {files.length}
              </p>
              <div className="flex items-center gap-2">
                {mergedBlob && (
                  <Button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Unduh Gabungan PDF
                  </Button>
                )}
                {!isMerging && !mergedBlob && (
                  <Button
                    type="button"
                    onClick={handleMerge}
                    className="flex items-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Gabungkan PDF
                  </Button>
                )}
                {isMerging && (
                  <Button
                    type="button"
                    disabled
                    className="flex items-center gap-2 opacity-80"
                  >
                    <span className="flex flex-row items-center gap-2">
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
                      Memproses...
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
