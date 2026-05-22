import api from "@/api/ApiUrl";
import type { UpdateCategoryDto } from "@/TypeDefinitions/ModalType";
import { data } from "react-router-dom";
import { toast } from "react-toastify";

export const CategoryService = {
  getAll: async () => {
    const res = await api.get("category/getCategory");

    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`category/getCategory/${id}`);
    return res.data;
  },

  create: async (data: UpdateCategoryDto) => {
    try {
      const formData = new FormData();
      formData.append("categoryName", data.categoryName!);
      formData.append("categoryDesc", data.categoryDesc!);

      if (data.categoryParentId) {
        formData.append("categoryParentId", data.categoryParentId);
      }
      if (data.categoryImage instanceof File) {
        formData.append("categoryImage", data.categoryImage);
      }

      const res = await api.post(`category/addCategory`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.error(error);
    }
  },

  update: async (id: string, data: UpdateCategoryDto) => {
    try {
      const formData = new FormData();
      formData.append("categoryName", data.categoryName!);
      formData.append("categoryDesc", data.categoryDesc!);
      if (data.categoryParentId) {
        formData.append("categoryParentId", data.categoryParentId);
      }
      if (data.categoryImage instanceof File) {
        formData.append("categoryImage", data.categoryImage);
      }

      const res = await api.put(`category/updateCategory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`category/deleteCategory`, {
      data: { categoryId: id },
    });
    return res.data;
  },
};
