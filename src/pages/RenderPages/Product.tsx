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
  updateProductFields,
  type UpdateBrandDto,
  type UpdateCategoryDto,
} from "@/TypeDefinitions/ModalType";
import { CloudCog, SquarePen } from "lucide-react";
import type { Brands } from "@/TypeDefinitions/Brands";
import { BrandService } from "@/services/OrderManagement/BrandService";
import type { Product } from "@/TypeDefinitions/Product";
import { ProductService } from "@/services/OrderManagement/ProductService";

const Product = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<UpdateBrandDto | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateBrandDto) => BrandService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Category updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: UpdateBrandDto) => BrandService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Category updated successfully");
    },
  });

  const handleUpdate = (updatedData: Partial<UpdateBrandDto>) => {
    if (!selectedProduct) return;
    console.log("called");
    mutation.mutate({
      ...updatedData,
      id: selectedProduct.id,
    });
  };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await CategoryService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleAdd = (data: Partial<UpdateBrandDto>) => {
    addMutation.mutate(data as UpdateBrandDto);
  };
  const [productData, setProductData] = useState<Product[]>([]);

  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "productImage",
      header: "Product Image",
    },
    {
      accessorKey: "productName",
      header: "Product Name",
    },

    {
      accessorKey: "quantity",
      header: "Quantity",
    },

    {
      accessorKey: "productCategory",
      header: "Category",
      cell: ({ row }) => {
        return row.original.productCategory?.categoryName || "—";
      },
    },

    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => {
        return row.original.brand?.brandName || "—";
      },
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            setSelectedProduct(row.original);
            setOpen(true);
          }}
        >
          <SquarePen size={20} />
        </div>
      ),
    },
  ];

  useEffect(() => {
    products && setProductData(products);
  }, [products]);

  return (
    <div>
      <h1 className="heading-font">Products</h1>

      <DemoPage
        data={productData}
        columns={productColumns}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Brand"}
      />
      <UpdateModal
        open={open}
        setOpen={setOpen}
        title="Update Brand"
        description="Update Brand details"
        fields={updateProductFields(productData, selectedProduct?.id)}
        initialData={selectedProduct ?? {}} // prefill form
        allItems={productData}
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
        fields={updateProductFields(productData)}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};

export default Product;
