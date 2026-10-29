import { describe, expect, it } from "vitest";
import {
  findMatchingCategory,
  normalizeCategoryKey,
  resolveCategoryHref,
} from "./navigation";
import type { Category } from "@/types/category";

const ts = "2026-01-01T00:00:00Z";
const mockCategories: Category[] = [
  { id: 1, name: "Kỷ yếu THPT", slug: "ky-yeu-thpt", sortOrder: 1, type: "PORTFOLIO", createdAt: ts, updatedAt: ts },
  { id: 2, name: "Kỉ yếu THCS", slug: "ki-yeu-thcs", sortOrder: 2, type: "PORTFOLIO", createdAt: ts, updatedAt: ts },
  { id: 3, name: "Tốt nghiệp đại học", slug: "tot-nghiep-dai-hoc", sortOrder: 3, type: "PORTFOLIO", createdAt: ts, updatedAt: ts },
  { id: 4, name: "Áo dài", slug: "ao-dai", sortOrder: 4, type: "PORTFOLIO", createdAt: ts, updatedAt: ts },
  { id: 5, name: "Concept", slug: "concept", sortOrder: 5, type: "PORTFOLIO", createdAt: ts, updatedAt: ts },
];

describe("navigation category helpers", () => {
  it("normalizes Vietnamese diacritics, đ/Đ, hyphens, and Kỉ/Kỷ spelling variants", () => {
    expect(normalizeCategoryKey("Kỉ yếu THPT")).toBe("ki yeu thpt");
    expect(normalizeCategoryKey("Kỷ yếu THPT")).toBe("ki yeu thpt");
    expect(normalizeCategoryKey("ky-yeu-thpt")).toBe("ki yeu thpt");
    expect(normalizeCategoryKey("Áo dài")).toBe("ao dai");
    expect(normalizeCategoryKey("Tốt nghiệp đại học")).toBe("tot nghiep dai hoc");
  });

  it("matches categories regardless of accent, slug, or Kỉ/Kỷ spelling", () => {
    expect(findMatchingCategory("Kỉ yếu THPT", mockCategories)?.id).toBe(1);
    expect(findMatchingCategory("ky-yeu-thpt", mockCategories)?.id).toBe(1);
    expect(findMatchingCategory("Áo dài", mockCategories)?.id).toBe(4);
    expect(findMatchingCategory("ao-dai", mockCategories)?.id).toBe(4);
    expect(findMatchingCategory("Concepts", mockCategories)?.id).toBe(5);
    expect(findMatchingCategory("", mockCategories)).toBeUndefined();
    expect(findMatchingCategory(null, mockCategories)).toBeUndefined();
  });

  it("resolves canonical /gallery?category=... hrefs from available categories", () => {
    // Matches DB spelling ("Kỷ yếu THPT") even when Marquee label is "Kỉ yếu THPT"
    expect(resolveCategoryHref("Kỉ yếu THPT", mockCategories)).toBe(
      `/gallery?category=${encodeURIComponent("Kỷ yếu THPT")}`,
    );
    // Falls back to encoded label when categories have not loaded yet
    expect(resolveCategoryHref("Áo dài", null)).toBe(
      `/gallery?category=${encodeURIComponent("Áo dài")}`,
    );
  });
});
