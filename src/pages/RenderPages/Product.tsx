import type { ColumnDef } from "@tanstack/react-table";
import DemoPage from "@/payments/page";
import { CategoryService } from "@/services/OrderManagement/Category";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "@/App.css";
import { UpdateModal } from "@/Layout/UpdateModal";
import {
  updateProductFields,
  type UpdateProductDto,
  type VariantPayload,
} from "@/TypeDefinitions/ModalType";
import { Eye, Loader2, SquarePen } from "lucide-react";
import { BrandService } from "@/services/OrderManagement/BrandService";
import type { ProductType } from "@/TypeDefinitions/Product";
import { ProductService } from "@/services/OrderManagement/ProductService";
import { ProductVariantService } from "@/services/OrderManagement/ProductVariantService";
import { AttributeService } from "@/services/OrderManagement/AttributeService";
import { CogsService } from "@/services/OrderManagement/CogsService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import type { ProductVariantType } from "@/TypeDefinitions/ProductVariant";

// ─── blank variant factory ─────────────────────────────────────────────────────
const blankVariant = (): VariantPayload => ({
  sku: "",
  price: "",
  stock: "",
  attributes: [],
  cogsData: {},
});

const Product = () => {
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null,
  );

  // ── Variant state (owned here, passed down to UpdateModal) ────────────────
  const [isVariantMode, setIsVariantMode] = useState(false);
  const [variants, setVariants] = useState<VariantPayload[]>([blankVariant()]);

  const addVariant = () => setVariants((prev) => [...prev, blankVariant()]);

  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const updateVariantField = (
    index: number,
    field: keyof VariantPayload,
    value: any,
  ) =>
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

  // Reset variant state whenever the Add modal opens/closes
  const handleSetOpenAdd = (val: boolean) => {
    if (!val) {
      setIsVariantMode(false);
      setVariants([blankVariant()]);
    }
    setOpenAdd(val);
  };

  // ── Queries ───────────────────────────────────────────────────────────────
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => BrandService.getAll(),
  });

  const { data: productCategory } = useQuery({
    queryKey: ["product-category"],
    queryFn: () => CategoryService.getAll(),
  });

  const { data: attributeData } = useQuery({
    queryKey: ["attributes"],
    queryFn: () => AttributeService.getAll(),
  });

  const { data: cogsData } = useQuery({
    queryKey: ["cogs"],
    queryFn: () => CogsService.getAll(),
  });

  // ── Derived definitions (mirrors ProductVariant.tsx) ─────────────────────
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
      name: key,
    }));
  }, [attributeData]);

  const cogsDefinitions = useMemo(() => {
    if (!cogsData) return [];
    return cogsData.map((c: any) => ({
      id: c.id,
      name: c.name,
      key: c.key,
    }));
  }, [cogsData]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data: UpdateProductDto) =>
      ProductService.update(data.id ?? "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addMutationVariant = useMutation({
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

  const addMutation = useMutation({
    mutationFn: (data: UpdateProductDto) => ProductService.create({ ...data }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });

      const productId = data?.id ?? data?.data?.id;
      if (!productId) {
        console.error("Product created but no ID was found in response", data);
        return;
      }

      const cogsPayload = Array.isArray(variables.cogs)
        ? variables.cogs
            .filter((item: any) => item.attributeId && item.value !== "")
            .map((item: any) => ({
              attributeId: item.attributeId,
              value: Number(item.value),
            }))
        : [];

      const variantData: any = {
        sku: (variables.productName || "variant")
          .toLowerCase()
          .replace(/\s+/g, "-"),
        price: Number(variables.price || 0),
        stock: Number(variables.quantity || 0),
        cogsData: cogsPayload as any,
        attributes: [],
        productId: productId,
      };

      addMutationVariant.mutate(variantData as ProductVariantType);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string[]) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdate = (updatedData: Partial<UpdateProductDto>) => {
    if (!selectedProduct) return;
    mutation.mutate({
      ...updatedData,
      id: selectedProduct.id,
    } as UpdateProductDto);
  };

  const handleOpenEdit = (product: ProductType) => {
    setSelectedProduct(product);
    const hasVariants =
      !!(product as any).multiVariantFlag ||
      (product.variants && product.variants.length > 0);
    setIsVariantMode(hasVariants);

    if (product.variants && product.variants.length > 0) {
      const mapped = product.variants.map((v) => {
        const attributes =
          v.attributes?.map((attr: any) => ({
            attributeId: attr.attributeId ?? attr.attribute?.id ?? attr.id,
            value: attr.value,
          })) ?? [];

        const cogsObj: Record<string, any> = {};
        if (Array.isArray(v.cogsData)) {
          v.cogsData.forEach((entry: any) => {
            const key = entry.attributeId || entry.key || entry.id;
            if (key) {
              cogsObj[key] = entry.value;
            }
          });
        } else if (v.cogsData && typeof v.cogsData === "object") {
          Object.assign(cogsObj, v.cogsData);
        }

        return {
          id: v.id,
          sku: v.sku ?? "",
          price: v.price ?? "",
          attributes,
          cogsData: cogsObj,
        };
      });
      setVariants(mapped);
    } else {
      setVariants([blankVariant()]);
    }
    setOpen(true);
  };

  const handleSetOpenEdit = (val: boolean) => {
    if (!val) {
      setIsVariantMode(false);
      setVariants([blankVariant()]);
      setSelectedProduct(null);
    }
    setOpen(val);
  };

  const handleDelete = async (id: string[]) => {
    deleteMutation.mutate(id);
  };

  const handleAdd = (data: Partial<UpdateProductDto>) => {
    console.log("data", data);

    addMutation.mutate(data as UpdateProductDto);
  };

  /**
   * Variant creation flow:
   * 1. Create the product → get its ID.
   * 2. Create each variant with that product ID in parallel.
   */
  const handleAddWithVariants = async (
    productData: Partial<UpdateProductDto>,
    variantList: VariantPayload[],
  ) => {
    try {
      const created = await ProductService.create(
        productData as UpdateProductDto,
      );
      const productId: string | undefined = created?.id ?? created?.data?.id;

      if (!productId) {
        toast.error(
          "Product was created but no ID was returned. Cannot create variants.",
        );
        queryClient.invalidateQueries({ queryKey: ["products"] });
        return;
      }

      await Promise.all(
        variantList.map((v) => {
          // cogsData comes in as Record<key, value> — pass through as-is
          const cogsPayload =
            typeof v.cogsData === "object" && !Array.isArray(v.cogsData)
              ? v.cogsData
              : {};

          return ProductVariantService.create({
            productId,
            sku: v.sku,
            price: Number(v.price),
            stock: Number(v.stock),
            // attributes arrive as AttributePayloadItem[] from DynamicVariantTabs
            attributes: Array.isArray(v.attributes) ? v.attributes : [],
            cogsData: cogsPayload,
          } as any);
        }),
      );

      toast.success("Product and variants created successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productVariant"] });
    } catch (err) {
      console.error("Failed to create product with variants", err);
      toast.error("Failed to create product with variants.");
    }
  };

  const handleUpdateWithVariants = async (
    productData: Partial<UpdateProductDto>,
    variantList: VariantPayload[],
  ) => {
    if (!selectedProduct) return;
    try {
      const productId = selectedProduct.id;

      // 1. Update product details
      await ProductService.update(productId, productData as UpdateProductDto);

      // 2. Determine deleted variants
      const originalVariantIds =
        selectedProduct.variants?.map((v) => v.id) ?? [];
      const editedVariantIds = variantList
        .map((v) => v.id)
        .filter(Boolean) as string[];
      const deletedVariantIds = originalVariantIds.filter(
        (id) => !editedVariantIds.includes(id),
      );

      if (deletedVariantIds.length > 0) {
        await ProductVariantService.delete(deletedVariantIds);
      }

      // 3. Create or update variants in parallel
      await Promise.all(
        variantList.map((v) => {
          const cogsPayload =
            typeof v.cogsData === "object" && !Array.isArray(v.cogsData)
              ? v.cogsData
              : {};

          const payload = {
            productId,
            sku: v.sku,
            price: Number(v.price),
            stock: Number(v.stock),
            attributes: Array.isArray(v.attributes) ? v.attributes : [],
            cogsData: cogsPayload,
          } as any;

          if (v.id) {
            return ProductVariantService.update(v.id, { ...payload, id: v.id });
          } else {
            return ProductVariantService.create(payload);
          }
        }),
      );

      toast.success("Product and variants updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productVariant"] });
    } catch (err) {
      console.error("Failed to update product with variants", err);
      toast.error("Failed to update product with variants.");
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
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
      cell: ({ row }) => row.original.productCategory?.categoryName || "—",
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => row.original.brand?.brandName || "—",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div
          className="flex justify-center items-center rounded-lg p-2 w-max cursor-pointer transition-all hover:bg-gray-100 hover:scale-110 action-hover"
          onClick={() => {
            handleOpenEdit(row.original);
          }}
        >
          <SquarePen size={20} />
          <Link
            to={`/product/view/${row.original.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={20} />
          </Link>
        </div>
      ),
    },
  ];

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
          setOpenAdd={handleSetOpenAdd}
          title={"Product"}
        />

        {/* ── Update Product ── */}
        <UpdateModal<UpdateProductDto>
          open={open}
          setOpen={handleSetOpenEdit}
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
            handleSetOpenEdit(false);
          }}
          onUpdateWithVariants={(productData, variantList) => {
            handleUpdateWithVariants(productData, variantList);
            handleSetOpenEdit(false);
          }}
          // ── Controlled variant props ──────────────────────────────────────
          variantMode={isVariantMode}
          onVariantModeChange={setIsVariantMode}
          variants={variants}
          onAddVariant={addVariant}
          onRemoveVariant={removeVariant}
          onUpdateVariantField={updateVariantField}
          attributeDefinitions={attributeDefinitions}
          cogsDefinitions={cogsDefinitions}
        />

        {/* ── Add Product (with optional variant flow) ── */}
        <UpdateModal<UpdateProductDto>
          open={openAdd}
          setOpen={handleSetOpenAdd}
          title="Add Product"
          description="Add new Product"
          fields={updateProductFields(
            brands,
            productCategory,
            undefined,
            cogsDefinitions,
          )}
          onUpdate={(updatedData) => {
            handleAdd(updatedData);
            handleSetOpenAdd(false);
          }}
          onAddWithVariants={(productData, variantList) => {
            handleAddWithVariants(productData, variantList);
            handleSetOpenAdd(false);
          }}
          // ── Controlled variant props ──────────────────────────────────────
          variantMode={isVariantMode}
          onVariantModeChange={setIsVariantMode}
          variants={variants}
          onAddVariant={addVariant}
          onRemoveVariant={removeVariant}
          onUpdateVariantField={updateVariantField}
          attributeDefinitions={attributeDefinitions}
          cogsDefinitions={cogsDefinitions}
        />
      </>
    </div>
  );
};

export default Product;
