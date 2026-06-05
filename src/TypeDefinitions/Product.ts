import type { ProductVariantType } from "./ProductVariant";

export type ProductType = {
  id: string;
  productName: string;
  quantity: number;
  productImage?: string;
  productCategoryId?: string | null;
  productBrandId?: string | null;
  isHidden?: boolean | null;
  productCategory?: {
    id: string;
    categoryName: string;
  } | null;

  brand?: {
    id: string;
    brandName: string;
  } | null;
  variants?: ProductVariantType[];
  attributes?: {
    id: string;
    attributeId: string;
    key: string;
    value: string;
    serviceTypeId: string;
  }[];
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
};
