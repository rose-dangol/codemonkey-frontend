type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

interface StockBadgeProps {
  status?: StockStatus;
  availableQty?: number;
  totalQty?: number;
  lowStockThreshold?: number;
}

export function computeStockStatus(
  availableQty: number,
  totalQty: number,
  lowStockThreshold = 5,
): StockStatus {
  if (totalQty === 0) return "OUT_OF_STOCK";
  if (availableQty <= lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

const CONFIG: Record<
  StockStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  IN_STOCK: {
    label: "In Stock",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  LOW_STOCK: {
    label: "Low Stock",
    dot: "bg-amber-400",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    dot: "bg-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
};

export default function StockBadge({
  status,
  availableQty,
  totalQty,
  lowStockThreshold = 5,
}: StockBadgeProps) {
  const computedStatus =
    status ??
    computeStockStatus(availableQty ?? 0, totalQty ?? 0, lowStockThreshold);

  const c = CONFIG[computedStatus];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
