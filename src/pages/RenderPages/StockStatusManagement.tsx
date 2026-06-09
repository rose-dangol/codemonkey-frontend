import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { Tags, Plus, Pencil, PowerOff } from "lucide-react";

import { DataTable } from "@/payments/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import type { StockStatusType } from "@/TypeDefinitions/InventoryManagement";
import { stockStatusService } from "@/services/InventoryManagement/stockStatus.service";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  stockStatusFields,
  updateStockStatusFields,
} from "@/TypeDefinitions/ModalType";

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  status: StockStatusType | null;
}

function DeleteModal({ open, onClose, status }: DeleteModalProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => stockStatusService.deleteStockStatus(status!.id),
    onSuccess: () => {
      toast.success(`"${status?.name}" Deleted`);
      queryClient.invalidateQueries({ queryKey: ["stock-statuses"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to Delete");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#1C1C26] border border-[#2a2a3a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            Delete Stock Status
          </DialogTitle>
        </DialogHeader>
        <div className="py-3 space-y-2">
          <p className="text-sm text-[#B8B8CC]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">"{status?.name}"</span>?
          </p>
          <p className="text-xs text-[#6E6A7C]">
            Deleted statuses will not appear in new transfers or restocks.
            Existing historical records remain intact.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2a2a3a] bg-transparent text-[#B8B8CC] hover:bg-[#13131A] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => mutate()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StockStatusManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [editTarget, setEditTarget] = useState<StockStatusType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockStatusType | null>(
    null,
  );
  const queryClient = useQueryClient();

  const { data: statuses = [], isLoading } = useQuery<StockStatusType[]>({
    queryKey: ["stock-statuses"],
    queryFn: stockStatusService.getAll,
  });

  const addMutation = useMutation({
    mutationFn: (data) => stockStatusService.createStockStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-statuses"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: (data) => stockStatusService.updateStockStatus(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-statuses"] });
    },
  });

  const handleAdd = (data) => {
    addMutation.mutate(data);
  };
  const handleUpdate = (updatedData: Partial<StockStatusType>) => {
    if (!editTarget) return;
    updateMutation.mutate(updatedData);
  };

  const columns: ColumnDef<StockStatusType>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-semibold text-[#F0EEE9]">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-[#13131A] border border-[#2a2a3a] text-[#B8B8CC] px-2 py-0.5 rounded">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-[#B8B8CC]">
          {row.original.description ?? (
            <span className="italic text-[#6E6A7C]">No description</span>
          )}
        </span>
      ),
    },
    {
      id: "status",
      header: "Active Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Disabled
          </span>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => {
              setEditTarget(row.original);
              setOpenModal(true);
            }}
            className="p-1.5 rounded-lg text-[#6E6A7C] hover:text-[#B8B8CC] hover:bg-[#2a2a3a] transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          {row.original.isActive && (
            <button
              onClick={() => setDeleteTarget(row.original)}
              className="p-1.5 rounded-lg text-[#6E6A7C] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <PowerOff size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen px-2 py-8 text-black">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#09948F]/10 border border-[#09948F]/20 flex items-center justify-center">
            <Tags size={18} className="text-[#09948F]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Stock Status Management
            </h1>
            <p className="text-sm text-[#6E6A7C]">
              Manage inventory categories. Disabled statuses are excluded from
              new operations.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#09948F] hover:bg-[#07807b] text-white font-semibold gap-1.5 shrink-0"
        >
          <Plus size={15} />
          Create Status
        </Button>
      </div>

      {/* Rules banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-6 text-xs text-amber-300 flex items-center gap-2">
        <Tags size={13} />
        <span>
          Status <strong>codes are unique and immutable</strong>. Disabling a
          status preserves all historical transaction records.
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-[#6E6A7C]">
          Loading statuses…
        </div>
      ) : (
        <DataTable
          id={statuses.map((s) => s.id)}
          fields={columns}
          data={statuses}
          enableRowSelection={false}
          searchPlaceholder="Search statuses…"
        />
      )}

      {/* Modals */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        status={deleteTarget}
      />
      <UpdateModal
        open={showCreate}
        setOpen={setShowCreate}
        title="Add Stock Status"
        description="sth"
        fields={stockStatusFields()}
        onUpdate={(data) => {
          handleAdd(data);
          setShowCreate(false);
        }}
      />
      <UpdateModal
        open={openModal}
        setOpen={setOpenModal}
        title="Update Stock Status"
        description="Update Stock Status"
        fields={updateStockStatusFields()}
        initialData={editTarget ?? {}}
        allItems={statuses}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpenModal(false);
        }}
      />
    </div>
  );
}
