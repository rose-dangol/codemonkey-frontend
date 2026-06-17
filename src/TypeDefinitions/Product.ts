import type { BrandsType } from "./Brands";
import type { ProductVariantType } from "./ProductVariant";
import type { ProductTag } from "./Tag";

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

  brand: BrandsType | null;
  variants: ProductVariantType[];
  attributes?: {
    id: string;
    attributeId: string;
    key: string;
    value: string;
    serviceTypeId: string;
  }[];
  totalStock: number;
  // tags: {
  //   tag: {
  //     id: string;
  //     name: string;
  //   };
  // }[];
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string;
};
