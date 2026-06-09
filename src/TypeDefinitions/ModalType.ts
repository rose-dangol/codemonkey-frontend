import type {
  Attributes,
  AttributeDefinitionType,
} from "./AttributeDefinitions";
import type { BrandsType } from "./Brands";
import type { CategoryType } from "./Category";
import type { CogsDefinitionType } from "./CogsDefinitions";
import type { StockStatusType } from "./InventoryManagement";
import type { ProductType } from "./Product";
import type { ProductVariantType } from "./ProductVariant";
import type { TagType } from "./Tag";

export type modalType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sentObject: any;
  saveLocalStorage?: (data: any) => void;
};

export type GetModalProps = {
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
    | "image"
    | "radio-button";
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
): UpdateField<UpdateCategoryDto>[] => {
  const buildCategoryOptions = (pro?: CategoryType[]): any[] => {
    if (!pro) return [];
    return pro
      .filter((p) => p.id !== currentId)
      .map((p) => ({
        label: p.categoryName,
        value: p.id,
        children:
          p.subCategories && p.subCategories.length > 0
            ? buildCategoryOptions(p.subCategories)
            : undefined,
      }));
  };

  return [
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
      options: buildCategoryOptions(allItems),
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
};

export type UpdateBrandDto = {
  id: string;
  brandName?: string;
  brandImage?: File | string | null;
  brandDesc?: string;
  productId?: string[];
};

export const updateBrandFields = (
  _allItems?: BrandsType[],
  _currentId?: string,
  allProducts?: ProductType[],
): UpdateField<UpdateBrandDto>[] => {
  // Get the IDs of products already assigned to this brand
  const currentBrand = _allItems?.find((b) => b.id === _currentId);
  const brandProductIds = new Set(
    currentBrand?.products?.map((p) => p.id) ?? [],
  );

  // If editing a brand, show only its own products; otherwise show all
  const filteredProducts =
    _currentId && brandProductIds.size > 0
      ? (allProducts ?? []).filter((p) => brandProductIds.has(p.id))
      : (allProducts ?? []);

  return [
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
      options: filteredProducts.map((p) => ({
        label: p.productName,
        value: p.id,
        isHidden: p.isHidden,
      })),
    },
  ];
};

export type UpdateProductDto = {
  id?: string | undefined | null;
  serviceId?: string | undefined | null;
  productName?: string;
  quantity?: number;
  productCategoryId?: string;
  productBrandId?: string;
  productImage?: File | string | null;
  cogs?: CogsDefinitionType[];
  productTagIds?: string[];
};

export const updateProductFields = (
  brands?: BrandsType[],
  categories?: CategoryType[],
  tags?: TagType[],
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

  const buildTagOptions = (tag?: TagType[]): any[] => {
    if (!tag) return [];
    return tag.map((t) => ({
      label: t.name,
      value: t.id,
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
      key: "productTagIds",
      label: "Tags",
      placeholder: "Enter tags",
      type: "multi-select",
      options: buildTagOptions(tags),
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
  _currentId?: string,
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
  _currentId?: string,
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

export const updateTagFields = (
  _currentId?: string,
): UpdateField<TagType>[] => {
  return [
    {
      key: "name",
      label: "Tag Name",
      placeholder: "Enter tag name",
      type: "text",
    },
    {
      key: "slug",
      label: "Tag Slug",
      placeholder: "Enter tag slug",
      type: "text",
    },
  ];
};

export const updateProductVariantFields = (
  product?: ProductType[],
  _attributes?: Attributes[],
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

//---Stock Status Management
const activeStatus = () => [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

export const stockStatusFields = (): UpdateField<StockStatusType>[] => {
  return [
    {
      key: "name",
      label: "Status Name",
      placeholder: "Enter Stock-Status Name",
      type: "text",
    },
    {
      key: "code",
      label: "CODE",
      placeholder: "CODE - ALL CAPS",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      placeholder: "Enter Stock-Status Description",
      type: "text",
    },
    {
      key: "isActive",
      label: "Active Status",
      type: "radio-button",
      options: activeStatus(),
    },
  ];
};

export const updateStockStatusFields = (): UpdateField<StockStatusType>[] => {
  return [
    {
      key: "name",
      label: "Status Name",
      placeholder: "Enter Stock-Status Name",
      type: "text",
    },
    {
      key: "description",
      label: "Description",
      placeholder: "Enter Stock-Status Description",
      type: "text",
    },
    {
      key: "isActive",
      label: "Active Status",
      type: "radio-button",
      options: activeStatus(),
    },
  ];
};

export const addInventoryRecordField = (
  products: ProductType[],
  productVariants: ProductVariantType[],
  stockStatuses: StockStatusType[],
) => {
  const buildProductOptions = (products: ProductType[]) => {
    if (!products) return [];

    return products.map((product) => ({
      label: product.productName,
      value: product.id,
    }));
  };

  const buildStockStatusOptions = (statuses: StockStatusType[]) => {
    if (!statuses) return [];

    return statuses
      .filter((status) => status.isActive)
      .map((status) => ({
        label: status.name,
        value: status.id,
      }));
  };
  return [
    {
      key: "productId",
      label: "Product",
      placeholder: "Select Product",
      type: "select(parent)",
      options: buildProductOptions(products),
    },

    {
      key: "variantId",
      label: "Product Variant",
      placeholder: "Choose Variant",
      type: "select(dependent)",

      parentKey: "productId",

      sourceData: productVariants,

      getOptions: (productId: string, variants: ProductVariantType[]) => {
        if (!productId) return [];

        return variants
          .filter((variant) => variant.productId === productId)
          .map((variant) => ({
            label: variant.attributes?.length
              ? variant.attributes.map((a) => a.value).join(" / ")
              : variant.sku,
            value: variant.id,
          }));
      },
    },

    {
      key: "fromStatus",
      label: "From Status",
      type: "select",
      options: buildStockStatusOptions(stockStatuses),
    },

    {
      key: "toStatus",
      label: "To Status",
      type: "select",
      options: buildStockStatusOptions(stockStatuses),
    },

    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      placeholder: "Enter quantity",
    },
  ];
};
