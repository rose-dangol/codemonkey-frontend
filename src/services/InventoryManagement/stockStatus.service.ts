import { api } from "@/lib/api";
import type { StockStatusType } from "@/TypeDefinitions/InventoryManagement";
import { toast } from "react-toastify";

const base = "/stockStatus";

export const stockStatusService = {
  getAll: async () => {
    const res = await api.get(base);
    return res.data;
  },

  createStockStatus: async (
    payload: Pick<
      StockStatusType,
      "name" | "code" | "description" | "isActive"
    >,
  ) => {
    const res = await api.post(`${base}/addStockStatus`, payload);
    return res.data;
  },

  updateStockStatus: async (
    id: string,
    payload: Pick<
      StockStatusType,
      "name" | "code" | "description" | "isActive"
    >,
  ) => {
    try {
      const res = await api.put(`${base}/updateStockStatus/${id}`, payload);

      return res.data;
    } catch (error) {
      toast.error("Failed to update stock status");
      throw error;
    }
  },

  deleteStockStatus: async (id: string) => {
    try {
      const res = await api.delete(`${base}/deleteStockStatus/${id}`);

      return res.data;
    } catch (error) {
      toast.error("Failed to delete stock status");
      throw error;
    }
  },
};
