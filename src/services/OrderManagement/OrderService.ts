// OrderService.ts
import api from "@/api/ApiUrl";

export const OrderService = {
  getAll: async () => {
    const res = await api.get(`order`);
    return res.data;
  },

  getById: async (id: string | undefined) => {
    const res = await api.get(`order/${id}`);
    return res.data;
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`order/deleteOrder`, {
      data: { orderIds: id },
    });
    return res.data;
  },

  // ─── Order Status ────────────────────────────────────────────────────────

  confirm: async (id: string) => {
    const res = await api.post(`order/${id}/confirm`);
    return res.data;
  },

  process: async (id: string) => {
    const res = await api.post(`order/${id}/process`);
    return res.data;
  },

  ship: async (id: string, note?: string) => {
    const res = await api.post(`order/${id}/ship`, { note });
    return res.data;
  },

  deliver: async (id: string, note?: string) => {
    const res = await api.post(`order/${id}/deliver`, { note });
    return res.data;
  },

  cancel: async (id: string, reason?: string) => {
    const res = await api.post(`order/${id}/cancel`, { reason });
    return res.data;
  },

  refund: async (id: string, reason?: string) => {
    const res = await api.post(`order/${id}/refund`, { reason });
    return res.data;
  },

  // ─── Payment Status ──────────────────────────────────────────────────────

  markAwaitingVerification: async (id: string, note?: string) => {
    const res = await api.post(`order/${id}/payment/awaiting-verification`, {
      note,
    });
    return res.data;
  },

  markPaymentFailed: async (id: string, reason?: string) => {
    const res = await api.post(`order/${id}/payment/failed`, { reason });
    return res.data;
  },

  markPartiallyRefunded: async (id: string, note?: string) => {
    const res = await api.post(`order/${id}/payment/partially-refunded`, {
      note,
    });
    return res.data;
  },
};
