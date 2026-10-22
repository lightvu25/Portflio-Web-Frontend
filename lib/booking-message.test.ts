import { describe, expect, it } from "vitest";
import {
  buildBookingCopyMessage,
  formatShootDateVi,
  SOCIAL_CONTACT_LINKS,
} from "./booking-message";

describe("booking-message helper", () => {
  it("formats ISO shoot date as dd/mm/yyyy", () => {
    expect(formatShootDateVi("2026-11-15")).toBe("15/11/2026");
  });

  it("builds a complete message with PENDING status, note, and no secret tokens", () => {
    const msg = buildBookingCopyMessage({
      bookingCode: "BK-261115-ABCD",
      status: "PENDING",
      expiresAt: "2026-11-15T10:30:00Z",
      packageName: "Gói Cá nhân - Nửa ngày",
      sessionType: "HALF_DAY",
      groupSize: 1,
      packagePrice: 1300000,
      shootDate: "2026-11-15",
      slot: "MORNING",
      customerName: "Nguyễn Văn A",
      phone: "0912345678",
      instagram: "@nguyenvana",
      address: "Trường THPT Chu Văn An, Phường Thụy Khuê, Hà Nội",
      note: "Mình muốn chụp thêm với máy film cá nhân",
    });

    expect(msg).toContain("Mã đặt lịch: BK-261115-ABCD");
    expect(msg).toContain("Chờ xử lý (chưa xác nhận / chưa thanh toán cọc)");
    expect(msg).toContain("Thời hạn giữ chỗ tạm thời:");
    expect(msg).toContain("Gói chụp: Gói Cá nhân - Nửa ngày (Nửa ngày · 1 người)");
    expect(msg).toContain("1.300.000 VNĐ");
    expect(msg).toContain("Ngày dự kiến chụp: 15/11/2026");
    expect(msg).toContain("Buổi chụp: Buổi sáng");
    expect(msg).toContain("Họ tên bạn: Nguyễn Văn A");
    expect(msg).toContain("Số điện thoại: 0912345678");
    expect(msg).toContain("Instagram: @nguyenvana");
    expect(msg).toContain("Địa chỉ cụ thể: Trường THPT Chu Văn An, Phường Thụy Khuê, Hà Nội");
    expect(msg).toContain("Lưu ý với thợ: Mình muốn chụp thêm với máy film cá nhân");
    expect(msg).not.toContain("turnstile");
  });

  it("omits optional instagram and note when blank and formats FULL_DAY slot", () => {
    const msg = buildBookingCopyMessage({
      bookingCode: "BK-261115-EFGH",
      status: "PENDING",
      packageName: "Gói Nhóm 2 - Cả ngày",
      sessionType: "FULL_DAY",
      groupSize: 2,
      shootDate: "2026-12-01",
      customerName: "Trần Thị B",
      phone: "0987654321",
      instagram: "   ",
      address: "Đại học Bách Khoa, Phường Bách Khoa, Hà Nội",
      note: "  ",
    });

    expect(msg).toContain("Gói chụp: Gói Nhóm 2 - Cả ngày (Cả ngày · 2 người)");
    expect(msg).toContain("Buổi chụp: Cả ngày (Sáng + Chiều)");
    expect(msg).not.toContain("Instagram:");
    expect(msg).not.toContain("Lưu ý với thợ:");
  });

  it("exposes only confirmed social contact links without fabricated Zalo URLs", () => {
    expect(SOCIAL_CONTACT_LINKS.facebook).toBe("https://www.facebook.com/haibaudepzai");
    expect(SOCIAL_CONTACT_LINKS.instagram).toBe("https://www.instagram.com/bauu.chupchoet");
    expect("zalo" in SOCIAL_CONTACT_LINKS).toBe(false);
  });
});
