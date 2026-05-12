import { api } from "./api";
import { tokenStore } from "./tokenStore";

/**
 * Calls POST /auth/refresh.
 * The backend reads the refreshToken from the httpOnly cookie automatically.
 * Returns a new short-lived accessToken.
 */
export async function silentRefresh(): Promise<string> {
  const response = await api.post<{ accessToken: string }>("auth/refresh");
  return response.data.accessToken;
}

/**
 * Login: sends credentials, receives { accessToken }.
 * The backend sets the refreshToken as an httpOnly cookie — nothing to store here.
 */
export async function loginUser(
  username: string,
  password: string,
): Promise<{ accessToken: string }> {
  const response = await api.post<{ accessToken: string }>("auth/login", {
    username,
    password,
  });

  tokenStore.set(response.data.accessToken);
  return response.data;
}

/**
 * Logout: tells the backend to invalidate the refresh token in the DB
 * and clear the httpOnly cookie, then wipes the in-memory access token.
 */
export async function logoutUser(): Promise<void> {
  try {
    await api.post("auth/logout");
  } finally {
    tokenStore.clear();
  }
}
