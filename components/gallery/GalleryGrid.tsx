"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";

/** Vary tile aspect by index since the backend stores no ratio hint. */
const ratios = ["aspect-[3/4]", "aspect-square", "aspect-[16/10]"];

/**
 * Filterable portfolio grid — masonry columns with category chips.
 * Photos/categories come from GET /api/gallery + /api/categories.
 */
export function GalleryGrid({
  photos,
  categories,
  initialCategory,
}: {
  photos: Photo[];
  categories: Category[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState<string>(() => {
    if (!initialCategory) return "";
    const wanted = initialCategory.replace(/s$/i, "").toLowerCase();
    const match = categories.find(
      (c) => c.name.toLowerCase() === wanted || c.slug.toLowerCase() === wanted,
    );
    return match ? String(match.id) : "";
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const filtered = useMemo(
    () =>
      active === ""
        ? photos
        : photos.filter((p) => p.categories.some((c) => String(c.id) === active)),
    [active, photos],
  );

  // Smoothly animate filtered tiles when switching category tabs.
  useGSAP(
    () => {
      if (!mountedRef.current) {
        mountedRef.current = true;
        return;
      }
      const container = gridRef.current;
      if (!container) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>(".gallery-card", container);
      if (cards.length === 0) return;

      if (reduceMotion) {
        gsap.set(cards, { autoAlpha: 1, y: 0, clearProps: "transform,willChange" });
        return;
      }

      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 16, willChange: "transform, opacity" },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.025,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "transform,willChange",
        },
      );
    },
    { scope: gridRef, dependencies: [active] },
  );

  return (
    <div ref={gridRef}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo danh mục">
        {[{ id: "", name: "Tất cả" }, ...categories.map((c) => ({ id: String(c.id), name: c.name }))].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => setActive(c.id)}
            className={`rounded-[10px] px-4 py-2 font-medium text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 ${
              active === c.id
                ? "bg-brand-55/15 text-brand-55"
                : "bg-dark-08 text-grey-70 hover:bg-dark-15 hover:text-absolutewhite"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-8 columns-2 gap-4 md:columns-3 xl:columns-4">
        {filtered.map((p, i) => (
          <Link
            key={p.id}
            href={`/gallery/${p.id}`}
            aria-label={p.altText ?? p.title ?? "Xem ảnh"}
            className="gallery-card group relative mb-4 block break-inside-avoid overflow-hidden rounded-[14px] bg-dark-08"
          >
            <div className={`relative w-full ${ratios[i % ratios.length]}`}>
              <Image
                src={p.imageUrl}
                alt={p.altText ?? p.title ?? "Ảnh"}
                fill
                quality={100}
                sizes="(min-width: 1280px) 600px, (min-width: 768px) 60vw, 90vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-grey-40">
          Chưa có ảnh nào trong danh mục này.
        </p>
      )}
    </div>
  );
}
