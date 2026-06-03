import axios, { type InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./tokenStore";
import { silentRefresh } from "./auth";
import { toast } from "react-toastify";


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4004/",
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
});

// Refresh-queue state

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

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — silent refresh on 401

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: InternalAxiosRequestConfig & { _retry?: boolean } =
      error.config;

    // Only handle 401s that haven't already been retried
    if (!error.response || error.response?.status !== 401 || original._retry) {
      // Show elegant toast notification for server errors, network errors, or other unhandled API errors
      if (!error.response) {
        toast.error("Network Error: Unable to connect to the server. Please check your internet connection.");
      } else {
        const status = error.response.status;
        const data = error.response.data;
        const errorMessage = data?.message || data?.error || error.message || "An unexpected error occurred.";

        if (status === 500) {
          toast.error(`Server Error (500): ${errorMessage}`);
        } else if (status === 403) {
          toast.error("Access Denied: You do not have permission to perform this action.");
        } else if (status !== 404 && status !== 401) {
          // Toast 400 Bad Request or other client/server errors, except 404 (Not Found) or 401 (handled by auth flow)
          toast.error(`Error: ${errorMessage}`);
        }
      }

      return Promise.reject(error);
    }

    // Skip silent refresh for login requests
    if (
      original.url?.includes("auth/login") ||
      original.url?.includes("auth/refresh")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    // If a refresh is already in flight, queue this request to retry after
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(
            axios({
              ...original,
              headers: {
                ...original.headers,
                Authorization: `Bearer ${token}`,
              },
            }),
          );
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
      // Redirect to login if the refresh token is also expired
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
