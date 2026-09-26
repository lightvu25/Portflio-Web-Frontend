/**
 * Types matching the backend booking API.
 * Source: backend booking/dto + booking/entity (Booking JSON shape).
 */

export type Slot = "MORNING" | "AFTERNOON";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "EXPIRED";

export type SessionType = "HALF_DAY" | "FULL_DAY";

/** POST /api/bookings request body (booking/dto/BookingRequest.java). */
export interface BookingRequest {
  packageId: number;
  customerName: string;
  phone: string;
  instagram?: string;
  /** ISO date, YYYY-MM-DD. */
  bookingDate: string;
  /** Required for HALF_DAY packages; omit for FULL_DAY packages. */
  slot?: Slot;
  address: string;
  turnstileToken: string;
}

/**
 * Booking entity as serialized by the API (POST /api/bookings and
 * admin booking endpoints). `pricingPackage` is populated on creation
 * but serialized as null when lazy-loaded (jackson hibernate module).
 * `slots` is @JsonIgnore on the entity and never serialized.
 */
export interface Booking {
  id: number;
  bookingCode: string;
  pricingPackage: import("./pricing").PricingPackage | null;
  customerName: string;
  phone: string;
  instagram: string | null;
  address: string;
  status: BookingStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/bookings/{bookingCode} response (booking/dto/BookingStatusResponse.java). */
export interface BookingStatusResponse {
  bookingCode: string;
  status: BookingStatus;
  customerName: string;
  packageName: string;
  slots: BookingSlotInfo[];
  expiresAt: string | null;
  payment: BookingPaymentInfo | null;
}

export interface BookingSlotInfo {
  bookingDate: string;
  slot: Slot;
}

export interface BookingPaymentInfo {
  status: "UNPAID" | "PAID";
  amount: number;
  qrReference: string;
  qrImageUrl: string;
}
