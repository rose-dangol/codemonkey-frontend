import api from "@/api/ApiUrl";

export const CustomerService = {
  getAll: async () => {
    const res = await api.get(`customer/getAllCustomers`);
    return res.data;
  },

  //   create: async (data: CogsDefinitionType) => {
  //     const res = await api.post(`cogs/addCogsField`, data);
  //     return res.data;
  //   },

  //   update: async (id: string, data: CogsDefinitionType) => {
  //     const res = await api.put(`cogs/updateCogsField/${id}`, data);
  //     return res.data;
  //   },

  //   delete: async (id: string[]) => {
  //     const res = await api.delete(`cogs/deleteCogsField`, {
  //       data: { ids: id },
  //     });
  //     return res.data;
  //   },

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

  getGenderStats: async () => {
    const res = await api.get("customer/stats/gender");
    return res.data;
  },

  getAgeGroupStats: async () => {
    const res = await api.get("customer/stats/age-group");
    return res.data;
  },
};
