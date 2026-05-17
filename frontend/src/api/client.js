import axios from "axios";
import i18n from "../i18n";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const ACCESS_KEY = "wh.access";
export const REFRESH_KEY = "wh.refresh";
export const LANG_KEY = "wh.lang";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.params = config.params ?? {};
  if (config.params.lang === undefined) {
    config.params.lang = localStorage.getItem(LANG_KEY) ?? i18n.language ?? "es";
  }
  return config;
});

let refreshing = null;

async function refreshAccess() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("no-refresh-token");
  if (!refreshing) {
    refreshing = axios
      .post(`${BASE_URL}/auth/refresh/`, { refresh })
      .then((res) => {
        setTokens({ access: res.data.access });
        return res.data.access;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status === 401 && original && !original._retry && !original.url?.includes("/auth/")) {
      original._retry = true;
      try {
        const newAccess = await refreshAccess();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      } catch (_refreshError) {
        clearTokens();
        window.dispatchEvent(new Event("auth:expired"));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
