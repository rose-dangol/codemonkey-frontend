import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import { updateAttributeDefinitionFields } from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";

import { AttributeService } from "@/services/OrderManagement/AttributeService";
import type { AttributeDefinitionType } from "@/TypeDefinitions/AttributeDefinitions";
import { toast } from "react-toastify";
import { CogsService } from "@/services/OrderManagement/CogsService";
import type { CogsDefinitionType } from "@/TypeDefinitions/CogsDefinitions";

const CogsDefinitions = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedCogs, setSelectedCogs] = useState<CogsDefinitionType | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: attributeData } = useQuery({
    queryKey: ["attributes"],
    queryFn: () =>
      AttributeService.getAll("3a014030-1f20-47b9-8848-04c4f8c0be54"),
  });

  const { data: cogsData } = useQuery({
    queryKey: ["cogs"],
    queryFn: () => CogsService.getAll(),
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
    mutationFn: (data: CogsDefinitionType) =>
      CogsService.create({
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cogs"] });
      toast.success("Cogs created successfully");
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
    if (!selectedCogs) return;
    mutation.mutate({
      ...updatedData,
      id: selectedCogs.id,
    } as AttributeDefinitionType);
  };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await AttributeService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["attributes"] });
  };

  const handleAdd = (data: Partial<CogsDefinitionType>) => {
    addMutation.mutate(data as CogsDefinitionType);
  };

  const cogsColumns: ColumnDef<CogsDefinitionType>[] = [
    {
      accessorKey: "key",
      header: "Cogs Key",
    },
    {
      accessorKey: "name",
      header: "Cogs Name",
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedCogs(row.original);
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
      <h1 className="heading-font">Cogs Definitions</h1>

      <DemoPage
        data={cogsData}
        columns={cogsColumns}
        // onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Cogs Definition"}
      />
      {/* <UpdateModal<AttributeDefinitionType>
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
      /> */}

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

export default CogsDefinitions;
