import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { CategoryService } from "@/services/OrderManagement/Category";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  updateProductFields,
  type UpdateProductDto,
} from "@/TypeDefinitions/ModalType";
import { Loader2, SquarePen } from "lucide-react";
import { BrandService } from "@/services/OrderManagement/BrandService";
import type { ProductType } from "@/TypeDefinitions/Product";
import { ProductService } from "@/services/OrderManagement/ProductService";
import { TagService } from "@/services/Tags/TagService";

const Product = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null,
  );

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });

  const { data: tagData } = useQuery({
    queryKey: ["tags"],
    queryFn: () => TagService.getAll(),
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => BrandService.getAll(),
  });

  const { data: productCategory } = useQuery({
    queryKey: ["product-category"],
    queryFn: () => CategoryService.getAll(),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateProductDto) =>
      ProductService.update(data.id ?? "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Category updated successfully");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: UpdateProductDto) =>
      ProductService.create({
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // toast.success("Category updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string[]) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
    if (!selectedProduct) return;
    mutation.mutate({
      ...updatedData,
      id: selectedProduct.id,
    } as UpdateProductDto);
  };

  const handleDelete = async (id: string[]) => {
    deleteMutation.mutate(id);
  };

  const handleAdd = (data: Partial<UpdateProductDto>) => {
    addMutation.mutate(data as UpdateProductDto);
  };

  const productColumns: ColumnDef<ProductType>[] = [
    {
      accessorKey: "productImage",
      header: "Product Image",
      cell: ({ row }) => {
        const imageUrl = row.original.productImage;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt={row.original.productImage}
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
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags;

        if (!tags || tags.length === 0) {
          return <span className="text-gray-400 dark:text-gray-600">—</span>;
        }

        return (
          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
            {tags.map((tagObj, index) => {
              const tagName = tagObj?.tag?.name;
              if (!tagName) return null;

              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-slate-700/40 transition-colors"
                >
                  {tagName}
                </span>
              );
            })}
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
            setSelectedProduct(row.original);
            setOpen(true);
          }}
        >
          <SquarePen size={20} />
        </div>
      ),
    },
  ];

  // useEffect(() => {
  //   products && setProductData(products);
  // }, [products]);

  const isLoading =
    mutation.isPending || addMutation.isPending || deleteMutation.isPending;

  return (
    <div>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      )}
      <div className="flex gap-4 items-center">
        <h1 className="heading-font">Products</h1>
      </div>

      <>
        <DemoPage
          data={products}
          columns={productColumns}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          openAdd={openAdd}
          setOpenAdd={setOpenAdd}
          title={"Product"}
        />

        <UpdateModal<UpdateProductDto>
          open={open}
          setOpen={setOpen}
          title="Update Product"
          description="Update Product details"
          fields={updateProductFields(
            brands,
            productCategory,
            tagData,

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
          fields={updateProductFields(brands, productCategory, tagData)}
          onUpdate={(updatedData) => {
            handleAdd(updatedData);
            setOpenAdd(false);
          }}
        />
      </>
    </div>
  );
};

export default Product;
