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
import { stockStatusService } from "@/services/InventoryManagement/stockStatus.service";

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  variant: InventoryItem;
}

export default function AdjustStockModal({
  open,
  onClose,
  variant,
}: AdjustStockModalProps) {
  const queryClient = useQueryClient();
  const [statusId, setStatusId] = useState("");
  const [targetQty, setTargetQty] = useState<number | "">("");
  const [note, setNote] = useState("");

  const { data: statuses = [] } = useQuery<StockStatusType[]>({
    queryKey: ["stock-statuses"],
    queryFn: stockStatusService.getAll,
    enabled: open,
  });

  const activeStatuses = statuses.filter((s) => s.isActive);

  const status = statuses.find((s) => s.id === statusId);
  const statusCode = status?.code;

  const currentQty = statusCode ? (variant.stockByCode?.[statusCode] ?? 0) : 0;
  const target = Number(targetQty);
  const delta = target - currentQty;

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      InventoryService.adjust({
        variantId: variant.id,
        stockStatusTypeId: statusId,
        targetQuantity: target,
        note: note || undefined,
      }),
    onSuccess: () => {
      toast.success("Stock adjusted successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Adjustment failed");
    },
  });

  const handleClose = () => {
    setStatusId("");
    setTargetQty("");
    setNote("");
    onClose();
  };

  const isValid = statusId && targetQty !== "" && target >= 0 && delta !== 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-[#1C1C26] border border-[#2a2a3a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Adjust Stock
          </DialogTitle>
          <p className="text-sm text-[#6E6A7C] mt-1">
            {variant.product.productName} — {variant.sku}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status bucket selector */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">
              Stock Status Bucket
            </Label>
            <select
              value={statusId}
              onChange={(e) => {
                setStatusId(e.target.value);
                setTargetQty("");
              }}
              className="w-full rounded-lg bg-[#13131A] border border-[#2a2a3a] text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#09948F]"
            >
              <option value="">Select status…</option>
              {activeStatuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Current qty info */}
          {statusId && (
            <div className="flex items-center gap-3 bg-[#13131A] rounded-lg px-4 py-3 border border-[#2a2a3a]">
              <div className="text-center flex-1">
                <p className="text-xs text-[#6E6A7C] mb-0.5">Current</p>
                <p className="text-lg font-bold text-[#F0EEE9]">{currentQty}</p>
              </div>
              <div className="h-8 w-px bg-[#2a2a3a]" />
              <div className="text-center flex-1">
                <p className="text-xs text-[#6E6A7C] mb-0.5">Delta</p>
                <p
                  className={`text-lg font-bold ${
                    targetQty === ""
                      ? "text-[#6E6A7C]"
                      : delta > 0
                        ? "text-emerald-400"
                        : delta < 0
                          ? "text-red-400"
                          : "text-[#6E6A7C]"
                  }`}
                >
                  {targetQty !== "" ? (delta > 0 ? `+${delta}` : delta) : "—"}
                </p>
              </div>
              <div className="h-8 w-px bg-[#2a2a3a]" />

              <div className="text-center flex-1">
                <p className="text-xs text-[#6E6A7C] mb-0.5">Target</p>
                <p className="text-lg font-bold text-[#F0EEE9]">
                  {targetQty !== "" ? target : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Target quantity */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">Target Quantity</Label>
            <Input
              type="number"
              min={0}
              placeholder="Enter new total…"
              value={targetQty}
              onChange={(e) =>
                setTargetQty(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="bg-[#13131A] border-[#2a2a3a] text-white placeholder:text-[#6E6A7C] focus-visible:ring-[#09948F]"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">
              Note{" "}
              <span className="text-[#6E6A7C] font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Reason for adjustment…"
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
            {isPending ? "Adjusting…" : "Apply Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
