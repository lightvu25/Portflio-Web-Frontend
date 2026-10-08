/**
 * Vietnamese UI labels for backend enums and shared UI text.
 * Domain values stay in English (PENDING, DRAFT, ...) — only labels change.
 */
import type { BookingStatus, SessionType, Slot } from "@/types/booking";
import type { PaymentStatus } from "@/types/payment";
import type { PhotoStatus } from "@/types/photo";

export const bookingStatusLabel: Record<BookingStatus, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
  EXPIRED: "Hết hạn",
};

export const bookingStatusColor: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-200 text-gray-600",
  COMPLETED: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-200 text-gray-500",
};

export const photoStatusLabel: Record<PhotoStatus, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã đăng",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
};

export const slotLabel: Record<Slot, string> = {
  MORNING: "Buổi sáng",
  AFTERNOON: "Buổi chiều",
};

export const sessionTypeLabel: Record<SessionType, string> = {
  HALF_DAY: "Nửa ngày",
  FULL_DAY: "Cả ngày",
};

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN");
}
