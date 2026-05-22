import api from "@/api/ApiUrl";

export const saleService = {
  getAll: async () => {
    const res = await api.get(`order/analytics`);
    return res.data;
  },

  getRevenueChart: async (
    startDate: string,
    endDate: string,
    granularity: "day" | "month" | "year" = "month",
  ) => {
    const res = await api.get(
      `order/revenue-chart?startDate=${startDate}&endDate=${endDate}&groupBy=${granularity}`,
    );
    return res.data;
  },

  getOrderChart: async (
    startDate: string,
    endDate: string,
    granularity: "day" | "month" | "year" = "month",
  ) => {
    const res = await api.get(
      `order/order-chart?startDate=${startDate}&endDate=${endDate}&groupBy=${granularity}`,
    );
    return res.data;
  },

  //   create: async (data: AttributeDefinitionType) => {
  //     const res = await api.post(`attribute/addAttribute`, data);
  //     return res.data;
  //   },

  //   update: async (id: string, data: AttributeDefinitionType) => {
  //     const res = await api.put(`attribute/updateAttribute/${id}`, data);
  //     return res.data;
  //   },

  //   delete: async (id: string[]) => {
  //     const res = await api.delete(`attribute/deleteAttribute/${id}`);
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
};
