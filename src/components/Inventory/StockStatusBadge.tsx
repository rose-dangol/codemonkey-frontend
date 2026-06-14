interface StockStatusBadgeProps {
  code: string;
  name?: string;
}

const PALETTE: Record<string, { bg: string; text: string; border: string }> = {
  AVAILABLE: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  DAMAGED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  RESERVED: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  MISPLACED: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  RETURNED: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
};

const DEFAULT = {
  bg: "bg-slate-500/10",
  text: "text-slate-400",
  border: "border-slate-500/20",
};

export default function StockStatusBadge({ code, name }: StockStatusBadgeProps) {
  const c = PALETTE[code.toUpperCase()] ?? DEFAULT;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      {name ?? code}
    </span>
  );
}
