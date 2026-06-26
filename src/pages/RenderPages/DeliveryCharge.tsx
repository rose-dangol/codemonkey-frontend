import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import { updateDeliveryFields } from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";

import { toast } from "react-toastify";
import { DeliveryService } from "@/services/OrderManagement/DeliveryCharge";
import type { DeliveryCharge as DeliveryChargeType } from "@/TypeDefinitions/DeliveryDefinitons";

const DeliveryCharge = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryChargeType | null>(null);

  const queryClient = useQueryClient();

  const { data: deliveryData } = useQuery({
    queryKey: ["delivery-charge"],
    queryFn: () => DeliveryService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: DeliveryChargeType) => DeliveryService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-charge"] });
      toast.success("Delivery Charge updated successfully");
    },
    onError: () => {
      toast.error("Failed to update attribute");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: DeliveryChargeType) =>
      DeliveryService.create({
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-charge"] });
      toast.success("Delivery Charge created successfully");
    },
    onError: () => {
      toast.error("Failed to create Delivery Charge");
    },
  });

  const handleUpdate = (updatedData: Partial<DeliveryChargeType>) => {
    if (!selectedDelivery) return;
    mutation.mutate({
      ...updatedData,
      id: selectedDelivery.id,
    } as DeliveryChargeType);
  };

  const handleDelete = async (id: string[]) => {
    try {
      await DeliveryService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["delivery-charge"] });
      toast.success("Delivery Charge deleted successfully");
    } catch (error) {
      toast.error("Failed to delete Delivery Charge");
    }
  };

  const handleAdd = (data: Partial<DeliveryChargeType>) => {
    addMutation.mutate(data as DeliveryChargeType);
  };

  const deliveryChargeColumns: ColumnDef<DeliveryChargeType>[] = [
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "charge",
      header: "Charge",
    },

    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <input type="checkbox" checked={row.original.isActive} disabled />
        </div>
      ),
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedDelivery(row.original);
            setOpen(true);
          }}
        >
          <SquarePen size={20} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="heading-font">Delivery Charge</h1>

      <DemoPage
        data={deliveryData}
        columns={deliveryChargeColumns}
        // onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Delivery Charge"}
      />
      <UpdateModal<DeliveryChargeType>
        open={open}
        setOpen={setOpen}
        title="Update Attribute Definitions"
        description="Update Attribute Definitions details"
        fields={updateDeliveryFields(selectedDelivery?.id)}
        initialData={selectedDelivery ?? undefined}
        allItems={deliveryData}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />

      <UpdateModal<DeliveryChargeType>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Attribute Definitions"
        description="Add new Attribute Definitions"
        fields={updateDeliveryFields()}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};

export default DeliveryCharge;
