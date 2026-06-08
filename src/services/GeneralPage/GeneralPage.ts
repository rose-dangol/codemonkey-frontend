import api from "@/api/ApiUrl";
import type { GeneralPageDto } from "@/TypeDefinitions/GeneralPage";
import { toast } from "react-toastify";

export const GeneralPageService = {
  getAll: async () => {
    const res = await api.get(`generalPage/getAll`);
    return res.data;
  },

  getbyId: async (id: string) => {
    const res = await api.get(`generalPage/getById/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    try {
      const formData = new FormData();

      formData.append("heading", data.heading!);
      formData.append("slug", data.slug!);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.bannerImage instanceof File) {
        formData.append("bannerImage", data.bannerImage);
      }

      const res = await api.post(`generalPage/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create page");
    }
  },

  update: async (id: string, data: GeneralPageDto) => {
    try {
      const formData = new FormData();

      formData.append("heading", data.heading!);
      formData.append("slug", data.slug!);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.bannerImage instanceof File) {
        formData.append("bannerImage", data.bannerImage);
      }

      const res = await api.patch(`generalPage/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update page");
    }
  },

  delete: async (id: string[]) => {
    const res = await api.delete(`generalPage/delete`, { data: { id: id } });
    return res.data;
  },
};
