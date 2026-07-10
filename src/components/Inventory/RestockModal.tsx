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
import type { StockStatusType } from "@/TypeDefinitions/InventoryManagement";
import { stockStatusService } from "@/services/InventoryManagement/stockStatus.service";
import { useAuth } from "@/contexts/AuthContext";

interface RestockModalProps {
  open: boolean;
  onClose: () => void;
  variantId: string;
  variantName: string;
}

export default function RestockModal({
  open,
  onClose,
  variantId,
  variantName,
}: RestockModalProps) {
  const queryClient = useQueryClient();
  const [toStatusId, setToStatusId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [note, setNote] = useState("");
  const { outletId } = useAuth();

  const { data: statuses = [] } = useQuery<StockStatusType[]>({
    queryKey: ["stock-statuses"],
    queryFn: stockStatusService.getAll,
    enabled: open,
  });

  const activeStatuses = statuses.filter((s) => s.isActive);
 

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      InventoryService.restock({
        variantId,
        toStockStatusTypeId: toStatusId,
        quantity: Number(quantity),
        note: note || undefined,
        outletId: outletId!,
      }),
    onSuccess: () => {
      toast.success("Stock restocked successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to restock");
    },
  });

  const handleClose = () => {
    setToStatusId("");
    setQuantity("");
    setNote("");
    onClose();
  };

  const isValid = toStatusId && Number(quantity) > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-[#1C1C26] border border-[#2a2a3a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Restock Inventory
          </DialogTitle>
          <p className="text-sm text-[#6E6A7C] mt-1">{variantName}</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Destination Status */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">Destination Status</Label>
            <select
              value={toStatusId}
              onChange={(e) => setToStatusId(e.target.value)}
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

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label className="text-[#B8B8CC] text-sm">Quantity</Label>
            <Input
              type="number"
              min={1}
              placeholder="Enter quantity…"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
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
            {isPending ? "Restocking…" : "Restock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
