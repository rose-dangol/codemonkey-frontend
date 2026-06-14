import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryService } from "@/services/OrderManagement/inventoryManagement.service";
import type {
  InventoryItem,
  StockStatusType,
} from "@/TypeDefinitions/InventoryManagement";
import { ArrowRight } from "lucide-react";
import { stockStatusService } from "@/services/InventoryManagement/stockStatus.service";

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  variant: InventoryItem;
}

export default function TransferModal({
  open,
  onClose,
  variant,
}: TransferModalProps) {
  const queryClient = useQueryClient();
  const [fromStatusId, setFromStatusId] = useState("");
  const [toStatusId, setToStatusId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [note, setNote] = useState("");

  const { data: statuses = [] } = useQuery<StockStatusType[]>({
    queryKey: ["stock-statuses"],
    queryFn: stockStatusService.getAll,
    enabled: open,
  });

  const activeStatuses = statuses.filter((s) => s.isActive);

  const fromStatus = statuses.find((s) => s.id === fromStatusId);
  const fromCode = fromStatus?.code;

  const availableInSource = fromCode
    ? (variant.stockByCode?.[fromCode] ?? 0)
    : 0;
  const qty = Number(quantity);
  const isOverTransfer = qty > availableInSource;

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      if (!isValid) throw new Error("Invalid transfer data");

      return InventoryService.transfer({
        variantId: variant.id,
        fromStockStatusTypeId: fromStatusId,
        toStockStatusTypeId: toStatusId,
        quantity: qty,
        note: note || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Stock transferred successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Transfer failed");
    },
  });

  const handleClose = () => {
    setFromStatusId("");
    setToStatusId("");
    setQuantity("");
    setNote("");
    onClose();
  };

  const isValid =
    !!variant?.id &&
    !!fromStatusId &&
    !!toStatusId &&
    fromStatusId !== toStatusId &&
    qty > 0 &&
    qty <= availableInSource;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-[#1C1C26] border border-[#2a2a3a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Transfer Stock
          </DialogTitle>
          <p className="text-sm text-[#6E6A7C] mt-1">
            {variant.product.productName} — {variant.sku}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* From / To row */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[#B8B8CC] text-sm">From Status</Label>
              <select
                value={fromStatusId}
                onChange={(e) => setFromStatusId(e.target.value)}
                className="w-full rounded-lg bg-[#13131A] border border-[#2a2a3a] text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#09948F]"
              >
                <option value="">Select…</option>
                {activeStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight className="mb-2 text-[#6E6A7C] shrink-0" size={18} />
            <div className="flex-1 space-y-1.5">
              <Label className="text-[#B8B8CC] text-sm">To Status</Label>
              <select
                value={toStatusId}
                onChange={(e) => setToStatusId(e.target.value)}
                className="w-full rounded-lg bg-[#13131A] border border-[#2a2a3a] text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#09948F]"
              >
                <option value="">Select…</option>
                {activeStatuses
                  .filter((s) => s.id !== fromStatusId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Source available */}
          {fromStatusId && (
            <p className="text-xs text-[#6E6A7C]">
              Available in source:{" "}
              <span className="text-[#B8B8CC] font-semibold">
                {availableInSource}
              </span>
            </p>
          )}

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">Quantity</Label>
            <Input
              type="number"
              min={1}
              max={availableInSource || undefined}
              placeholder="Enter quantity…"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="bg-[#13131A] border-[#2a2a3a] text-white placeholder:text-[#6E6A7C] focus-visible:ring-[#09948F]"
            />
            {isOverTransfer && (
              <p className="text-xs text-red-400">
                Quantity exceeds available stock ({availableInSource})
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">
              Note{" "}
              <span className="text-[#6E6A7C] font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Add a note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-[#13131A] border-[#2a2a3a] text-white placeholder:text-[#6E6A7C] focus-visible:ring-[#09948F]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-[#2a2a3a] bg-transparent text-[#B8B8CC] hover:bg-[#13131A] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            disabled={!isValid || isPending}
            onClick={() => mutate()}
            className="bg-[#09948F] hover:bg-[#07807b] text-white font-semibold"
          >
            {isPending ? "Transferring…" : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
