import api from "@/api/ApiUrl";
import type { UpdateProductDto } from "@/TypeDefinitions/ModalType";
import { toast } from "react-toastify";

export interface ProductFilterResponse {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ProductFilterParams = {
  search?: string;
  categoryIds?: string[];
  includeSubCategories?: boolean;
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  stockMin?: number;
  stockMax?: number;
  tagSlugs?: string[];
  tagMatchMode?: "any" | "all";
  excludeHidden?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt" | "minPrice" | "totalStock";
  sortOrder?: "asc" | "desc";
};

export const ProductService = {
  getAll: async () => {
    const res = await api.get("product/getAllProduct?limit=1000");
    return res.data?.data || res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`product/getProductById/${id}`);
    return res.data;
  },

  create: async (data: UpdateProductDto) => {
    try {
      const formData = new FormData();

      formData.append("productName", data.productName!);

      formData.append("productCategoryId", data.productCategoryId!);

      if (data.productBrandId) {
        formData.append("productBrandId", data.productBrandId);
      }

      formData.append("quantity", String(data.quantity!));

      if (data.productImage instanceof File) {
        formData.append("productImage", data.productImage);
      }

      if (data.productTagIds?.length) {
        data.productTagIds.forEach((tagId) => {
          formData.append("productTagIds", tagId);
        });
      }

      const res = await api.post(`product/addProduct`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (error: any) {
      console.error(error);
      return error.message;
    }
  },

  update: async (id: string, data: UpdateProductDto) => {
    try {
      const formData = new FormData();

      formData.append("productName", data.productName!);
      formData.append("productCategoryId", data.productCategoryId!);

      if (data.productBrandId) {
        formData.append("productBrandId", data.productBrandId);
      }

      formData.append("quantity", String(data.quantity!));

      if (data.productImage instanceof File) {
        formData.append("productImage", data.productImage);
      }

      if (data.productTagIds?.length) {
        data.productTagIds.forEach((tagId) => {
          formData.append("productTagIds", tagId);
        });
      }

      const res = await api.put(`product/updateProduct/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`product/deleteProduct`, {
      data: { productId: id },
    });
    return res.data;
  },
  filter: async (
    params: ProductFilterParams,
  ): Promise<ProductFilterResponse> => {
    const res = await api.get(`/product/filter`, {
      params,
    });

    return res.data;
  },
};
