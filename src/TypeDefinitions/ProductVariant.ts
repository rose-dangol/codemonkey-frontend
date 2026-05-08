export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  price: number;
  stock: number;
  attributes?: { [key: string]: string };
};
