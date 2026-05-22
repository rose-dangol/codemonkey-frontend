import api from "@/api/ApiUrl";
import type { UpdateBrandDto } from "@/TypeDefinitions/ModalType";
import { toast } from "react-toastify";

export const BrandService = {
  getAll: async () => {
    const res = await api.get("brand/getBrand");
    return res.data;
  },

  create: async (data: UpdateBrandDto) => {
    try {
      const formData = new FormData();
      formData.append("brandName", data.brandName!);
      formData.append("brandDesc", data.brandDesc!);

      if (data.brandImage instanceof File) {
        formData.append("brandImage", data.brandImage);
      }
      if (data.productId?.length) {
        data.productId.forEach((id) => formData.append("productId[]", id));
      }

      const res = await api.post(`brand/addBrand`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error(error);
    }
  },

  update: async (id: string, data: UpdateBrandDto) => {
    try {
      const formData = new FormData();
      formData.append("brandName", data.brandName!);
      formData.append("brandDesc", data.brandDesc!);

      if (data.brandImage instanceof File) {
        formData.append("brandImage", data.brandImage);
      }
      if (data.productId?.length) {
        data.productId.forEach((id) => formData.append("productId[]", id));
      }

      const res = await api.put(`brand/updateBrand/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update brand");
    }
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`brand/deleteBrand`, {
      data: { brandId: id },
    });
    return res.data;
  },
};
