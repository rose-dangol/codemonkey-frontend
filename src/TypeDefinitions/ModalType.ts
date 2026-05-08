import type { Brands } from "./Brands";
import type { Category } from "./Category";
import type { Product } from "./Product";

export type modalType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sentObject: any;
  saveLocalStorage?: (data: any) => void;
};

export type GetModalProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: string | number | null;
  endpoint: string;
  title?: string;
};


export type UpdateModalProps<T = any, O = any> = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  fields: UpdateField<T>[];
  initialData?: Partial<T>;
  onUpdate?: (updatedData: Partial<T>) => void;
  allItems?: O[];
};

export type UpdateCategoryDto = {
  id: string;
  categoryName?: string;
  categoryParentId?: string | null;
  categoryImage?: string;
  categoryDesc?: string;
  brand?: Brands;
  productCategory?: Category;
};

type UpdateField<T> = {
  key: Extract<keyof T, string>;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "email" | "select" | "multi-select" | "dropdown"|"select(parent)";
  options?: { label: string; value: string; children?: any[] }[];
  cell?: (
    row: { original: T },
    allItems?: UpdateCategoryDto[],
  ) => React.ReactNode;
};

export const updateCategoryFields = (
  allItems?: Category[],
  currentId?: string,
): UpdateField<UpdateCategoryDto>[] => [
    {
      key: "categoryName",
      label: "Category Name",
      placeholder: "Enter category name",
      type: "text",
    },
    {
      key: "categoryParentId",
      label: "Parent Category",
      placeholder: "Enter parent category",
      type: "select(parent)",
      options: allItems?.filter((c) => c.id !== currentId)?.map((c) => ({
        label: c.categoryName,
        value: c.id,
      })),
    },
    {
      key: "categoryImage",
      label: "Category Image",
      placeholder: "Enter image url",
      type: "text",
    },
    {
      key: "categoryDesc",
      label: "Category Description",
      placeholder: "Enter description",
      type: "text",
    },
  ];

export type UpdateBrandDto = {
  id: string;
  brandName?: string;
  brandImage?: string;
  brandDesc?: string;
  productId?: string[];
};

export const updateBrandFields = (
  allItems?: Brands[],
  currentId?: string,
  allProducts?: Product[],
): UpdateField<UpdateBrandDto>[] => [
    {
      key: "brandName",
      label: "Brand Name",
      placeholder: "Enter brand name",
      type: "text",
    },
    {
      key: "brandImage",
      label: "Brand Image",
      placeholder: "Enter image url",
      type: "text",
    },
    {
      key: "brandDesc",
      label: "Brand Description",
      placeholder: "Enter description",
      type: "text",
    },
    {
      key: "productId",
      label: "Products",
      placeholder: "Enter products",
      type: "multi-select",
      options:
        allProducts?.map((p) => ({
          label: p.productName,
          value: p.id,
          isHidden: p.isHidden,
        })) ?? [], 
    },
  ];


export type UpdateProductDto = {
  id: string;
  productName?: string;
  quantity?: number;
  productCategoryId?: string;
  productBrandId?: string;
  productImage?: string;
  serviceId: string;
};

export const updateProductFields = (
  brands?: Brands[],
  categories?: Category[],
  currentId?: string,
): UpdateField<UpdateProductDto>[] => {
  const buildCategoryOptions = (cats?: Category[]): any[] => {
    if (!cats) return [];
    return cats
      .filter((c) => c.id !== currentId)
      .map((c) => ({
        label: c.categoryName,
        value: c.id,
        children: c.subCategories && c.subCategories.length > 0 ? buildCategoryOptions(c.subCategories) : undefined,
      }));
  };

  const buildBrandOptions = (brand?: Brands[]): any[] => {
    console.log("brand : ", brand);
    if (!brand) return [];
    return brand.map((b) => ({
      label: b.brandName,
      value: b.id,
    }));
  };
  return [
    {
      key: "productName",
      label: "Product Name",
      placeholder: "Enter product name",
      type: "text",
    },
    {
      key: "quantity",
      label: "Quantity",
      placeholder: "Enter quantity",
      type: "number",
    },
    {
      key: "productCategoryId",
      label: "Product Category",
      placeholder: "Enter product category",
      type: "select",
      options: buildCategoryOptions(categories),
    },
    {
      key: "productBrandId",
      label: "Brand",
      placeholder: "Enter brand",
      type: "select(parent)",
      options: buildBrandOptions(brands),
    },
    {
      key: "productImage",
      label: "Product Image",
      placeholder: "Enter image url",
      type: "text",
    },
  ];
};
