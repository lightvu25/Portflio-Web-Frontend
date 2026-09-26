/**
 * Pricing endpoints.
 * Public: GET /api/pricing (active packages only, sortOrder asc)
 * Admin:  GET/POST /api/admin/pricing, PUT/DELETE /api/admin/pricing/{id}
 */

import { apiFetch } from "./client";
import type { PricingPackage, PricingPackageRequest } from "@/types/pricing";

export function getPricing(): Promise<PricingPackage[]> {
  return apiFetch<PricingPackage[]>("/api/pricing");
}

export function getAdminPricing(token: string): Promise<PricingPackage[]> {
  return apiFetch<PricingPackage[]>("/api/admin/pricing", { token });
}

export function createPricingPackage(token: string, request: PricingPackageRequest): Promise<PricingPackage> {
  return apiFetch<PricingPackage>("/api/admin/pricing", { method: "POST", body: request, token });
}

export function updatePricingPackage(token: string, id: number, request: PricingPackageRequest): Promise<PricingPackage> {
  return apiFetch<PricingPackage>(`/api/admin/pricing/${id}`, { method: "PUT", body: request, token });
}

/** 409 PACKAGE_IN_USE when referenced by bookings — deactivate instead. */
export function deletePricingPackage(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/api/admin/pricing/${id}`, { method: "DELETE", token });
}
