import { describe, expect, it } from "vitest";
import {
  ADMIN_CATEGORY_SLUG,
  SCROLL_CATEGORY_SLUG,
  categoryLabel,
  isPackageCategory,
  isPublicPortfolioCategory,
  isPublicPortfolioPhoto,
  isScrollCategory,
  isScrollPhoto,
} from "./labels";
import type { Category } from "@/types/category";

const makeCat = (overrides: Partial<Category>): Category => ({
  id: 1,
  name: "Chân dung",
  slug: "chan-dung",
  sortOrder: 0,
  type: "PORTFOLIO",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("labels portfolio, package & scroll category filtering", () => {
  it("identifies package categories by explicit type or Gói/goi-/package naming", () => {
    expect(isPackageCategory(makeCat({ type: "PACKAGE", name: "Cá nhân", slug: "ca-nhan" }))).toBe(true);
    expect(isPackageCategory(makeCat({ type: "PORTFOLIO", name: "Gói - Cá nhân", slug: "goi-ca-nhan" }))).toBe(true);
    expect(isPackageCategory(makeCat({ type: "PORTFOLIO", name: "Gói - Nhóm 2", slug: "goi-nhom-2" }))).toBe(true);
    expect(isPackageCategory(makeCat({ type: "PORTFOLIO", name: "Chân dung", slug: "chan-dung" }))).toBe(false);
    expect(isPackageCategory(makeCat({ type: "PACKAGE", name: "Admin", slug: ADMIN_CATEGORY_SLUG }))).toBe(false);
  });

  it("identifies Scroll category by explicit SCROLL type or scroll slug/name", () => {
    expect(isScrollCategory(makeCat({ type: "SCROLL", name: "Scroll", slug: SCROLL_CATEGORY_SLUG }))).toBe(true);
    expect(isScrollCategory(makeCat({ type: "PORTFOLIO", name: "Scroll", slug: "scroll" }))).toBe(true);
    expect(isScrollCategory(makeCat({ type: "PORTFOLIO", name: "Chân dung", slug: "chan-dung" }))).toBe(false);
  });

  it("excludes Admin, FEEDBACK, SCROLL, and Package categories from public portfolio categories", () => {
    expect(isPublicPortfolioCategory(makeCat({ name: "Chân dung", slug: "chan-dung" }))).toBe(true);
    expect(isPublicPortfolioCategory(makeCat({ name: "Gói - Cá nhân", slug: "goi-ca-nhan" }))).toBe(false);
    expect(isPublicPortfolioCategory(makeCat({ type: "PACKAGE", name: "Nhóm 3", slug: "nhom-3" }))).toBe(false);
    expect(isPublicPortfolioCategory(makeCat({ type: "FEEDBACK", name: "Feedback", slug: "feedback" }))).toBe(false);
    expect(isPublicPortfolioCategory(makeCat({ type: "SCROLL", name: "Scroll", slug: SCROLL_CATEGORY_SLUG }))).toBe(false);
    expect(isPublicPortfolioCategory(makeCat({ type: "PORTFOLIO", name: "Scroll", slug: "scroll" }))).toBe(false);
    expect(isPublicPortfolioCategory(makeCat({ name: "Admin", slug: ADMIN_CATEGORY_SLUG }))).toBe(false);
  });

  it("excludes photos assigned to any package or scroll category from public portfolio", () => {
    const portrait = makeCat({ id: 1, name: "Chân dung", slug: "chan-dung" });
    const pkgCat = makeCat({ id: 2, name: "Gói - Cá nhân", slug: "goi-ca-nhan" });
    const scrollCat = makeCat({ id: 3, type: "SCROLL", name: "Scroll", slug: "scroll" });
    expect(isPublicPortfolioPhoto({ categories: [portrait] })).toBe(true);
    expect(isPublicPortfolioPhoto({ categories: [pkgCat] })).toBe(false);
    expect(isPublicPortfolioPhoto({ categories: [portrait, pkgCat] })).toBe(false);
    expect(isPublicPortfolioPhoto({ categories: [scrollCat] })).toBe(false);
    expect(isScrollPhoto({ categories: [scrollCat] })).toBe(true);
    expect(isScrollPhoto({ categories: [portrait] })).toBe(false);
  });

  it("formats categoryLabel without duplicating Gói prefix", () => {
    expect(categoryLabel(makeCat({ type: "PACKAGE", name: "Cá nhân", slug: "ca-nhan" }))).toBe("Gói · Cá nhân");
    expect(categoryLabel(makeCat({ type: "PORTFOLIO", name: "Gói - Cá nhân", slug: "goi-ca-nhan" }))).toBe(
      "Gói - Cá nhân",
    );
    expect(categoryLabel(makeCat({ type: "SCROLL", name: "Scroll", slug: "scroll" }))).toBe("Scroll");
  });
});
