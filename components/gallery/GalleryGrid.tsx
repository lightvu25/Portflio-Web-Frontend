"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";

/**
 * Filterable scroll-driven portfolio grid with camera-print photo frames.
 * Photos and categories are fetched dynamically from GET /api/gallery + /api/categories.
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
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(
    () =>
      active === ""
        ? photos
        : photos.filter((p) => p.categories.some((c) => String(c.id) === active)),
    [active, photos],
  );

  const handleImageLoad = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

  // Scroll-driven column reveal + convergence inspired by the Sticky Grid Scroll template.
  useGSAP(
    () => {
      const container = gridRef.current;
      if (!container) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-gallery-card]", container);
      if (cards.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {};

          if (reduceMotion) {
            gsap.set(cards, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              clearProps: "transform,willChange",
            });
            return;
          }

          const numCols = isDesktop ? 3 : 2;

          cards.forEach((card, index) => {
            const colIndex = index % numCols;
            const fromX =
              numCols === 3
                ? colIndex === 0
                  ? -22
                  : colIndex === 2
                    ? 22
                    : 0
                : colIndex === 0
                  ? -12
                  : 12;
            const fromY = numCols === 3 && colIndex === 1 ? 56 : 38;

            gsap.fromTo(
              card,
              {
                autoAlpha: 0.12,
                x: fromX,
                y: fromY,
                scale: 0.94,
              },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                ease: "power2.out",
                overwrite: "auto",
                scrollTrigger: {
                  trigger: card,
                  start: "top 95%",
                  end: "top 64%",
                  scrub: 0.35,
                  invalidateOnRefresh: true,
                },
              },
            );
          });

          ScrollTrigger.refresh();
        },
      );

      return () => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        mm.revert();
      };
    },
    { scope: gridRef, dependencies: [active, filtered.length], revertOnUpdate: true },
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
            className={`rounded-[10px] px-4 py-2 font-medium text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 ${
              active === c.id
                ? "bg-brand-55/15 text-brand-55"
                : "bg-dark-08 text-grey-70 hover:bg-dark-15 hover:text-absolutewhite"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-5 md:mt-10 md:grid-cols-3 md:gap-7">
        {filtered.map((p, i) => {
          const categoryLabel = p.categories[0]?.name ?? "Bấu Graphy";
          const frameNumber = String(i + 1).padStart(2, "0");

          return (
            <Link
              key={p.id}
              href={`/gallery/${p.id}`}
              data-gallery-card
              aria-label={p.altText ?? p.title ?? `Xem ảnh ${frameNumber}`}
              className="gallery-card group relative flex flex-col rounded-[10px] border border-dark-15 bg-[#FAF9F5] p-2 pb-2.5 shadow-[0_12px_30px_-14px_rgba(18,18,20,0.16)] transition-[box-shadow,border-color] duration-300 hover:border-brand-55/60 hover:shadow-[0_20px_40px_-14px_rgba(107,142,90,0.26)] sm:p-2.5 sm:pb-3 md:p-3 md:pb-3.5"
            >
              {/* Camera print inner emulsion window */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-dark-08 ring-1 ring-black/10">
                <Image
                  src={p.imageUrl}
                  alt={p.altText ?? p.title ?? "Ảnh"}
                  fill
                  quality={100}
                  sizes="(min-width: 1280px) 440px, (min-width: 768px) 33vw, 50vw"
                  onLoad={handleImageLoad}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </div>

              {/* Camera print bottom margin metadata */}
              <div className="mt-2 flex items-center justify-between gap-2 px-0.5 sm:mt-2.5">
                <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-grey-50 sm:text-[11px]">
                  {categoryLabel}
                </span>
                <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-grey-40 transition-colors duration-200 group-hover:text-brand-55 sm:text-[11px]">
                  #{frameNumber} ↗
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-grey-40">
          Chưa có ảnh nào trong danh mục này.
        </p>
      )}
    </div>
  );
}
