import axios, { type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./tokenStore";
import { silentRefresh } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4004/",
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
});

// ─── Refresh-queue state ────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];
let failQueue: Array<(err: unknown) => void> = [];

const processQueue = (token: string) => {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
  failQueue = [];
};

const rejectQueue = (err: unknown) => {
  failQueue.forEach((reject) => reject(err));
  refreshQueue = [];
  failQueue = [];
};

// ─── Request interceptor — attach Bearer token ──────────────────────────────

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — silent refresh on 401 ───────────────────────────

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: InternalAxiosRequestConfig & { _retry?: boolean } =
      error.config;

    // Only handle 401s that haven't already been retried
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    // If a refresh is already in flight, queue this request to retry after
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
        failQueue.push(reject);
      });
    }

    isRefreshing = true;

    try {
      const newToken = await silentRefresh();
      tokenStore.set(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      processQueue(newToken);
      return api(original);
    } catch (refreshError) {
      rejectQueue(refreshError);
      tokenStore.clear();
      // Redirect to login — the refresh token cookie is also expired/invalid
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
