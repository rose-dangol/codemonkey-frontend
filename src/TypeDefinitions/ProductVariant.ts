export type ProductVariantType = {
  id: string;
  productId: string;
  cogsData: {
    attributeId: string;
    value: string;
  }[];
  sku?: string;
  price: number;
  images?: { url: string; sortOrder: number; file?: File }[];
  attributes?: {
    id?: string;
    name?: string;
    attributeId?: string;
    key?: string;
    value: string;
  }[];
  stockMap?: Record<string, number>;
  stocks?: {
    id: string;
    quantity: number;
    stockStatusTypeId: string;
    stockStatusType?: {
      code: string;
      name?: string;
    };
  }[];
  totalStock: number;
};

export interface CreateProductVariantType {
  id: string;
  productId: string;
  cogsData: {
    attributeId: string;
    value: string;
  }[];
  sku?: string;
  price: number;
  images?: { url: string; sortOrder: number; file?: File }[];
  attributes?: {
    id?: string;
    attributeId?: string;
    key?: string;
    value: string;
  }[];
  stocks?: {
    id: string;
    quantity: number;
    stockStatusTypeId: string;
    stockStatusType?: {
      code: string;
      name?: string;
    };
  }[];
}
