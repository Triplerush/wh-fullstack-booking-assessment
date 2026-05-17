import { apiClient } from "./client";

export function getProperties(filters = {}) {
  const params = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === "") continue;
    params[k] = v;
  }
  return apiClient.get("/properties/", { params }).then((r) => r.data);
}

export function getProperty(slug) {
  return apiClient.get(`/properties/${slug}/`).then((r) => r.data);
}

export function checkAvailability(slug, payload) {
  return apiClient
    .post(`/properties/${slug}/check-availability/`, payload)
    .then((r) => r.data);
}
