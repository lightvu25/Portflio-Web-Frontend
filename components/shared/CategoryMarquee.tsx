"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import {
  dispatchNavIntent,
  resolveCategoryHref,
  smoothScrollToElement,
} from "@/lib/navigation";
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

function CategoryGroup({
  names,
  knownCategories,
  ariaHidden,
  onSelectCategory,
}: {
  names: readonly string[];
  knownCategories: ReadonlyArray<Category | string> | null;
  ariaHidden?: boolean;
  onSelectCategory: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    label: string,
  ) => void;
}) {
  return (
    <div
      data-group
      aria-hidden={ariaHidden ? true : undefined}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {names.map((label, i) => {
        const href = resolveCategoryHref(label, knownCategories);
        return (
          <span
            key={`${label}-${i}`}
            className="flex items-center gap-8 whitespace-nowrap"
          >
            <Link
              href={href}
              onClick={(e) => onSelectCategory(e, href, label)}
              tabIndex={ariaHidden ? -1 : undefined}
              className="font-medium text-base font-medium uppercase tracking-[0.14em] text-brand-90 transition-colors hover:text-brand-55 md:text-lg"
            >
              {label}
            </Link>
            <span aria-hidden="true" className="text-brand-55">
              ✦
            </span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * Auto-scrolling photography category band — reused beneath the hero and
 * above the footer. Renders enough identical copies of the category sequence
 * to always cover the viewport plus one group, then translates the track by
 * exactly one group width via `.animate-marquee-track` (pauses on hover).
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
  const pathname = usePathname();
  const [fetchedCategories, setFetchedCategories] = useState<Category[] | null>(
    null,
  );
  const [copies, setCopies] = useState(2);
  const [inView, setInView] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = trackRef.current?.parentElement;
    if (!viewport || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px 0px" },
    );
    obs.observe(viewport);
    return () => obs.disconnect();
  }, []);

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

  // Copies needed = ceil(viewport / groupWidth) + 1 (min 2), so the visible
  // window is always covered through a full one-group shift.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const group = track?.querySelector<HTMLElement>("[data-group]");
    const viewport = track?.parentElement;
    if (!track || !group || !viewport) return;
    const measure = () =>
      setCopies(
        Math.max(2, Math.ceil(viewport.clientWidth / group.offsetWidth) + 1),
      );
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(group);
    return () => ro.disconnect();
  }, [list]);

  const handleSelectCategory = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    fallbackLabel: string,
  ) => {
    if (pathname === "/gallery") {
      e.preventDefault();
      window.history.pushState(null, "", href);
      const qIndex = href.indexOf("?");
      const queryCat =
        qIndex >= 0
          ? new URLSearchParams(href.slice(qIndex)).get("category")
          : fallbackLabel;
      dispatchNavIntent({
        type: "gallery-category",
        category: queryCat ?? fallbackLabel,
      });
      smoothScrollToElement("gallery-grid", 16);
    }
  };

  return (
    <div
      aria-label={ariaLabel}
      className="group relative overflow-hidden border-y border-dark-12 bg-dark-06 py-5"
    >
      <div
        ref={trackRef}
        className={`animate-marquee-track flex w-max [--duration:32s] group-hover:[animation-play-state:paused] ${
          inView ? "" : "[animation-play-state:paused]"
        }`}
        style={{ "--copies": copies } as React.CSSProperties}
      >
        {Array.from({ length: copies }, (_, i) => (
          <CategoryGroup
            key={i}
            names={list}
            knownCategories={knownCategories}
            ariaHidden={i > 0}
            onSelectCategory={handleSelectCategory}
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-dark-06 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-dark-06 to-transparent"
      />
    </div>
  );
}
