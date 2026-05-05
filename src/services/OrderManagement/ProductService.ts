import api from "@/api/ApiUrl";
import type { UpdateBrandDto } from "@/TypeDefinitions/ModalType";
import { toast } from "react-toastify";

export const ProductService = {
    getAll: async () => {
        const res = await api.get("product/getAllProduct");
        return res.data;
    },

    getById: async (id: string) => {
        const res = await api.get(`product/getProduct/${id}`);
        return res.data;
    },

    create: async (data: UpdateBrandDto) => {
        try {
            const res = await api.post(`product/addProduct`, data);
            return res.data;
        } catch (error: any) {
            console.log(error);
            return error.message;
        }
    },

    update: async (id: string, data: UpdateBrandDto) => {
        try {
            const res = await api.put(`brand/updateBrand/${id}`, data);
            return res.data;
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update brand");
        }
    },

    delete: async (id: string[]) => {
        const res = await api.delete(`category/deleteCategory`, { data: { categoryId: id } });
        return res.data;
    },
};
