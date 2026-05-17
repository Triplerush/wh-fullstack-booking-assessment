import { apiClient } from "./client";

export function register(payload) {
  return apiClient.post("/auth/register/", payload).then((r) => r.data);
}

export function login(payload) {
  return apiClient.post("/auth/login/", payload).then((r) => r.data);
}

export function refresh(payload) {
  return apiClient.post("/auth/refresh/", payload).then((r) => r.data);
}

export function me() {
  return apiClient.get("/auth/me/").then((r) => r.data);
}

export function logout(payload) {
  return apiClient.post("/auth/logout/", payload).then((r) => r.data);
}
