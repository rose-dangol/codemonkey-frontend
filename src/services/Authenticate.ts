import api from "@/api/ApiUrl";

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
  const response = await api.post("auth/register", payload);
  const user: User = response.data;
  if (payload.file) {
    const formData = new FormData();
    formData.append("file", payload.file);

    await api.post(`users/${user.id}/cover-picture`, formData, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });
  }

  return user;
};
