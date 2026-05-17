export type ProductVariantType = {
  id: string;
  productId: string;
  cogsData?: Record<string, number>;
  sku?: string;
  price: number;
  stock: number;
  attributes?: { id?: string; attributeId?: string; key?: string; value: string }[];
};


