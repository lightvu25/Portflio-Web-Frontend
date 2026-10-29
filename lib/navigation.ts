/**
 * Shared client/isomorphic navigation helpers:
 *  - Vietnamese category text normalization & matching (handles accents, slugs,
 *    and `Kỉ` <-> `Kỷ` orthographic variants across Marquee, Footer, and Gallery).
 *  - Same-route / hash navigation intents so clicking Header/Footer menu links
 *    always responds immediately even when already on the target route.
 */

import type { Category } from "@/types/category";

export const BAU_NAV_INTENT_EVENT = "bau:nav-intent";

export type BauNavIntentDetail =
  | { type: "pricing-overview" }
  | {
      type: "pricing-booking";
      packageId?: number;
      sessionType?: "HALF_DAY" | "FULL_DAY";
    }
  | { type: "gallery-category"; category: string | null };

/**
 * Normalizes a Vietnamese category name or slug into a canonical lookup key.
 * Unifies diacritics, `đ/Đ`, hyphens/underscores, and common `y`/`i` spelling
 * variants (e.g. "Kỉ yếu THPT" <-> "Kỷ yếu THPT" <-> "ky-yeu-thpt").
 */
export function normalizeCategoryKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\bky\b/g, "ki")
    .replace(/\bmys\b/g, "mi")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds a matching category from a list by normalized name or slug.
 */
export function findMatchingCategory<
  T extends { id: number | string; name: string; slug?: string },
>(query: string | null | undefined, categories: readonly T[]): T | undefined {
  if (!query) return undefined;
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  const target = normalizeCategoryKey(trimmed);
  const targetSingular = target.replace(/([a-z]{3,})s$/, "$1");

  return categories.find((c) => {
    const cName = normalizeCategoryKey(c.name);
    const cSlug = c.slug ? normalizeCategoryKey(c.slug) : "";
    return (
      cName === target ||
      cSlug === target ||
      cName === targetSingular ||
      cSlug === targetSingular
    );
  });
}

/**
 * Resolves the `/gallery?category=...` href for a display category label.
 */
export function resolveCategoryHref(
  label: string,
  available: ReadonlyArray<Category | string> | null | undefined,
): string {
  if (!available || available.length === 0) {
    return `/gallery?category=${encodeURIComponent(label)}`;
  }
  const normalizedTarget = normalizeCategoryKey(label);
  const matched = available.find((item) => {
    if (typeof item === "string") {
      return normalizeCategoryKey(item) === normalizedTarget;
    }
    const cName = normalizeCategoryKey(item.name);
    const cSlug = normalizeCategoryKey(item.slug);
    return cName === normalizedTarget || cSlug === normalizedTarget;
  });

  if (matched) {
    const matchedName = typeof matched === "string" ? matched : matched.name;
    return `/gallery?category=${encodeURIComponent(matchedName)}`;
  }
  return `/gallery?category=${encodeURIComponent(label)}`;
}

/** Broadcasts a same-page navigation intent to mounted page controllers. */
export function dispatchNavIntent(detail: BauNavIntentDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<BauNavIntentDetail>(BAU_NAV_INTENT_EVENT, { detail }),
  );
}

/** Measures the sticky header height if visible in the viewport. */
export function getStickyHeaderHeight(): number {
  if (typeof document === "undefined") return 0;
  const header = document.querySelector("header");
  if (!header) return 0;
  return Math.round(header.getBoundingClientRect().height);
}

/** Smoothly scrolls the window back to the very top (`scrollY = 0`). */
export function smoothScrollToTop(): void {
  if (typeof window === "undefined") return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({
    top: 0,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

/** Smoothly scrolls an element by ID into view below the sticky header. */
export function smoothScrollToElement(id: string, extraOffsetPx = 8): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  const headerH = getStickyHeaderHeight();
  const rect = el.getBoundingClientRect();
  const targetY = Math.max(0, Math.round(rect.top + window.scrollY - headerH - extraOffsetPx));
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({
    top: targetY,
    behavior: reduceMotion ? "auto" : "smooth",
  });
  return true;
}
