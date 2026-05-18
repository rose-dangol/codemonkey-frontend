import type { ProductType } from "./Product";

export type BrandsType = {
  id: string;
  brandName: string;
  brandImage: string;
  brandDesc: string;
  products: ProductType[];
};
