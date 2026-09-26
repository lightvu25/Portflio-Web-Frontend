/**
 * GET /api/availability?start=YYYY-MM-DD&end=YYYY-MM-DD — public.
 * Both params optional; defaults to today only. Max range: 62 days
 * (400 INVALID_RANGE beyond that or when end < start).
 */

import { apiFetch } from "./client";
import type { AvailabilityResponse } from "@/types/availability";

export function getAvailability(start?: string, end?: string): Promise<AvailabilityResponse[]> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const query = params.toString();
  return apiFetch<AvailabilityResponse[]>(`/api/availability${query ? `?${query}` : ""}`);
}
