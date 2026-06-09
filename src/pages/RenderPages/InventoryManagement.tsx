import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Package } from "lucide-react";

import { InventoryService } from "@/services/OrderManagement/inventoryManagement.service";
import type {
  InventoryItem,
  StockStatusType,
} from "@/TypeDefinitions/InventoryManagement";
import InventoryActionMenu from "@/components/Inventory/InventoryActionMenu";
import RestockModal from "@/components/Inventory/RestockModal";
import TransferModal from "@/components/Inventory/TransferModal";
import AdjustStockModal from "@/components/Inventory/AdjustStockModal";
import DemoPage from "@/payments/page";
import { UpdateModal } from "@/Layout/UpdateModal";
import { addInventoryRecordField } from "@/TypeDefinitions/ModalType";
import { ProductService } from "@/services/OrderManagement/ProductService";
import { ProductVariantService } from "@/services/OrderManagement/ProductVariantService";
import { stockStatusService } from "@/services/InventoryManagement/stockStatus.service";
import { statusColorMap } from "@/TypeDefinitions/common";

type ModalType = "restock" | "transfer" | "adjust" | null;

export default function InventoryManagement() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedVariant, setSelectedVariant] = useState<InventoryItem | null>(
    null,
  );
  const [openAddModal, setOpenAddModal] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });
  const { data: productVariant } = useQuery({
    queryKey: ["productVariant"],
    queryFn: () => ProductVariantService.getAll(),
  });
  const { data: stockStatuses = [] } = useQuery({
    queryKey: ["stock-statuses"],
    queryFn: () => stockStatusService.getAll(),
  });

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => InventoryService.getInventoryList(),
  });

  const items: InventoryItem[] = useMemo(() => {
    const raw = inventoryData?.data ?? inventoryData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [inventoryData]);

  const openModal = (type: ModalType, variant: InventoryItem) => {
    setSelectedVariant(variant);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedVariant(null);
  };

  const stockColumns = stockStatuses.map((status: StockStatusType) => ({
    id: status.code,
    header: status.name,

    cell: ({ row }: { row: Row<InventoryItem> }) => {
      const qty = row.original.stockByCode?.[status.code] ?? 0;

      return (
        <span className={statusColorMap[status.code] ?? "text-gray-300"}>
          {qty}
        </span>
      );
    },
  }));

  const columns: ColumnDef<InventoryItem>[] = [
    {
      id: "image",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.product.productImage ? (
          <img
            src={row.original.product.productImage}
            alt={row.original.product.productName}
            className="w-9 h-9 object-cover rounded-lg border border-[#2a2a3a]"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-[#2a2a3a] flex items-center justify-center">
            <Package size={16} className="text-[#6E6A7C]" />
          </div>
        ),
    },
    {
      accessorKey: "product.productName",
      header: "Product Name",
      cell: ({ row }) => (
        <span className="font-medium text-[#F0EEE9]">
          {row.original.product.productName}
        </span>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-[#B8B8CC] bg-[#13131A] px-2 py-0.5 rounded">
          {row.original.sku}
        </span>
      ),
    },
    ...stockColumns,
    {
      id: "totalStock",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.totalStock}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.inventoryStatus;

        const map: Record<string, string> = {
          IN_STOCK: "text-green-400 bg-green-500/10",
          LOW_STOCK: "text-yellow-400 bg-yellow-500/10",
          OUT_OF_STOCK: "text-red-400 bg-red-500/10",
        };

        return (
          <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <InventoryActionMenu
          variant={row.original}
          onRestock={(v) => openModal("restock", v)}
          onTransfer={(v) => openModal("transfer", v)}
          onAdjust={(v) => openModal("adjust", v)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen px-2 py-8 text-black">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Inventory Overview
        </h1>
        <p className="text-sm text-[#6E6A7C] mt-1">
          Track stock across all status buckets for every product variant.
        </p>
      </div>

      {/* KPI Summary */}
      {/* <InventoryKPICards /> */}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-[#6E6A7C]">
          Loading inventory…
        </div>
      ) : (
        <DemoPage
          data={items}
          columns={columns}
          title="Inventory Item"
          openAdd={openAddModal}
          setOpenAdd={setOpenAddModal}
        />
      )}

      {/* Modals */}
      {selectedVariant && (
        <>
          <TransferModal
            open={activeModal === "transfer"}
            onClose={closeModal}
            variant={selectedVariant}
          />
          <RestockModal
            open={activeModal === "restock"}
            onClose={closeModal}
            variantId={selectedVariant.id}
            variantName={`${selectedVariant.product.productName} — ${selectedVariant.sku}`}
          />
          <AdjustStockModal
            open={activeModal === "adjust"}
            onClose={closeModal}
            variant={selectedVariant}
          />
        </>
      )}

      {/* todo: not really needed for now? */}
      <UpdateModal<InventoryItem>
        open={openAddModal}
        setOpen={setOpenAddModal}
        title="Add a stock data"
        fields={addInventoryRecordField(
          products,
          productVariant,
          stockStatuses,
        )}
        onUpdate={(data) => {
          handleAdd(data);
          setOpenAddModal(false);
        }}
      />
    </div>
  );
}
