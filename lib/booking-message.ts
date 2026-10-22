import {
  bookingStatusLabel,
  formatVnd,
  sessionTypeLabel,
  slotLabel,
} from "./labels";
import type { BookingStatus, SessionType, Slot } from "../types/booking";

export interface BookingMessageInput {
  bookingCode: string;
  status: BookingStatus;
  expiresAt?: string | null;
  packageName: string;
  sessionType: SessionType;
  groupSize: number;
  packagePrice?: number | null;
  shootDate: string;
  slot?: Slot | null;
  customerName: string;
  phone: string;
  instagram?: string | null;
  address: string;
  note?: string | null;
}

export const SOCIAL_CONTACT_LINKS = {
  facebook: "https://www.facebook.com/haibaudepzai",
  instagram: "https://www.instagram.com/bauu.chupchoet",
} as const;

export function formatShootDateVi(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [yyyy, mm, dd] = parts;
  if (!yyyy || !mm || !dd) return isoDate;
  return `${dd}/${mm}/${yyyy}`;
}

export function formatHoldExpiryVi(expiresAt?: string | null): string | null {
  if (!expiresAt) return null;
  const parsed = new Date(expiresAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Builds a clean, customer-ready summary message from actual booking values.
 * Never includes Turnstile tokens, internal IDs, or unconfirmed payment claims.
 */
export function buildBookingCopyMessage(input: BookingMessageInput): string {
  const code = input.bookingCode.trim() || "Đang cấp mã";
  const statusText =
    input.status === "PENDING"
      ? `${bookingStatusLabel[input.status]} (chưa xác nhận / chưa thanh toán cọc)`
      : bookingStatusLabel[input.status];

  const slotText =
    input.sessionType === "FULL_DAY"
      ? "Cả ngày (Sáng + Chiều)"
      : input.slot
        ? slotLabel[input.slot]
        : sessionTypeLabel[input.sessionType];

  const lines: string[] = [
    "Xin chào Bấu Chụp Choẹt, mình vừa tạo yêu cầu đặt lịch trên website:",
    `- Mã đặt lịch: ${code}`,
    `- Trạng thái: ${statusText}`,
  ];

  const expiryText = formatHoldExpiryVi(input.expiresAt);
  if (expiryText && input.status === "PENDING") {
    lines.push(`- Thời hạn giữ chỗ tạm thời: đến ${expiryText}`);
  }

  lines.push(
    `- Gói chụp: ${input.packageName.trim()} (${sessionTypeLabel[input.sessionType]} · ${input.groupSize} người)`,
  );

  if (input.packagePrice != null) {
    lines.push(
      `- Giá gói niêm yết: ${formatVnd(input.packagePrice)} (chưa bao gồm phụ phí di chuyển nếu có)`,
    );
  }

  lines.push(
    `- Ngày dự kiến chụp: ${formatShootDateVi(input.shootDate)}`,
    `- Buổi chụp: ${slotText}`,
    `- Họ tên bạn: ${input.customerName.trim()}`,
    `- Số điện thoại: ${input.phone.trim()}`,
  );

  const trimmedIg = input.instagram?.trim();
  if (trimmedIg) {
    lines.push(`- Instagram: ${trimmedIg}`);
  }

  lines.push(`- Địa chỉ cụ thể: ${input.address.trim()}`);

  const trimmedNote = input.note?.trim();
  if (trimmedNote) {
    lines.push(`- Lưu ý với thợ: ${trimmedNote}`);
  }

  lines.push(
    "Nhờ Bấu kiểm tra lịch và hướng dẫn mình bước xác nhận đặt cọc nhé!",
  );

  return lines.join("\n");
}
