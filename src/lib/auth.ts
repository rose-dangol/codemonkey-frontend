import { api } from "./api";
import { tokenStore } from "./tokenStore";

// calls /auth/refresh -> backend reads the refreshToken from the cookie -> returns a new accessToken
export async function silentRefresh(): Promise<{ accessToken: string; outletId?: string }> {
  const response = await api.post<{ accessToken: string; outletId?: string }>("auth/refresh");
  return response.data;
}

// Login, returns accessToken and BE sets refreshToken as cookie
export async function loginUser(
  username: string,
  password: string,
): Promise<{ accessToken: string; outletId?: string }> {
  const response = await api.post<{ accessToken: string; outletId?: string }>("auth/login", {
    username,
    password,
  });

  tokenStore.set(response.data.accessToken);
  return response.data;
}

// BE invalidate the refresh token in the DB + clear the cookie
export async function logoutUser(): Promise<void> {
  try {
    await api.post("auth/logout");
  } finally {
    tokenStore.clear();
  }
}
