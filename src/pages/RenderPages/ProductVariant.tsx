import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import { updateProductVariantFields } from "@/TypeDefinitions/ModalType";
import { SquarePen } from "lucide-react";
import { ProductService } from "@/services/OrderManagement/ProductService";
import { AttributeService } from "@/services/OrderManagement/AttributeService";
import { ProductVariantService } from "@/services/OrderManagement/ProductVariantService";
import type { ProductVariantType } from "@/TypeDefinitions/ProductVariant";
import { toast } from "react-toastify";
import { CogsService } from "@/services/OrderManagement/CogsService";

const ProductVariant = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductVariantType | null>(null);
  const queryClient = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });

  const { data: productVariant } = useQuery({
    queryKey: ["productVariant"],
    queryFn: () => ProductVariantService.getAll(),
  });

  const { data: attributeData } = useQuery({
    queryKey: ["attributes"],
    queryFn: () => AttributeService.getAll(),
  });
  const { data: cogsData } = useQuery({
    queryKey: ["cogs"],
    queryFn: () => CogsService.getAll(),
  });

  // Derive unique attribute definitions from fetched attributes for DynamicTabs
  const attributeDefinitions = useMemo(() => {
    if (!attributeData) return [];
    const seen = new Map<string, string>();
    for (const attr of attributeData) {
      if (!seen.has(attr.key)) {
        seen.set(attr.key, attr.attributeDefinitionId ?? attr.id);
      }
    }
    return Array.from(seen.entries()).map(([key, id]) => ({
      id,
      serviceTypeId: id,
      key,
      name: key,
      type: "string",
    }));
  }, [attributeData]);

  const mutation = useMutation({
    mutationFn: (data: ProductVariantType) =>
      ProductVariantService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productVariant"] });
      toast.success("Product Variant updated successfully");
    },
    onError: () => {
      toast.error("Failed to update Product Variant");
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: ProductVariantType) =>
      ProductVariantService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productVariant"] });
      toast.success("Product Variant created successfully");
    },
    onError: (error) => {
      console.error("Failed to create Product Variant", error);
      toast.error("Failed to create Product Variant");
    },
  });

  const handleUpdate = (updatedData: Partial<ProductVariantType>) => {
    if (!selectedProduct) return;

    const normalizedData = {
      ...updatedData,
      price:
        updatedData.price !== undefined
          ? Number(updatedData.price)
          : updatedData.price,
    };

    mutation.mutate({
      ...normalizedData,
      id: selectedProduct.id,
    } as ProductVariantType);
  };

  const handleDelete = async (id: string[]) => {
    await ProductVariantService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["productVariant"] });
  };

  const handleAdd = (data: Partial<ProductVariantType>) => {
    const formattedData = {
      ...data,
      cogsData: Array.isArray(data.cogsData)
        ? data.cogsData.reduce(
            (acc, item) => {
              acc[item.attributeId] = item.value;
              return acc;
            },
            {} as Record<string, string>,
          )
        : data.cogsData,
    } as ProductVariantType;

    console.log("formattedData", formattedData);

    addMutation.mutate(formattedData);
  };

  const productVariantColumns: ColumnDef<ProductVariantType>[] = [
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
      accessorKey: "cogsData",
      header: "Cogs Data",
      cell: ({ row }) => {
        const cogsData = row.original.cogsData;
        if (!cogsData) return <div>null</div>;
        return (
          <div>
            {Object.entries(cogsData).map(([key, value]) => (
              <div key={key}>{value}</div>
            ))}
          </div>
        );
      },
    },

    {
      accessorKey: "attributes",

      header: () => <div className="text-center">Attributes</div>,

      cell: ({ row }) => {
        const attributes = row.original.attributes;

        if (!attributes?.length) {
          return <div className="text-center">—</div>;
        }

        return (
          <div className="flex flex-wrap gap-2">
            {attributes.map((attr) => {
              return (
                <div
                  key={attr.id}
                  className="
                flex items-center gap-2
                rounded-full
                border
                action

                px-3 py-1
              "
                >
                  <span className="capitalize sub-text">{attr?.key}:</span>

                  <span className="description-text">{attr.value}</span>
                </div>
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

  const mapVariantToForm = (variant: any) => {
    return {
      ...variant,
      attributes:
        variant.attributes?.map((attr: any) => ({
          attributeId: attr.attributeId,
          value: attr.value,
        })) ?? [],
    };
  };

  return (
    <div>
      <h1 className="heading-font">Product Variants</h1>

      <DemoPage
        data={productVariant}
        columns={productVariantColumns}
        // onUpdate={handleUpdate}
        onDelete={handleDelete}
        openAdd={openAdd}
        setOpenAdd={setOpenAdd}
        title={"Product Variant"}
      />
      <UpdateModal<ProductVariantType>
        open={open}
        setOpen={setOpen}
        title="Update Product Variant"
        description="Update Product Variant details"
        fields={updateProductVariantFields(
          products,
          attributeData,
          cogsData,
          attributeDefinitions,
        )}
        initialData={selectedProduct ? mapVariantToForm(selectedProduct) : {}}
        allItems={productVariant}
        onUpdate={(updatedData) => {
          handleUpdate(updatedData);
          setOpen(false);
        }}
      />
      <UpdateModal<ProductVariantType>
        open={openAdd}
        setOpen={setOpenAdd}
        title="Add Product Variant"
        description="Add new Product Variant"
        fields={updateProductVariantFields(
          products,
          attributeData,
          cogsData,
          attributeDefinitions,
        )}
        onUpdate={(updatedData) => {
          handleAdd(updatedData);
          setOpenAdd(false);
        }}
      />
    </div>
  );
};

export default ProductVariant;
