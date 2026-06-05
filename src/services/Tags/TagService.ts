import api from "@/api/ApiUrl";
import type { TagType } from "@/TypeDefinitions/Tag";

export const TagService = {
  getAll: async () => {
    const res = await api.get(`tag/getAll`);
    return res.data;
  },

  create: async (data: TagType) => {
    const res = await api.post(`tag/addTag`, data);
    return res.data;
  },

  update: async (id: string, data: TagType) => {
    const res = await api.put(`tag/updateTag/${id}`, data);
    return res.data;
  },

  delete: async (ids: string[]) => {
    const res = await api.delete(`tag/deleteTag`, { data: { ids } });
    return res.data;
  },

  //   create: async (data: UpdateBrandDto) => {
  //     try {
  //       const res = await api.post(`brand/addBrand`, data);
  //       return res.data;
  //     } catch (error: any) {
  //       console.log(error);
  //       return error.message;
  //     }
  //   },

  //   update: async (id: string, data: UpdateBrandDto) => {
  //     try {
  //       const res = await api.put(`brand/updateBrand/${id}`, data);
  //       return res.data;
  //     } catch (error: any) {
  //       toast.error(error.response?.data?.message || "Failed to update brand");
  //     }
  //   },

  //   delete: async (id: string[]) => {
  //     const res = await api.delete(`category/deleteCategory`, { data: { categoryId: id } });
  //     return res.data;
  //   },
};
