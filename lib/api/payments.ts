/**
 * Admin payment endpoints: GET /api/admin/payments,
 * POST /api/admin/payments/{id}/mark-paid.
 * The public booking-status endpoint (lib/api/bookings.ts) exposes the
 * customer's payment info + VietQR image.
 */

import { apiFetch } from "./client";
import type { PaymentResponse } from "@/types/payment";

export function getPayments(token: string): Promise<PaymentResponse[]> {
  return apiFetch<PaymentResponse[]>("/api/admin/payments", { token });
}

export function markPaymentPaid(token: string, id: number): Promise<PaymentResponse> {
  return apiFetch<PaymentResponse>(`/api/admin/payments/${id}/mark-paid`, { method: "POST", token });
}
