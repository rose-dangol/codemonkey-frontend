import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import { updateTagFields } from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";
import { toast } from "react-toastify";
import type { TagType } from "@/TypeDefinitions/Tag";
import { TagService } from "@/services/Tags/TagService";

const Tags = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);

  const queryClient = useQueryClient();

  const { data: TagData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => TagService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: TagType) => TagService.update(data.id ?? "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag updated successfully");
    },
    onError: () => {
      toast.error("Failed to update tag");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: TagType) =>
      TagService.create({
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created successfully");
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });

  //   const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
  //     if (!selectedProduct) return;
  //     mutation.mutate({
  //       ...updatedData,
  //       id: selectedProduct.id,
  //     } as UpdateProductDto);
  //   };

  const handleUpdate = (updatedData: Partial<TagType>) => {
    if (!selectedTag) return;
    mutation.mutate({
      ...updatedData,
      id: selectedTag.id,
    } as TagType);
  };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await TagService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  };

  const handleAdd = (data: Partial<TagType>) => {
    addMutation.mutate(data as TagType);
  };

  const TagColumns: ColumnDef<TagType>[] = [
    {
      accessorKey: "name",
      header: "Tag Name",
    },
    {
      accessorKey: "slug",
      header: "Tag Slug",
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedTag(row.original);
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
      <h1 className="heading-font">Tags</h1>

      <DemoPage
        data={TagData}
        columns={TagColumns}
        // onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Tags"}
      />
      <UpdateModal<TagType>
        open={open}
        setOpen={setOpen}
        title="Update Tag"
        description="Update Tag details"
        fields={updateTagFields(selectedTag?.id)}
        initialData={selectedTag ?? undefined}
        // allItems={productCategory}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />

      <UpdateModal<TagType>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Tag"
        description="Add new Tag"
        fields={updateTagFields()}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};


export default Tags;
