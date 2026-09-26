/**
 * Types matching payment/dto/PaymentResponse.java and
 * payment/entity/PaymentStatus.java.
 */

export type PaymentStatus = "UNPAID" | "PAID";

/** GET /api/admin/payments response element. */
export interface PaymentResponse {
  id: number;
  bookingId: number;
  bookingCode: string;
  /** Deposit amount in VND. */
  amount: number;
  status: PaymentStatus;
  qrReference: string;
  qrImageUrl: string;
  paidAt: string | null;
  createdAt: string;
}
