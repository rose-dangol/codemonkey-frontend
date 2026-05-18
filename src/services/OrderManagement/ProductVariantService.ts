import api from "@/api/ApiUrl";
import type { ProductVariantType } from "@/TypeDefinitions/ProductVariant";
import { toast } from "react-toastify";

export const ProductVariantService = {
  getAll: async () => {
    const res = await api.get(`productVariant/getAll`);
    return res.data;
  },

  create: async (data: ProductVariantType) => {
    const res = await api.post(`productVariant/addProductVariant`, data);
    return res.data;
  },

  update: async (id: string, data: ProductVariantType) => {
    try {
      const res = await api.put(
        `productVariant/updateProductVariant/${id}`,
        data,
      );
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update brand");
    }
  },

  delete: async (ids: string[]) => {
    const res = await api.delete(`productVariant/deleteProductVariant`, {
      data: { ids },
    });
    return res.data;
  },
};
