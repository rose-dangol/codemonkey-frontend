import type { Brands } from "./Brands";
import type { Category } from "./Category";

export type modalType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sentObject: any;
  saveLocalStorage?: (data: any) => void;
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
};

type UpdateField<T = any> = {
  key: keyof T;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "email" | "select";
  options?: { label: string; value: string }[];
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
    type: "select",
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
  products?: string[];
};

export const updateBrandFields = (
  allItems?: Brands[],
  currentId?: string,
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
    key: "products",
    label: "Products",
    placeholder: "Enter products",
    type: "text",
  },
];
