import { MultiSelectField } from "@/components/MultiSelectField";
import { UpdateModal } from "@/Layout/UpdateModal";

import { AttributeService } from "@/services/OrderManagement/AttributeService";
import { CogsService } from "@/services/OrderManagement/CogsService";
import { ProductService } from "@/services/OrderManagement/ProductService";
import { ProductVariantService } from "@/services/OrderManagement/ProductVariantService";
import { TagService } from "@/services/Tags/TagService";
import {
  updateProductVariantFields,
  type UpdateProductDto,
} from "@/TypeDefinitions/ModalType";
import type { ProductType } from "@/TypeDefinitions/Product";
import type {
  CreateProductVariantType,
  ProductVariantType,
} from "@/TypeDefinitions/ProductVariant";
import type { TagType } from "@/TypeDefinitions/Tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ─── Icons ────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ImageIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

function formatCurrency(val: string | number): string {
  const n = Number(val);
  return isNaN(n)
    ? String(val)
    : `$${n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
}

function normaliseCogsData(
  cogsData: unknown,
): Record<string, { value: string; name: string }> {
  if (!cogsData) return {};

  if (Array.isArray(cogsData)) {
    return Object.fromEntries(
      cogsData.map(
        (entry: { attributeId: string; value: string; name: string }) => [
          entry.attributeId,
          {
            value: entry.value,
            name: entry.name,
          },
        ],
      ),
    );
  }

  return {};
}

function totalCogs(cogsData: unknown): number {
  const normalised = normaliseCogsData(cogsData);

  return Object.values(normalised).reduce(
    (sum, item) => sum + Number(item.value),
    0,
  );
}

function VariantRow({
  variant,
  onEdit,
  onDelete,
}: {
  variant: ProductVariantType;
  onEdit?: (id: string) => void;
  onDelete?: (id: string[]) => void;
}) {
  const cogs = normaliseCogsData(variant.cogsData);

  const cogsEntries = Object.entries(cogs);
  console.log(variant);

  const attributeSummary = (variant.attributes ?? [])
    .map((a) => `${a?.name}: ${a?.value}`)
    .join(" · ");

  const hasStock =
    (variant.stocks ?? []).filter((s) => s.quantity > 0).length > 0;

  return (
    <div className="group flex items-center justify-between gap-6 px-5 py-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:border-gray-300 transition-colors">
      {/* Product / SKU Cell */}
      <div className="flex items-center gap-4 min-w-0 flex-[2]">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400">
            <ImageIcon />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate tracking-tight">
            {variant.sku}
          </p>
          {attributeSummary && (
            <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
              {attributeSummary}
            </p>
          )}
        </div>
      </div>

      {/* Stock Column (Enhanced Visibility) */}
      <div className="flex-[2] min-w-[140px]">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Stock Allocation
        </p>
        {hasStock ? (
          <div className="flex flex-wrap gap-1.5">
            {variant.stocks?.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md"
              >
                {s.quantity}
                <span className="text-gray-400 text-[10px] font-normal">
                  ({s.stockStatusType?.name ?? "—"})
                </span>
              </span>
            ))}
          </div>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-md">
            Out of Stock
          </span>
        )}
      </div>

      {/* COGS Breakdown Column (Structured layout) */}
      <div className="min-w-[140px] text-right flex-[1.5]">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Cost of Goods
        </p>
        <div className="inline-block text-left min-w-[100px]">
          {cogsEntries.length > 0 ? (
            <div className="space-y-0.5">
              {cogsEntries.map(([key, data]) => (
                <div key={key} className="flex justify-between gap-3 text-xs">
                  <span className="text-gray-400 font-medium capitalize">
                    {data?.name || key}:
                  </span>
                  <span className="text-gray-700 font-semibold">
                    {formatCurrency(data?.value)}
                  </span>
                </div>
              ))}
              {cogsEntries.length > 1 && (
                <div className="flex justify-between gap-3 text-xs font-bold text-gray-900 mt-1 pt-1 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatCurrency(totalCogs(variant.cogsData))}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-400 text-right">—</p>
          )}
        </div>
      </div>

      {/* Price Column */}
      <div className="text-right min-w-[90px] flex-[1]">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Price
        </p>
        <p className="text-sm font-bold text-gray-900 tracking-tight">
          {formatCurrency(variant.price)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 ml-2">
        <button
          onClick={() => onEdit?.(variant?.id)}
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-colors"
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete?.([variant?.id])}
          className=" px-3.5 text-red-500 rounded-xl py-2.5 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams();

  const { data: productData, isError } = useQuery<ProductType>({
    queryKey: ["product", id],
    queryFn: () => ProductService.getById(id!),
    enabled: !!id,
  });

  const [updateOpen, setUpdateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantType | null>(null);
  const [productName, setProductName] = useState("");
  const [, setEditingName] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const [changed, setChanged] = useState(false);
  const [tagsData, setTagsData] = useState<string[]>(
    productData?.tags.map((tag) => tag.tagId) ?? [],
  );
  const pendingTagsRef = useRef<Array<{ name: string; slug: string }>>([]);

  useEffect(() => {
    if (!productData) return;
    setProductName(productData.productName);
    setProductImage(productData.productImage ?? null);
    setTagsData(productData.tags.map((tag) => tag.tagId));
    pendingTagsRef.current = [];
    setChanged(false);
  }, [productData]);

  const variants: ProductVariantType[] = productData?.variants ?? [];

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getAll(),
  });
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => TagService.getAll(),
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

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const mutation = useMutation({
    mutationFn: (data: ProductVariantType) =>
      ProductVariantService.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Product Variant updated successfully");
    },
    onError: () => {
      toast.error("Failed to update Product Variant");
    },
  });

  function handleEditVariant(updatedData: Partial<ProductVariantType>) {
    if (!productData) return;

    const normalizedData = {
      ...updatedData,
      price:
        updatedData.price !== undefined
          ? Number(updatedData.price)
          : updatedData.price,
    };

    mutation.mutate({
      ...normalizedData,
      id: selectedVariant?.id ?? productData.id,
    } as ProductVariantType);
  }

  const addMutation = useMutation({
    mutationFn: (data: ProductVariantType) =>
      ProductVariantService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Product Variant created successfully");
    },
    onError: (error) => {
      console.error("Failed to create Product Variant", error);
      toast.error("Failed to create Product Variant");
    },
  });

  function handleAddVariant(data: Partial<ProductVariantType>) {
    const formattedData = {
      ...data,
      cogsData: Array.isArray(data.cogsData)
        ? data.cogsData.map((item) => ({
            attributeId: item.attributeId,
            value: item.value,
          }))
        : [],
    } as ProductVariantType;

    addMutation.mutate(formattedData);
  }

  const handleDelete = async (id: string[]) => {
    try {
      await ProductVariantService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Product Variant deleted successfully");
    } catch {
      toast.error("Failed to delete Product Variant");
    }
  };

  if (isError || !productData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600 mb-1">
            Failed to load product
          </p>
          <p className="text-xs text-gray-500">
            Check your connection and try again.
          </p>
        </div>
      </div>
    );
  }
  const mapVariantToForm = (variant: ProductVariantType) => {
    return {
      ...variant,
      attributes:
        variant.attributes?.map((attr) => ({
          attributeId: attr.attributeId,
          value: attr.value,
        })) ?? [],
    };
  };

  const field = {
    key: "productTagIds",
    label: "Tags",
    placeholder: "Enter tags",
    options:
      tags?.map((tag: TagType) => ({
        label: tag.name,
        value: tag.id,
      })) ?? [],
  };

  const handleChange = (value: string[]) => {
    setTagsData(value);
    setChanged(true);
  };

  const handleUpdateTags = async () => {
    try {
      const newTagPlaceholders = tagsData.filter((t) =>
        t.startsWith("__new__"),
      );
      const resolvedTagIds = tagsData.filter((t) => !t.startsWith("__new__"));

      if (newTagPlaceholders.length > 0) {
        const newTagsToCreate = newTagPlaceholders.map((placeholder) => {
          const slug = placeholder.replace("__new__", "");
          const matched = pendingTagsRef.current.find((p) => p.slug === slug);
          return {
            name: matched ? matched.name : slug.replace(/-/g, " "),
            slug: slug,
            isActive: true,
          };
        });

        // Bulk create tags
        await TagService.create(newTagsToCreate);

        // Fetch fresh tags list to retrieve the generated IDs
        const freshTags: TagType[] = await TagService.getAll();

        // Match created tag slugs to their new IDs
        newTagPlaceholders.forEach((placeholder) => {
          const slug = placeholder.replace("__new__", "");
          const matchedTag = freshTags.find((t) => t.slug === slug);
          if (matchedTag?.id) {
            resolvedTagIds.push(matchedTag.id);
          }
        });
      }

      // Update the product with the new tag list
      const updatePayload: UpdateProductDto = {
        productName: productData.productName,
        quantity: productData.quantity,
        productCategoryId: productData.productCategory?.id || "",
        productBrandId: productData.brand?.id || "",
        productImage: productData.productImage,
        productTagIds: resolvedTagIds,
      };

      await ProductService.update(productData.id, updatePayload);

      pendingTagsRef.current = [];
      setChanged(false);
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Product tags updated successfully");
    } catch (error) {
      console.error("Failed to update product tags", error);
      toast.error("Failed to update product tags");
    }
  };
  console.log("changed Data", tagsData);

  return (
    <div className="min-h-screen p-8 antialiased font-sans">
      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="flex flex-col gap-6">
            {/* Product Name Form Block */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <label className="block text-[10px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                Product Title
              </label>
              <div className="flex items-center gap-3">
                <span
                  className="flex-1 text-sm font-semibold text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 bg-slate-50/50 cursor-text tracking-tight"
                  onClick={() => setEditingName(true)}
                >
                  {productName}
                </span>
              </div>
            </div>

            {/* Brand & Category Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Core Taxonomy
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-4 py-3 bg-slate-50/30">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                    Brand
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {productData?.brand?.brandName || "—"}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl px-4 py-3 bg-slate-50/30">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                    Primary Category
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {productData?.productCategory?.categoryName || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Product Variants
                  <span className="ml-2 font-semibold text-slate-500 lowercase">
                    ({variants.length} configurations)
                  </span>
                </h2>
              </div>

              {variants.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {variants.map((v) => (
                    <VariantRow
                      key={v.id}
                      variant={v}
                      onEdit={(variantId) => {
                        const clicked =
                          variants.find((vr) => vr.id === variantId) ?? null;
                        setSelectedVariant(clicked);
                        setUpdateOpen(true);
                      }}
                      onDelete={(variantId) => handleDelete(variantId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs text-gray-400 font-medium">
                    No active product variations discovered.
                  </p>
                </div>
              )}

              <button
                onClick={() => setAddOpen(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-600 border border-dashed border-gray-300 rounded-xl py-3 hover:border-gray-400 hover:text-gray-900 hover:bg-slate-50 transition-colors"
              >
                <PlusIcon />
                Create New Variant
              </button>
            </div>

            {/* <MultiSelectField
              field={field}
              value={formData[field.key]}
              onChange={handleChange}
              onPendingCreate={handlePendingCreate}
            /> */}

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Metadata Tags
              </h2>
              <MultiSelectField
                field={field}
                value={tagsData}
                onChange={handleChange}
                onPendingCreate={(_, payload) => {
                  pendingTagsRef.current.push(payload);
                }}
              />
              {changed && (
                <button
                  className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-600 border border-dashed border-gray-300 rounded-xl py-3 hover:border-gray-400 hover:text-gray-900 hover:bg-slate-50 transition-colors"
                  onClick={handleUpdateTags}
                >
                  Update Tags
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3.5">
                Product Media
              </h2>
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-4 flex items-center justify-center border border-gray-200/60 shadow-inner">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                    onError={() => setProductImage(null)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-gray-300">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-400">
                      No assets configured
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {/* <span className="flex items-center justify-center gap-2 w-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl py-2.5 transition-colors shadow-sm">
                    <UploadIcon />
                    Upload Asset
                  </span> */}
                </label>
                {/* <button
                  onClick={() => setProductImage(null)}
                  className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon />
                  Purge
                </button> */}
              </div>
            </div>

            {/* Financials & Parameters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className=" grid grid-cols-2 gap-x-4 gap-y-3.5">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                    Channel Visibility
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {productData.isHidden ? "Hidden" : "Public"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                    Date Created
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    {new Date(productData.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                    Last Modified
                  </p>
                  <p className="text-xs font-semibold text-gray-700">
                    {new Date(productData.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdateModal<ProductVariantType | CreateProductVariantType>
        open={updateOpen}
        setOpen={setUpdateOpen}
        title="Update Product Variant"
        description="Update Product Variant details"
        fields={updateProductVariantFields(
          products,
          attributeData,
          cogsData,
          attributeDefinitions,
        )}
        initialData={selectedVariant ? mapVariantToForm(selectedVariant) : {}}
        allItems={productVariant}
        variantMode={false}
        onUpdate={(updatedData) => {
          handleEditVariant(updatedData);
          setUpdateOpen(false);
        }}
      />

      <UpdateModal<ProductVariantType | CreateProductVariantType>
        open={addOpen}
        setOpen={setAddOpen}
        title="Add Product Variant"
        description="Add Product Variant details"
        fields={updateProductVariantFields(
          products,
          attributeData,
          cogsData,
          attributeDefinitions,
          true,
        )}
        initialData={productData ? { productId: productData.id } : {}}
        variantMode={false}
        onUpdate={(updatedData) => {
          handleAddVariant(updatedData);
          setAddOpen(false);
        }}
      />
    </div>
  );
}
