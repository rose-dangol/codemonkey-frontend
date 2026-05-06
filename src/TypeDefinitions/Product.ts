export type Product = {
  id: string;
  productName: string;
  quantity: number;
  productImage?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
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
