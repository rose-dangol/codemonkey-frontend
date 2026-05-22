import type {
  Attributes,
  AttributeDefinitionType,
} from "./AttributeDefinitions";
import type { BrandsType } from "./Brands";
import type { CategoryType } from "./Category";
import type { CogsDefinitionType } from "./CogsDefinitions";
import type { ProductType } from "./Product";
import type { ProductVariantType } from "./ProductVariant";

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
  categoryImage?: File | string | null;
  categoryDesc?: string;
  brand?: BrandsType;
  productCategory?: CategoryType;
};

type UpdateField<T> = {
  key: Extract<keyof T, string>;
  label: string;
  placeholder?: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "select"
    | "multi-select"
    | "dropdown"
    | "select(parent)"
    | "tabs"
    | "image";
  options?: { label: string; value: string; children?: any[] }[];
  tabDefinitions?: { id: string; name: string }[];
  cell?: (
    row: { original: T },
    allItems?: UpdateCategoryDto[],
  ) => React.ReactNode;
};

export const updateCategoryFields = (
  allItems?: CategoryType[],
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
    options: allItems
      ?.filter((c) => c.id !== currentId)
      ?.map((c) => ({
        label: c.categoryName,
        value: c.id,
      })),
  },
  {
    key: "categoryImage",
    label: "Category Image",
    placeholder: "Enter image url",
    type: "image",
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
  brandImage?: File | string | null;
  brandDesc?: string;
  productId?: string[];
};

export const updateBrandFields = (
  allItems?: BrandsType[],
  currentId?: string,
  allProducts?: ProductType[],
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
    type: "image",
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
  id?: string | undefined | null;
  serviceId?: string | undefined | null;
  productName?: string;
  quantity?: number;
  productCategoryId?: string;
  productBrandId?: string;
  productImage?: File | string | null;
  cogs?: CogsDefinitionType[];
};

export const updateProductFields = (
  brands?: BrandsType[],
  categories?: CategoryType[],

  currentId?: string,
): UpdateField<UpdateProductDto>[] => {
  const buildCategoryOptions = (cats?: CategoryType[]): any[] => {
    if (!cats) return [];
    return cats
      .filter((c) => c.id !== currentId)
      .map((c) => ({
        label: c.categoryName,
        value: c.id,
        children:
          c.subCategories && c.subCategories.length > 0
            ? buildCategoryOptions(c.subCategories)
            : undefined,
      }));
  };

  const buildBrandOptions = (brand?: BrandsType[]): any[] => {
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
      type: "image",
    },
  ];
};

export const updateAttributeDefinitionFields = (
  currentId?: string,
): UpdateField<AttributeDefinitionType>[] => {
  return [
    {
      key: "key",
      label: "Attribute Key",
      placeholder: "Enter attribute key",
      type: "text",
    },
    {
      key: "name",
      label: "Attribute Name",
      placeholder: "Enter Attribute Name",
      type: "text",
    },
  ];
};

export const updateCogsDefinitionFields = (
  currentId?: string,
): UpdateField<CogsDefinitionType>[] => {
  return [
    {
      key: "key",
      label: "Cogs Key",
      placeholder: "Enter cogs key",
      type: "text",
    },
    {
      key: "name",
      label: "Cogs Name",
      placeholder: "Enter cogs name",
      type: "text",
    },
  ];
};

export const updateProductVariantFields = (
  product?: ProductType[],
  attributes?: Attributes[],
  cogsData?: CogsDefinitionType[],

  attributeDefinitions?: AttributeDefinitionType[],
): UpdateField<ProductVariantType>[] => {
  const buildProductOptions = (pro?: ProductType[]): any[] => {
    if (!pro) return [];
    return pro.map((p) => ({
      label: p.productName,
      value: p.id,
    }));
  };

  const buildTabDefinitions = (
    attrDefs?: AttributeDefinitionType[],
  ): { id: string; name: string }[] => {
    if (!attrDefs) return [];
    return attrDefs.map((ad) => ({
      id: ad.id ?? ad.key,
      name: ad.name,
    }));
  };

  const buildCogsOptions = (
    cogs?: CogsDefinitionType[],
  ): { label: string; value: string }[] => {
    if (!cogs) return [];
    return cogs.map((c) => ({
      label: c.key,
      value: c.name,
    }));
  };

  return [
    {
      key: "sku",
      label: "Sku",
      placeholder: "Enter sku",
      type: "text",
    },
    {
      key: "price",
      label: "Price",
      placeholder: "Enter price",
      type: "number",
    },
    {
      key: "stock",
      label: "Stock",
      placeholder: "Enter stock",
      type: "number",
    },
    {
      key: "productId",
      label: "Product",
      placeholder: "Enter product",
      type: "select(parent)",
      options: buildProductOptions(product),
    },
    {
      key: "attributes",
      label: "Attributes",
      placeholder: "Enter attributes",
      type: "tabs",
      tabDefinitions: buildTabDefinitions(attributeDefinitions),
    },
    {
      key: "cogsData",
      label: "Cogs",
      placeholder: "Enter cogs",
      type: "tabs",
      options: buildCogsOptions(cogsData),
    },
  ];
};
