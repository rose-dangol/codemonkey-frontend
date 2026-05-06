export type Product = {
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
};