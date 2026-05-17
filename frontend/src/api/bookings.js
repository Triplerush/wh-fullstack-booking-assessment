import { apiClient } from "./client";

export function createBooking(payload) {
  return apiClient.post("/bookings/", payload).then((r) => r.data);
}

export function getBookings() {
  return apiClient.get("/bookings/").then((r) => r.data);
}

export function getBooking(id) {
  return apiClient.get(`/bookings/${id}/`).then((r) => r.data);
}
