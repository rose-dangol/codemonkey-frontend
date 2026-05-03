import type { Product } from "./Product";

export type Brands = {
  id: string;
  brandName: string;
  brandImage: string;
  brandDesc: string;
  products: Product[];
}