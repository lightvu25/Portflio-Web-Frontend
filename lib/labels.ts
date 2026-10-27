/**
 * Vietnamese UI labels for backend enums and shared UI text.
 * Domain values stay in English (PENDING, DRAFT, ...) — only labels change.
 */
import type { BookingStatus, SessionType, Slot } from "@/types/booking";
import type { Category } from "@/types/category";
import type { PaymentStatus } from "@/types/payment";
import type { PhotoStatus } from "@/types/photo";

/**
 * Slug of the reserved internal category (seeded by backend migration V10,
 * renamed to "Admin" in V11). It holds the photographer's self-introduction
 * photo only — never shown in public listings and never combined with other
 * categories on one photo.
 */
export const ADMIN_CATEGORY_SLUG = "admin-noi-bo";

export const isAdminCategory = (c: Category) => c.slug === ADMIN_CATEGORY_SLUG;

/**
 * True when a category represents a service package ("Gói dịch vụ") — either
 * via explicit `type === "PACKAGE"` or by naming/slug convention (`Gói ...`,
 * `goi-...`, `package...`) for categories created with the default type.
 */
export function isPackageCategory(c: Category): boolean {
  if (isAdminCategory(c) || c.type === "FEEDBACK") return false;
  if (c.type === "PACKAGE") return true;
  const slug = (c.slug ?? "").trim().toLowerCase();
  const name = (c.name ?? "").trim().toLowerCase();
  return (
    slug.startsWith("goi-") ||
    slug === "goi" ||
    slug.startsWith("package") ||
    name.startsWith("gói") ||
    name.startsWith("goi ") ||
    name.startsWith("goi-") ||
    name.startsWith("package")
  );
}

/**
 * True when a category belongs in the public portfolio (Homepage & Gallery),
 * excluding Admin, Feedback, and Package categories.
 */
export function isPublicPortfolioCategory(c: Category): boolean {
  return !isAdminCategory(c) && c.type !== "FEEDBACK" && !isPackageCategory(c);
}

/**
 * True when a photo should be shown in the public portfolio (Homepage & Gallery).
 * Excludes photos assigned to Admin, Feedback, or any Package category.
 */
export function isPublicPortfolioPhoto(p: { categories?: Category[] }): boolean {
  const cats = p.categories ?? [];
  return !cats.some(
    (c) => isAdminCategory(c) || c.type === "FEEDBACK" || isPackageCategory(c),
  );
}

/**
 * Display label for a category chip/select option. The reserved Admin
 * category shows plainly as "Admin" (never "Gói · Admin").
 */
export function categoryLabel(c: Category): string {
  if (isAdminCategory(c)) return "Admin";
  if (c.type === "FEEDBACK") return c.name;
  if (isPackageCategory(c)) {
    return /^gói\b/i.test(c.name.trim()) ? c.name : `Gói · ${c.name}`;
  }
  return c.name;
}

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
