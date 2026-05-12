import api from "@/api/ApiUrl";
import { tokenStore } from "@/lib/tokenStore";

export interface User {
  id: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  coverPicture?: string;
}

export const RegisterUser = async (payload: {
  username: string;
  passwordHash: string;
  file: File | null;
}) => {
  const { file, ...registerPayload } = payload;
  const response = await api.post("auth/register", registerPayload);
  const { accessToken, id } = response.data;

  tokenStore.set(accessToken);

  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`users/${id}/cover-picture`, formData);
  }
  return response.data;
};

export const LoginUser = async (payload: {
  username: string;
  password: string;
}) => {
  const response = await api.post("auth/login/", payload);
  return response.data;
};
