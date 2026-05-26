import { api } from "@/lib/api";

export const DashboardService = {
  getUserGrowth: async () => {
    const res = await api.get("customer/user-growth");
    return res.data;
  },
};
