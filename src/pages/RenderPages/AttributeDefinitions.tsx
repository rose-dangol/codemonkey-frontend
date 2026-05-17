import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  updateAttributeDefinitionFields,
} from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";

import { AttributeService } from "@/services/OrderManagement/AttributeService";
import type { AttributeDefinitionType } from "@/TypeDefinitions/AttributeDefinitions";
import { toast } from "react-toastify";

const AttributeDefinitions = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedAttribute, setSelectedAttribute] =
    useState<AttributeDefinitionType | null>(null);

  const queryClient = useQueryClient();

  const { data: attributeData } = useQuery({
    queryKey: ["attributes"],
    queryFn: () =>
      AttributeService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: AttributeDefinitionType) =>
      AttributeService.update(data.id ?? "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      toast.success("Attribute updated successfully");
    },
    onError: () => {
      toast.error("Failed to update attribute");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: AttributeDefinitionType) =>
      AttributeService.create({
        ...data,
        type: "text",
       
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      toast.success("Attribute created successfully");
    },
    onError: () => {
      toast.error("Failed to create attribute");
    },
  });

  //   const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
  //     if (!selectedProduct) return;
  //     mutation.mutate({
  //       ...updatedData,
  //       id: selectedProduct.id,
  //     } as UpdateProductDto);
  //   };

  const handleUpdate = (updatedData: Partial<AttributeDefinitionType>) => {
    if (!selectedAttribute) return;
    mutation.mutate({
      ...updatedData,
      id: selectedAttribute.id,
    } as AttributeDefinitionType);
  };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await AttributeService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["attributes"] });
  };

  const handleAdd = (data: Partial<AttributeDefinitionType>) => {
    addMutation.mutate(data as AttributeDefinitionType);
  };

  const productColumns: ColumnDef<AttributeDefinitionType>[] = [
    {
      accessorKey: "key",
      header: "Attribute Key",
    },
    {
      accessorKey: "name",
      header: "Attribute Name",
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedAttribute(row.original);
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
      <h1 className="heading-font">Attribute Definitions</h1>

      <DemoPage
        data={attributeData}
        columns={productColumns}
        // onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Attribute Definitions"}
      />
      <UpdateModal<AttributeDefinitionType>
        open={open}
        setOpen={setOpen}
        title="Update Attribute Definitions"
        description="Update Attribute Definitions details"
        fields={updateAttributeDefinitionFields(selectedAttribute?.id)}
        initialData={selectedAttribute ?? undefined}
        // allItems={productCategory}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />

      <UpdateModal<AttributeDefinitionType>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Attribute Definitions"
        description="Add new Attribute Definitions"
        fields={updateAttributeDefinitionFields()}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};

export default AttributeDefinitions;
