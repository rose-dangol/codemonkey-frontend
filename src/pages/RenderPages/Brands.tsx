import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { CategoryService } from "@/services/OrderManagement/Category";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@/TypeDefinitions/Category";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  updateBrandFields,
  updateCategoryFields,
  type UpdateBrandDto,
  type UpdateCategoryDto,
} from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";
import type { Brands } from "@/TypeDefinitions/Brands";
import { BrandService } from "@/services/OrderManagement/BrandService";

// Define columns dynamically for category data

const Brands = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<UpdateBrandDto | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: () => BrandService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateBrandDto) => BrandService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      // toast.success("Category updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: UpdateBrandDto) => CategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      // toast.success("Category updated successfully");
    },
  });

  const handleUpdate = (updatedData: Partial<UpdateBrandDto>) => {
    if (!selectedBrand) return;
    mutation.mutate({
      ...updatedData,
      id: selectedBrand.id,
    });
  };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await CategoryService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const handleAdd = (data: Partial<UpdateBrandDto>) => {
    addMutation.mutate(data as UpdateBrandDto);
  };
  const [brandData, setBrandData] = useState<Brands[]>([]);

  const brandColumns: ColumnDef<any, any>[] = [
    {
      accessorKey: "brandImage",
      header: "Brand Image",
    },
    {
      accessorKey: "brandName",
      header: "Brand Name",
    },
    {
      accessorKey: "brandDesc",
      header: "Brand Description",
    },
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }) => {
        const products = row.original.products || [];

        return (
          <div className="flex flex-wrap gap-1">
            {products.slice(0, 3).map((p: any, i: number) => (
              <span
                key={i}
                className="px-2 py-1 text-xs bg-gray-100 border rounded-md"
              >
                {p.name}
              </span>
            ))}

            {products.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-200 rounded-md">
                +{products.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedBrand(row.original);
            setOpen(true);
          }}
        >
          <SquarePen size={20} />
        </div>
      ),
    },

    // Add more columns as needed
  ];

  useEffect(() => {
    payments && setBrandData(payments);
  }, [payments]);

  return (
    <div>
      <h1 className="heading-font">Brands</h1>

      <DemoPage
        data={brandData}
        columns={brandColumns}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
      />
      <UpdateModal
        open={open}
        setOpen={setOpen}
        title="Update Brand"
        description="Update Brand details"
        fields={updateBrandFields(brandData, selectedBrand?.id)}
        initialData={selectedBrand ?? {}} // prefill form
        allItems={brandData}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />
      <UpdateModal
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Brand"
        description="Add new Brand"
        fields={updateBrandFields(brandData)}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};

export default Brands;
