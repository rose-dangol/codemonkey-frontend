import api from "@/api/ApiUrl";
import type { UpdateNavigationItemDto } from "@/TypeDefinitions/NavigationItem";

export const NavigationItemService = {
  getAll: async () => {
    const res = await api.get(`navigation-items/getAll`);
    return res.data;
  },

  getbyId: async (id: string) => {
    const res = await api.get(`navigation-items/getById/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post(`navigation-items/create`, data);
    return res.data;
  },

  update: async (id: string, data: UpdateNavigationItemDto) => {
    const res = await api.patch(`navigation-items/update/${id}`, data);
    return res.data;
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`navigation-items/delete`, {
      data: { id: id },
    });
    return res.data;
  },
};
