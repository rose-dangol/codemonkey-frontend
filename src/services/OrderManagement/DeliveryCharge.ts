import api from "@/api/ApiUrl";
import type {
  CreateDeliveryCharge,
  UpdateDeliveryCharge,
} from "@/TypeDefinitions/DeliveryDefinitons";

export const DeliveryService = {
  getAll: async () => {
    const res = await api.get(`delivery-charge/getAllDeliveryCharge`);
    return res.data;
  },

  create: async (data: CreateDeliveryCharge) => {
    const res = await api.post(`delivery-charge/createDeliveryCharge`, data);
    return res.data;
  },

  update: async (data: UpdateDeliveryCharge) => {
    const res = await api.put("delivery-charge/updateDeliveryCharge", data);
    return res.data;
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`delivery-charge/deleteDeliveryCharge`, {
      data: { ids: id },
    });
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
