export type ProductVariantType = {
  id: string;
  productId: string;
  cogsData?: Record<string, number>;
  sku?: string;
  price: number;
  attributes?: {
    id?: string;
    attributeId?: string;
    key?: string;
    value: string;
  }[];
  stockMap?: Record<string, number>;
  totalStock: number;
};
