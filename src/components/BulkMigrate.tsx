import { CategoryService } from "@/services/OrderManagement/Category";
import type { ProductType } from "@/TypeDefinitions/Product";
import type { CategoryType } from "@/TypeDefinitions/Category";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { TreeDropdown } from "./TreeDropdown";
import { toast } from "react-toastify";

interface BulkMigrateModalProps {
  categoryId: string | null;
  allCategory: CategoryType[];
  onClose: () => void;
}

const mapCategoriesToOptions = (categories: CategoryType[]): any[] => {
  return categories.map((cat) => ({
    label: cat.categoryName,
    value: cat.id,
    children: cat.subCategories?.length
      ? mapCategoriesToOptions(cat.subCategories)
      : undefined,
  }));
};

export default function BulkMigrateModal({
  categoryId,
  allCategory,
  onClose,
}: BulkMigrateModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(
    null,
  );
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["categories", categoryId],
    queryFn: async () => {
      console.log("[QUERY] Fetching products for categoryId:", categoryId);
      const result = await CategoryService.getProductbyCategory(categoryId!);
      console.log("[QUERY] Fetched products:", result);
      return result;
    },
    enabled: !!categoryId,
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      ids,
      categoryId,
    }: {
      ids: string[];
      categoryId: string;
    }) => {
      console.log("[MIGRATE] Firing mutation with:", { ids, categoryId });
      return CategoryService.bulkMigrate(ids, categoryId);
    },
    // no onSuccess/onError here anymore
  });

  const allChecked = selected?.size === products?.length;
  const someChecked = selected?.size > 0 && selected?.size < products?.length;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      allChecked ? new Set() : new Set(products.map((p: ProductType) => p.id)),
    );
  };

  const handleBulkMigrate = (selectedCategoryVal: string) => {
    setPendingCategoryId(selectedCategoryVal);
  };

  const handleConfirm = () => {
    if (!pendingCategoryId) return;

    const targetCategoryId = pendingCategoryId; // ← capture BEFORE clearing
    const sourceCategoryId = categoryId;

    deleteMutation.mutate(
      { ids: [...selected], categoryId: targetCategoryId },
      {
        onSuccess: (data) => {
          console.log("[MIGRATE] onSuccess response:", data);
          console.log("[MIGRATE] source:", sourceCategoryId);
          console.log("[MIGRATE] target:", targetCategoryId);

          // Remove source category cache entirely, force a fresh fetch
          queryClient.removeQueries({
            queryKey: ["categories", sourceCategoryId],
          });
          queryClient.removeQueries({
            queryKey: ["categories", targetCategoryId],
          });
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          queryClient.invalidateQueries({ queryKey: ["products"] });

          toast.success("Product Migrated Successfully");
          onClose();
        },
        onError: (error) => {
          console.error("[MIGRATE] onError:", error);
          toast.error("Something went wrong");
        },
      },
    );

    setPendingCategoryId(null); // safe to clear now, captured above
  };
  const handleCancel = () => {
    setPendingCategoryId(null);
  };

  const options = allCategory ? mapCategoriesToOptions(allCategory) : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-lg overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Product migration
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Select products to bulk migrate
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {selected.size} selected
                </span>
              )}
              <TreeDropdown
                options={options}
                value={""}
                onChange={(val) => handleBulkMigrate(val)}
                trigger={
                  <button
                    disabled={selected.size === 0}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all
                      disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border-zinc-200 disabled:cursor-not-allowed
                      enabled:bg-blue-50 enabled:text-blue-600 enabled:border-blue-200 enabled:hover:bg-blue-100
                      dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 dark:disabled:border-zinc-700
                      dark:enabled:bg-blue-900/30 dark:enabled:text-blue-400 dark:enabled:border-blue-800"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Bulk migrate
                  </button>
                }
              />
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 transition-colors ml-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Select all */}
          <div className="px-5 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <label className="flex items-center gap-2.5 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={toggleAll}
                className="w-3.5 h-3.5 cursor-pointer accent-blue-500"
              />
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Select all
              </span>
            </label>
          </div>

          {/* Product rows */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products?.map((product: ProductType) => (
              <label
                key={product.id}
                className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(product.id)}
                  onChange={() => toggle(product.id)}
                  className="w-3.5 h-3.5 cursor-pointer accent-blue-500 flex-shrink-0"
                />
                <div className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-800 flex-shrink-0">
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {product.productName}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Qty: {product.quantity} • Category:{" "}
                    {product.productCategory?.categoryName || "None"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {pendingCategoryId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-sm shadow-xl">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Confirm migration
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
              Are you sure you want to migrate{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {selected.size} product{selected.size > 1 ? "s" : ""}
              </span>{" "}
              to the selected category? This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-5 justify-end">
              <button
                onClick={handleCancel}
                className="text-xs font-medium px-3.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                No, cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={deleteMutation.isPending}
                className="text-xs font-medium px-3.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {deleteMutation.isPending ? "Migrating..." : "Yes, migrate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
