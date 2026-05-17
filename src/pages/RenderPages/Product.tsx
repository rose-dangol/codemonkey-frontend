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
import { BrandService } from "@/services/OrderManagement/BrandService";
import type { Product } from "@/TypeDefinitions/Product";
import { ProductService } from "@/services/OrderManagement/ProductService";

const Product = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });

  const { data: brands } = useQuery({
    queryKey: ["payments"],
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

  const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
    if (!selectedProduct) return;
    mutation.mutate({
      ...updatedData,
      id: selectedProduct.id,
    } as UpdateProductDto);
  };

  const handleDelete = async (id: string[]) => {
    console.log("selectedId:", id);
    await CategoryService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleAdd = (data: Partial<UpdateProductDto>) => {
    addMutation.mutate(data as UpdateProductDto);
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
      />
    </div>
  );
};

export default Product;
