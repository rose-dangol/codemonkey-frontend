import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { InventoryService } from "@/services/OrderManagement/inventoryManagement.service";
import type { InventoryDashboardSummary } from "@/TypeDefinitions/InventoryManagement";

interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  sub?: string;
  accent?: string;
}

function KPICard({ label, value, icon, iconColor, iconBg, sub, accent }: KPICardProps) {
  return (
    <div className="bg-[#1C1C26] border border-[#2a2a3a] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#3a3a4a] transition-colors duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[#6E6A7C] text-xs font-semibold uppercase tracking-widest">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-2xl font-bold tabular-nums leading-none ${accent ?? "text-[#F0EEE9]"}`}>
          {value}
        </span>
      </div>
      {sub && <p className="text-xs text-[#6E6A7C]">{sub}</p>}
    </div>
  );
}

export default function InventoryKPICards() {
  const { data, isLoading } = useQuery<InventoryDashboardSummary>({
    queryKey: ["inventory-summary"],
    queryFn: InventoryService.getDashboardSummary,
  });

  const cards: KPICardProps[] = [
    {
      label: "Total Products",
      value: isLoading ? "—" : (data?.totalProducts ?? 0),
      icon: <Package size={16} />,
      iconColor: "text-[#09948F]",
      iconBg: "bg-[#09948F]/10",
      sub: "Distinct products in system",
    },
    {
      label: "Total Variants",
      value: isLoading ? "—" : (data?.totalVariants ?? 0),
      icon: <Layers size={16} />,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      sub: "SKUs being tracked",
    },
    {
      label: "Available Stock",
      value: isLoading ? "—" : (data?.totalAvailableStock ?? 0),
      icon: <CheckCircle2 size={16} />,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      sub: "Ready to fulfill",
      accent: "text-emerald-400",
    },
    {
      label: "Damaged Stock",
      value: isLoading ? "—" : (data?.totalDamagedStock ?? 0),
      icon: <AlertTriangle size={16} />,
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10",
      sub: "Requires write-off or repair",
      accent: "text-red-400",
    },
    {
      label: "Reserved Stock",
      value: isLoading ? "—" : (data?.totalReservedStock ?? 0),
      icon: <Clock size={16} />,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      sub: "Held for pending orders",
      accent: "text-amber-400",
    },
    {
      label: "Low Stock Variants",
      value: isLoading ? "—" : (data?.lowStockVariants ?? 0),
      icon: <TrendingDown size={16} />,
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/10",
      sub: "Available ≤ 5 units",
      accent: "text-orange-400",
    },
    {
      label: "Out of Stock",
      value: isLoading ? "—" : (data?.outOfStockVariants ?? 0),
      icon: <XCircle size={16} />,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      sub: "Zero total stock",
      accent: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
