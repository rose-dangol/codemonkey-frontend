import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { CategoryService } from "@/services/OrderManagement/Category";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  updateProductFields,
  type UpdateProductDto,
} from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";
import type { Product } from "@/TypeDefinitions/Product";
import { ProductService } from "@/services/OrderManagement/ProductService";
import { AttributeService } from "@/services/OrderManagement/AttributeService";
import { ProductVaraiantService } from "@/services/OrderManagement/ProductVaraiantService";

const ProductVariant = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const queryClient = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });

  const { data: productVariant } = useQuery({
    queryKey: ["productVariant"],
    queryFn: () => ProductVaraiantService.getAll(),
  });

  const { data: attributeData } = useQuery({
    queryKey: ["attributes"],
    queryFn: () =>
      AttributeService.getAll("3a014030-1f20-47b9-8848-04c4f8c0be54"),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateProductDto) =>
      ProductService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Category updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: UpdateProductDto) =>
      ProductService.create({
        ...data,
        serviceId: "3a014030-1f20-47b9-8848-04c4f8c0be54",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Category updated successfully");
    },
  });

  //   const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
  //     if (!selectedProduct) return;
  //     mutation.mutate({
  //       ...updatedData,
  //       id: selectedProduct.id,
  //     } as UpdateProductDto);
  //   };

  //   const handleDelete = async (id: string[]) => {
  //     console.log("selectedId:", id);
  //     await CategoryService.delete(id);
  //     queryClient.invalidateQueries({ queryKey: ["products"] });
  //   };

  //   const handleAdd = (data: Partial<UpdateProductDto>) => {
  //     addMutation.mutate(data as UpdateProductDto);
  //   };

  const productVariantColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: "Sku",
    },
    {
      accessorKey: "price",
      header: "Variant Price",
    },

    {
      accessorKey: "stock",
      header: "Stock Quantity",
    },

    {
      accessorKey: "attributes",
      header: "Attributes",
      cell: ({ row }) => {
        return (
          row.original.variants
            ?.flatMap((v) => Object.values(v.attributes ?? {}))
            .join(", ") || "—"
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
      <h1 className="heading-font">Products</h1>

      <DemoPage
        data={productVariant}
        columns={productVariantColumns}
        // onUpdate={handleUpdate}
        // onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Product Variant"}
      />
      {/* <UpdateModal<UpdateProductDto>
        open={open}
        setOpen={setOpen}
        title="Update Product"
        description="Update Product details"
        fields={updateProductFields(
          brands,
          productCategory,
          selectedProduct?.id,
        )}
        initialData={
          selectedProduct
            ? {
                ...selectedProduct,
                productCategoryId: selectedProduct.productCategory?.id || "",
                productBrandId: selectedProduct.brand?.id || "",
              }
            : {}
        }
        allItems={productCategory}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />
      <UpdateModal<UpdateProductDto>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Product"
        description="Add new Product"
        fields={updateProductFields(brands, productCategory)}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      /> */}
    </div>
  );
};

export default ProductVariant;
