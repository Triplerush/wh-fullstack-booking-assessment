import { apiClient } from "./client";

export function getLocations() {
  return apiClient.get("/locations/").then((r) => r.data);
}

export function getAmenities() {
  return apiClient.get("/amenities/").then((r) => r.data);
}
