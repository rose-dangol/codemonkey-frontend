export type ProductVariantType = {
  id: string;
  productId: string;
  cogsData?: { [key: string]: number };
  sku?: string;
  price: number;
  stock: number;
  attributes?: { [key: string]: string };
};
