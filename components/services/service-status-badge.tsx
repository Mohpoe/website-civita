import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ServiceOrderStatus } from "@/types/global";

const STATUS_META: Record<ServiceOrderStatus, { label: string; className: string }> = {
  pending: { label: "Menunggu bayar", className: "bg-butter text-on-accent" },
  challenge: { label: "Ditinjau", className: "bg-lilac text-on-accent" },
  success: { label: "Dibayar", className: "bg-sage text-on-accent" },
  failed: { label: "Gagal", className: "bg-coral text-on-accent" },
  expired: { label: "Kedaluwarsa", className: "bg-paper-2 text-ink-soft" },
  canceled: { label: "Dibatalkan", className: "bg-paper-2 text-ink-soft" },
};

export function ServiceStatusBadge({
  status,
  className,
}: {
  status: ServiceOrderStatus;
  className?: string;
}) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;

  return (
    <Badge
      variant="outline"
      className={cn("border-ink/30 font-semibold", meta.className, className)}
    >
      {meta.label}
    </Badge>
  );
}

export function serviceStatusLabel(status: ServiceOrderStatus): string {
  return STATUS_META[status]?.label ?? status;
}
