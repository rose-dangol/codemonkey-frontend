import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { History } from "lucide-react";
import { InventoryService } from "@/services/OrderManagement/inventoryManagement.service";
import type { InventoryTransaction } from "@/TypeDefinitions/InventoryManagement";
import StockStatusBadge from "@/components/Inventory/StockStatusBadge";
import { DataTable } from "@/payments/data-table";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

export default function InventoryTransactionHistory() {
  const [searchParams] = useSearchParams();
  const variantId = searchParams.get("variantId");

  const { data: txData, isLoading } = useQuery({
    queryKey: [
      "inventory-transactions",
      variantId,
      // typeFilter,
    ],
    queryFn: () =>
      InventoryService.getTransactions({
        variantId: variantId || undefined,
        // transactionType: typeFilter || undefined,
      }),
  });

  const transactions: InventoryTransaction[] = useMemo(() => {
    const raw = txData?.data ?? txData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [txData]);

  {
    /*
  const clearFilters = () => {
    setSearch("");
    setSkuFilter("");
    setFromDate("");
    setToDate("");
    setTypeFilter("");
  };

  const hasFilters = search || skuFilter || fromDate || toDate || typeFilter;
  */
  }

  const columns: ColumnDef<InventoryTransaction>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <span className="font-medium text-[#F0EEE9]">
          {row.original.variant?.product?.productName ?? "—"}
        </span>
      ),
    },
    {
      id: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-[#13131A] border border-[#2a2a3a] px-2 py-0.5 rounded text-[#B8B8CC]">
          {row.original.variant?.sku ?? "—"}
        </span>
      ),
    },
    {
      id: "fromStatus",
      header: "From Status",
      cell: ({ row }) =>
        row.original.fromStockStatusType ? (
          <StockStatusBadge
            code={row.original.fromStockStatusType.code}
            name={row.original.fromStockStatusType.name}
          />
        ) : (
          <span className="text-[#6E6A7C] text-xs italic">
            —{" "}
            {row.original.toStockStatusType.name != "available"
              ? ""
              : "New Stock"}
          </span>
        ),
    },
    {
      id: "toStatus",
      header: "To Status",
      cell: ({ row }) => (
        <StockStatusBadge
          code={row.original?.toStockStatusType.code ?? ""}
          name={row.original?.toStockStatusType.name ?? ""}
        />
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const qty = row.original.quantity;

        return (
          <span
            className={cn(
              "font-bold tabular-nums",
              qty > 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {qty > 0 ? `+${qty}` : qty}
          </span>
        );
      },
    },
    {
      accessorKey: "referenceType",
      header: "Ref Type",
      cell: ({ row }) => {
        const type = row.original.referenceType;

        const label =
          type === "adjust"
            ? "Adjustment"
            : type === "restock"
              ? "Restock"
              : type === "transfer"
                ? "Transfer"
                : type;

        return (
          <span className="text-xs text-[#B8B8CC] bg-[#1C1C26] border border-[#2a2a3a] px-2 py-0.5 rounded">
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "referenceId",
      header: "Ref ID",
      cell: ({ row }) => {
        const id = row.original.referenceId;

        if (!id) {
          return <span className="text-[#6E6A7C]">—</span>;
        }

        return (
          <span className="font-mono text-xs text-[#6E6A7C]">
            {id.length > 12 ? `${id.slice(0, 8)}…` : id}
          </span>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <span className="text-sm text-[#B8B8CC] max-w-40 truncate block">
          {row.original.note ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => (
        <span className="text-sm text-[#B8B8CC]">
          {row.original.createdBy ?? "System"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen px-2 py-8 text-ffffff">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <History size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold  tracking-tight">
            Transaction History
          </h1>
          <p className="text-sm text-[#6E6A7C]">
            Complete read-only audit trail of all inventory movements.
          </p>
        </div>
      </div>

      {/* todo: refactor this*/}

      {/* Filter bar */}
      {/* <div className="bg-[#1C1C26] border border-[#2a2a3a] rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-[#6E6A7C]" />
          <span className="text-sm font-semibold text-[#B8B8CC]">Filters</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-[#6E6A7C] hover:text-red-400 transition-colors"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-[#6E6A7C] text-xs">Product Name</Label>
            <Input
              placeholder="Search product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#13131A] border-[#2a2a3a] text-white text-sm placeholder:text-[#6E6A7C] focus-visible:ring-[#09948F] h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[#6E6A7C] text-xs">SKU</Label>
            <Input
              placeholder="Filter by SKU…"
              value={skuFilter}
              onChange={(e) => setSkuFilter(e.target.value)}
              className="bg-[#13131A] border-[#2a2a3a] text-white text-sm placeholder:text-[#6E6A7C] focus-visible:ring-[#09948F] h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[#6E6A7C] text-xs">Transaction Type</Label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 rounded-lg bg-[#13131A] border border-[#2a2a3a] text-white text-sm px-3 focus:outline-none focus:ring-1 focus:ring-[#09948F]"
            >
              <option value="">All types</option>
              <option value="RESTOCK">Restock</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ADJUST">Adjust</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-[#6E6A7C] text-xs">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-[#13131A] border-[#2a2a3a] text-white text-sm focus-visible:ring-[#09948F] h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[#6E6A7C] text-xs">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-[#13131A] border-[#2a2a3a] text-white text-sm focus-visible:ring-[#09948F] h-9"
            />
          </div>
        </div>
      </div> */}

      {/* Info banner — read-only */}
      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 mb-4 text-xs text-blue-300">
        <History size={13} />
        <span>
          Transaction records are <strong>read-only</strong>. Editing or
          deleting transactions is not permitted.
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-[#6E6A7C]">
          Loading transactions…
        </div>
      ) : (
        <DataTable
          id={transactions.map((t) => t.id)}
          fields={columns}
          data={transactions}
          enableRowSelection={false}
          searchPlaceholder="Search transactions…"
        />
      )}
    </div>
  );
}
