import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  ArrowLeftRight,
  PackagePlus,
  SlidersHorizontal,
  History,
} from "lucide-react";
import type { InventoryItem } from "@/TypeDefinitions/InventoryManagement";

interface InventoryActionMenuProps {
  variant: InventoryItem;
  onRestock: (variant: InventoryItem) => void;
  onTransfer: (variant: InventoryItem) => void;
  onAdjust: (variant: InventoryItem) => void;
}

export default function InventoryActionMenu({
  variant,
  onRestock,
  onTransfer,
  onAdjust,
}: InventoryActionMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[#6E6A7C] hover:text-white hover:bg-[#2a2a3a]"
        >
          <MoreHorizontal size={16} />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#1C1C26] border border-[#2a2a3a] text-[#B8B8CC] rounded-xl min-w-[180px] p-1"
      >
        <DropdownMenuLabel className="text-[#6E6A7C] text-xs font-medium px-2 py-1.5">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2a2a3a]" />

        <DropdownMenuItem
          onClick={() => navigate(`/inventory/variant/${variant.id}`)}
          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#2a2a3a] hover:text-white"
        >
          <Eye size={14} className="text-[#09948F]" />
          View Details
        </DropdownMenuItem>

        {/* Transfer Stock */}
        <DropdownMenuItem
          onClick={() => onTransfer(variant)}
          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#2a2a3a] hover:text-white"
        >
          <ArrowLeftRight size={14} className="text-blue-400" />
          Transfer Stock
        </DropdownMenuItem>

        {/* RESTOCK */}
        <DropdownMenuItem
          onClick={() => onRestock(variant)}
          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#2a2a3a] hover:text-white"
        >
          <PackagePlus size={14} className="text-emerald-400" />
          Restock
        </DropdownMenuItem>

        {/* ADJUST ONE PARTICULAR */}
        <DropdownMenuItem
          onClick={() => onAdjust(variant)}
          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#2a2a3a] hover:text-white"
        >
          <SlidersHorizontal size={14} className="text-amber-400" />
          Adjust Stock
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#2a2a3a]" />

        {/* VIEW HISTORY */}
        <DropdownMenuItem
          onClick={() =>
            navigate(`/inventory/transactions?variantId=${variant.id}`)
          }
          className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#2a2a3a] hover:text-white"
        >
          <History size={14} className="text-purple-400" />
          View History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
