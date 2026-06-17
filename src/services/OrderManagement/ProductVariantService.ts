import api from "@/api/ApiUrl";
import type { ProductVariantType } from "@/TypeDefinitions/ProductVariant";
import { toast } from "react-toastify";

export const ProductVariantService = {
  getAll: async () => {
    const res = await api.get(`productVariant/getAll`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`productVariant/getProductVariantById/${id}`);
    return res.data;
  },

  create: async (data: ProductVariantType) => {
    const formData = new FormData();
    console.log("create function called", data);

    // basic fields
    formData.append("productId", data.productId);
    formData.append("sku", data.sku ?? "");
    formData.append("price", String(data.price ?? 0));
    formData.append(
      "stock",
      String((data as any).stocks ?? (data as any).stock ?? 0),
    );

    // attributes — filter out any entries with missing fields
    const validAttributes = (data.attributes || []).filter(
      (a: any) => a.attributeId && a.value != null && a.value !== "",
    );
    formData.append("attributes", JSON.stringify(validAttributes));

    // cogsData
    formData.append("cogsData", JSON.stringify(data.cogsData || {}));

    // images (files + sortOrder)
    data.images?.forEach((img) => {
      if (img.file) {
        formData.append("files", img.file); // IMPORTANT: same key for array
      }
    });

    // optional: send sort order separately
    const imageMeta = data.images?.map((img, index) => ({
      sortOrder: img.sortOrder ?? index + 1,
    }));

    formData.append("imageMeta", JSON.stringify(imageMeta || []));

    const res = await api.post("productVariant/addProductVariant", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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
