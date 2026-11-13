export type PdfToWordJobStatus =
  | "queued"
  | "submitting"
  | "processing"
  | "done"
  | "failed";

export type PdfToWordOwnerKind = "guest" | "user";

export interface PdfToWordJob {
  id: string;
  ownerKind: PdfToWordOwnerKind;
  ownerId: string;
  /** Nama file asli dari user, dipakai untuk nama DOCX hasil. */
  fileName: string;
  inputPathname: string;
  outputPathname?: string;
  outputName?: string;
  /** URL polling job Adobe. Disimpan setelah submit berhasil. */
  adobePollUrl?: string;
  status: PdfToWordJobStatus;
  error?: string;
  createdAt: number;
  updatedAt: number;
  /** Key Redis kuota yang sudah dipotong, untuk refund jika job gagal. */
  quotaKeys: string[];
  refunded?: boolean;
}

export type PdfToWordQuotaInfo = {
  kind: "admin" | "buyer" | "user" | "guest";
  limit: number;
  used: number;
  remaining: number;
  period: "day" | "month";
  unlimited?: boolean;
  daily?: {
    limit: number;
    used: number;
    remaining: number;
  };
};
