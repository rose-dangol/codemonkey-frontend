import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Package,
  PackagePlus,
  ArrowLeftRight,
  SlidersHorizontal,
} from "lucide-react";

import { DataTable } from "@/payments/data-table";
import { Button } from "@/components/ui/button";
import { InventoryService } from "@/services/OrderManagement/inventoryManagement.service";
import type {
  InventoryVariantDetail,
  VariantStockBucket,
} from "@/TypeDefinitions/InventoryManagement";
import StockStatusBadge from "@/components/Inventory/StockStatusBadge";
import RestockModal from "@/components/Inventory/RestockModal";
import TransferModal from "@/components/Inventory/TransferModal";
import AdjustStockModal from "@/components/Inventory/AdjustStockModal";

type ModalType = "restock" | "transfer" | "adjust" | null;

function SummaryCard({
  label,
  value,
  code,
}: {
  label: string;
  value: number;
  code: string;
}) {
  const colors: Record<string, { bg: string; value: string; border: string }> =
    {
      AVAILABLE: {
        bg: "bg-emerald-500/10",
        value: "text-emerald-400",
        border: "border-emerald-500/20",
      },
      RESERVED: {
        bg: "bg-blue-500/10",
        value: "text-blue-400",
        border: "border-blue-500/20",
      },
      DAMAGED: {
        bg: "bg-red-500/10",
        value: "text-red-400",
        border: "border-red-500/20",
      },
      MISPLACED: {
        bg: "bg-orange-500/10",
        value: "text-orange-400",
        border: "border-orange-500/20",
      },
    };
  const c = colors[code.toUpperCase()] ?? {
    bg: "bg-slate-500/10",
    value: "text-slate-400",
    border: "border-slate-500/20",
  };

  return (
    <div
      className={`rounded-2xl border ${c.border} ${c.bg} px-5 py-4 flex flex-col gap-1`}
    >
      <span className="text-xs text-[#6E6A7C] font-semibold uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-3xl font-extrabold tabular-nums ${c.value}`}>
        {value}
      </span>
    </div>
  );
}

export default function InventoryVariantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { data, isLoading } = useQuery<InventoryVariantDetail>({
    queryKey: ["inventory-variant", id],
    queryFn: () => InventoryService.getVariantDetail(id!),
    enabled: !!id,
  });
  const variant = data?.variant;

  {
    /* todo: is transaction needed here?  */
  }
  // const transactions = data?.transactions;

  const bucketColumns: ColumnDef<VariantStockBucket>[] = [
    {
      id: "stockType",
      header: "Stock Type",
      cell: ({ row }) => (
        <StockStatusBadge
          code={row.original.stockStatusType.code}
          name={row.original.stockStatusType.name}
        />
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="font-bold tabular-nums text-[#F0EEE9]">
          {row.original.quantity}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#6E6A7C]">
        Loading variant…
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#6E6A7C]">
        <Package size={32} className="opacity-40" />
        <p>Variant not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/inventory/overview")}
          className="border-[#2a2a3a] text-[#B8B8CC]"
        >
          Back to Overview
        </Button>
      </div>
    );
  }

  const knownCodes = ["AVAILABLE", "RESERVED", "DAMAGED", "MISPLACED"];
  const stocks = variant.stock ?? [];
  const qtyFor = (code: string) =>
    stocks.find((b) => b.stockStatusType?.code === code)?.quantity ?? 0;
  return (
    <div className="">
      {/* Back */}
      <button
        onClick={() => navigate("/inventory/overview")}
        className="flex items-center gap-1.5 text-sm text-[#6E6A7C] hover:text-[#B8B8CC] transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Inventory
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {variant.product?.productImage ? (
            <img
              src={variant.product.productImage}
              alt={variant.product.productName}
              className="w-16 h-16 object-cover rounded-2xl border border-[#2a2a3a]"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#1C1C26] border border-[#2a2a3a] flex items-center justify-center">
              <Package size={24} className="text-[#6E6A7C]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">
              {variant?.product?.productName ?? "-"}
            </h1>
            <span className="font-mono text-sm text-[#6E6A7C] bg-[#1C1C26] border border-[#2a2a3a] px-2 py-0.5 rounded mt-1 inline-block">
              {variant.sku}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setActiveModal("restock")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <PackagePlus size={14} /> Add Stock
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveModal("transfer")}
            className="bg-[#09948F] hover:bg-[#07807b] text-white gap-1.5"
          >
            <ArrowLeftRight size={14} /> Transfer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveModal("adjust")}
            className="border-[#2a2a3a] text-[#B8B8CC] hover:bg-[#1C1C26] hover:text-white gap-1.5"
          >
            <SlidersHorizontal size={14} /> Adjust
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <div className="rounded-2xl border border-[#2a2a3a] bg-[#1C1C26] px-5 py-4 flex flex-col gap-1">
          <span className="text-xs text-[#6E6A7C] font-semibold uppercase tracking-wide">
            Total Stock
          </span>
          <span className="text-3xl font-extrabold tabular-nums text-[#F0EEE9]">
            {variant.totalStock}
          </span>
        </div>
        {knownCodes.map((code) => (
          <SummaryCard
            key={code}
            label={code.charAt(0) + code.slice(1).toLowerCase()}
            value={qtyFor(code)}
            code={code}
          />
        ))}
      </div>

      {/* Stock Breakdown Table */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-4">Stock Breakdown</h2>
        {/* <DemoPage data={variant} columns={bucketColumns} /> */}
        <DataTable
          id={stocks.map((b) => b.id)}
          fields={bucketColumns}
          data={stocks}
          enableRowSelection={false}
          enableColumnVisibility={false}
        />
      </div>

      {/* Modals */}
      <RestockModal
        open={activeModal === "restock"}
        onClose={() => setActiveModal(null)}
        variantId={variant.id}
        variantName={`${variant.product?.productName ?? "—"} — ${variant.sku}`}
      />
      <TransferModal
        open={activeModal === "transfer"}
        onClose={() => setActiveModal(null)}
        variant={variant}
      />
      <AdjustStockModal
        open={activeModal === "adjust"}
        onClose={() => setActiveModal(null)}
        variant={variant}
      />
    </div>
  );
}
