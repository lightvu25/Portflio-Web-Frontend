/**
 * Booking endpoints.
 * Public: POST /api/bookings, GET /api/bookings/{bookingCode}
 * Admin:  GET /api/admin/bookings,
 *         POST /api/admin/bookings/{id}/confirm|reject|cancel|complete
 * Blocked slots (admin): GET/POST /api/admin/blocked-slots, DELETE /{id}
 */

import { apiFetch } from "./client";
import type { Booking, BookingRequest, BookingStatusResponse, Slot } from "@/types/booking";

// ---------- Public ----------

/** Creates a PENDING booking (30-min hold). 409 on slot conflict/blocked. */
export function createBooking(request: BookingRequest): Promise<Booking> {
  return apiFetch<Booking>("/api/bookings", { method: "POST", body: request });
}

export function getBookingStatus(bookingCode: string): Promise<BookingStatusResponse> {
  return apiFetch<BookingStatusResponse>(`/api/bookings/${encodeURIComponent(bookingCode)}`);
}

// ---------- Admin ----------

export function getAdminBookings(token: string): Promise<Booking[]> {
  return apiFetch<Booking[]>("/api/admin/bookings", { token });
}

export function confirmBooking(token: string, id: number): Promise<Booking> {
  return apiFetch<Booking>(`/api/admin/bookings/${id}/confirm`, { method: "POST", token });
}

export function rejectBooking(token: string, id: number): Promise<Booking> {
  return apiFetch<Booking>(`/api/admin/bookings/${id}/reject`, { method: "POST", token });
}

export function cancelBooking(token: string, id: number): Promise<Booking> {
  return apiFetch<Booking>(`/api/admin/bookings/${id}/cancel`, { method: "POST", token });
}

export function completeBooking(token: string, id: number): Promise<Booking> {
  return apiFetch<Booking>(`/api/admin/bookings/${id}/complete`, { method: "POST", token });
}

// ---------- Admin blocked slots ----------

export interface BlockedSlot {
  id: number;
  blockedDate: string;
  slot: Slot;
  reason: string | null;
  createdAt: string;
}

export interface BlockedSlotRequest {
  blockedDate: string;
  slot: Slot;
  reason?: string;
}

export function getBlockedSlots(token: string, start?: string, end?: string): Promise<BlockedSlot[]> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const query = params.toString();
  return apiFetch<BlockedSlot[]>(`/api/admin/blocked-slots${query ? `?${query}` : ""}`, { token });
}

export function blockSlot(token: string, request: BlockedSlotRequest): Promise<BlockedSlot> {
  return apiFetch<BlockedSlot>("/api/admin/blocked-slots", { method: "POST", body: request, token });
}

export function unblockSlot(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/api/admin/blocked-slots/${id}`, { method: "DELETE", token });
}
