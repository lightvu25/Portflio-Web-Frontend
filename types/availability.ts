/**
 * Types matching booking/dto/AvailabilityResponse.java and
 * booking/dto/SlotAvailabilityStatus.java.
 */

export type SlotAvailabilityStatus = "AVAILABLE" | "BOOKED" | "BLOCKED";

/** One element of GET /api/availability response. */
export interface AvailabilityResponse {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  morning: SlotAvailabilityStatus;
  afternoon: SlotAvailabilityStatus;
  fullDayAvailable: boolean;
}
