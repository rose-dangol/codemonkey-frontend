import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { CategoryService } from "@/services/OrderManagement/Category";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategoryType } from "@/TypeDefinitions/Category";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  updateCategoryFields,
  type UpdateCategoryDto,
} from "@/TypeDefinitions/ModalType";
import { Loader2, SquarePen } from "lucide-react";

// Define columns dynamically for category data

const Category = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<UpdateCategoryDto | null>(null);

  const queryClient = useQueryClient();

  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: () => CategoryService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateCategoryDto) =>
      CategoryService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      // toast.success("Category updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: UpdateCategoryDto) => CategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      // toast.success("Category updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string[]) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const handleUpdate = (updatedData: Partial<UpdateCategoryDto>) => {
    if (!selectedCategory) return;
    mutation.mutate({
      ...updatedData,
      id: selectedCategory.id,
    });
  };

  const handleDelete = async (id: string[]) => {
    deleteMutation.mutate(id);
  };

  const handleAdd = (data: Partial<UpdateCategoryDto>) => {
    addMutation.mutate(data as UpdateCategoryDto);
  };
  const [categoryData, setCategoryData] = useState<CategoryType[]>([]);
  const categoryColumns: ColumnDef<any, any>[] = [
    {
      accessorKey: "categoryImage",
      header: "Category Image",
      cell: ({ row }) => {
        const imageUrl = row.original.categoryImage;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt={row.original.categoryImage}
            className="h-20 w-20 rounded-lg object-cover border border-[#18181b]"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-[#18181b] flex items-center justify-center text-[#8A8A8A] text-xs">
            N/A
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: "Category Name",
    },
    {
      accessorKey: "categoryDesc",
      header: "Category Description",
    },
    {
      accessorKey: "categoryParentId",
      header: "Category Parent",
      cell: ({ row }) => {
        const parent = categoryData.find(
          (c) => c.id === row.original.categoryParentId,
        );

        return parent ? parent.categoryName : "None";
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedCategory(row.original);
            setOpen(true);
          }}
        >
          <SquarePen size={20} />
        </div>
      ),
    },

    // Add more columns as needed
  ];

  const flatAllNodes = (
    data: CategoryType[],
    level = 0,
    result: (CategoryType & { level: number })[] = [],
  ) => {
    for (const item of data) {
      result.push({ ...item, level });

      if (item.subCategories?.length) {
        flatAllNodes(item.subCategories, level + 1, result);
      }
    }

    return result;
  };

  useEffect(() => {
    payments && setCategoryData(flatAllNodes(payments));
  }, [payments]);

  const isLoading =
    mutation.isPending || addMutation.isPending || deleteMutation.isPending;

  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      )}
      <h1 className="heading-font">Category</h1>

      <DemoPage
        data={categoryData}
        columns={categoryColumns}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title="Category"
      />
      <UpdateModal<UpdateCategoryDto>
        open={open}
        setOpen={setOpen}
        title="Update Category"
        description="Update category details"
        fields={updateCategoryFields(categoryData, selectedCategory?.id)}
        initialData={selectedCategory ?? {}} // prefill form
        allItems={categoryData}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />
      <UpdateModal<UpdateCategoryDto>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Category"
        description="Add new category"
        fields={updateCategoryFields(categoryData)}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};

export default Category;
