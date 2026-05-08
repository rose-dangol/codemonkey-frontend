import api from "@/api/ApiUrl";

export const ProductVaraiantService = {
  getAll: async () => {
    const res = await api.get(`productVariant/getAll`);
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
