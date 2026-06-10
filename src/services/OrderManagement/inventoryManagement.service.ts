import { api } from "@/lib/api";
import type {
  AdjustPayload,
  InventoryDashboardSummary,
  RestockPayload,
  TransactionListParams,
  TransferPayload,
} from "@/TypeDefinitions/InventoryManagement";

export const InventoryService = {
  getInventoryList: async () => {
    const res = await api.get("/inventory");
    return res;
  },

  getVariantDetail: async (id: string) => {
    const res = await api.get(`/inventory/variant/${id}`);
    return res.data;
  },

  getTransactions: async (params?: TransactionListParams) => {
    const res = await api.get("/inventory/transactions/all", {
      params,
    });
    return res.data;
  },

  restock: async (payload: RestockPayload) => {
    const res = await api.post("/inventory/restock", payload);
    return res.data;
  },

  transfer: async (payload: TransferPayload) => {
    const res = await api.post("/inventory/transfer", payload);
    return res.data;
  },

  adjust: async (payload: AdjustPayload) => {
    const res = await api.patch("/inventory/adjust", payload);
    return res.data;
  },

  // todo: need to fix
  getDashboardSummary: async (): Promise<InventoryDashboardSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const items = getItems();

    const productIds = new Set(items.map((i) => i.productId));
    const totalProducts = productIds.size;
    const totalVariants = items.length;

    const totalAvailableStock = items.reduce(
      (sum, item) => sum + (item.stockByCode["AVAILABLE"] ?? 0),
      0,
    );
    const totalDamagedStock = items.reduce(
      (sum, item) => sum + (item.stockByCode["DAMAGED"] ?? 0),
      0,
    );
    const totalReservedStock = items.reduce(
      (sum, item) => sum + (item.stockByCode["RESERVED"] ?? 0),
      0,
    );

    const lowStockVariants = items.filter((item) => {
      const avail = item.stockByCode["AVAILABLE"] ?? 0;
      return avail > 0 && avail <= 5;
    }).length;

    const outOfStockVariants = items.filter(
      (item) => item.totalStock === 0,
    ).length;

    return {
      totalProducts,
      totalVariants,
      totalAvailableStock,
      totalDamagedStock,
      totalReservedStock,
      lowStockVariants,
      outOfStockVariants,
    };
  },
};
