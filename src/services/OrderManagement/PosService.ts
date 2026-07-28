
import { api } from "@/lib/api";
import type { CheckoutPayload } from "@/TypeDefinitions/Pos";


export const PosService = {
  checkout: async (data: CheckoutPayload) => {
    const res = await api.post(`/pos-checkout`, data);
    return res.data;
  },
};
