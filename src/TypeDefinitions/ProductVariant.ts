export type ProductVariantType = {
  id: string;
  productId: string;
  sku: string;
  price: number;
  stock: number;
  attributes?: { [key: string]: string };
};
