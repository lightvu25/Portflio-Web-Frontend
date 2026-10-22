"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";

/**
 * Confirmed customer-facing marquee categories from the owner's specification.
 */
export const MARQUEE_CATEGORIES: readonly string[] = [
  "Kỉ yếu THCS",
  "Kỉ yếu THPT",
  "Tốt nghiệp đại học",
  "Áo dài",
  "Concept",
];

function normalizeCategoryText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function resolveCategoryHref(
  label: string,
  available: ReadonlyArray<Category | string> | null,
): string {
  if (!available || available.length === 0) {
    return `/gallery?category=${encodeURIComponent(label)}`;
  }
  const target = normalizeCategoryText(label);
  const matched = available.find((item) => {
    if (typeof item === "string") {
      return normalizeCategoryText(item) === target;
    }
    const cName = normalizeCategoryText(item.name);
    const cSlug = item.slug.toLowerCase().replace(/-/g, " ").trim();
    return cName === target || cSlug === target;
  });
  if (matched) {
    const matchedName = typeof matched === "string" ? matched : matched.name;
    return `/gallery?category=${encodeURIComponent(matchedName)}`;
  }
  return "/gallery";
}

/**
 * Auto-scrolling photography category band — reused beneath the hero and
 * above the footer. Each item links to `/gallery?category=<Name>` when a
 * matching category exists in the backend, or `/gallery` otherwise so the
 * visitor never lands on an accidental empty filter.
 */
export function CategoryMarquee({
  categories = MARQUEE_CATEGORIES,
  availableCategories,
  ariaLabel = "Danh mục nhiếp ảnh",
}: {
  categories?: readonly string[];
  availableCategories?: ReadonlyArray<Category | string>;
  ariaLabel?: string;
}) {
  const [fetchedCategories, setFetchedCategories] = useState<Category[] | null>(
    null,
  );

  useEffect(() => {
    if (availableCategories) return;
    let cancelled = false;
    getCategories()
      .then((list) => {
        if (!cancelled) setFetchedCategories(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [availableCategories]);

  const knownCategories = availableCategories ?? fetchedCategories;
  const list = categories.length > 0 ? categories : MARQUEE_CATEGORIES;
  // Repeat enough times that one copy is always wider than a 1920px viewport.
  const track = Array.from({ length: 4 }, () => list).flat();

  const renderCopy = (copyIndex: number) => (
    <ul
      key={copyIndex}
      aria-hidden={copyIndex > 0 ? true : undefined}
      className="flex shrink-0 items-center gap-8"
    >
      {track.map((cat, i) => (
        <li key={`${cat}-${i}`} className="flex shrink-0 items-center gap-8">
          <span aria-hidden="true" className="text-brand-55">
            ✦
          </span>
          <Link
            href={resolveCategoryHref(cat, knownCategories)}
            tabIndex={copyIndex > 0 ? -1 : undefined}
            className="text-sm font-normal uppercase tracking-[0.14em] text-grey-80 transition-colors hover:text-brand-55"
          >
            {cat}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      aria-label={ariaLabel}
      className="relative overflow-hidden border-y border-dark-12 bg-dark-06 py-4"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-dark-06 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-dark-06 to-transparent" />
      <div className="animate-marquee flex w-max items-center gap-8">
        {renderCopy(0)}
        {renderCopy(1)}
      </div>
    </div>
  );
}
