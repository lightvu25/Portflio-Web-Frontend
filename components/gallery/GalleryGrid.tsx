"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";

/** Vary tile aspect by index since the backend stores no ratio hint. */
const ratios = ["aspect-[3/4]", "aspect-square", "aspect-[16/10]"];

/** Deterministic subtle Polaroid tilt angles (degrees) indexed by card position. */
const TILTS = [-2.2, 1.6, -1.3, 2.4, -1.8, 1.2];

/**
 * Filterable portfolio grid — masonry columns with category chips and
 * scroll-driven Polaroid/Instax instant-print reveal on each card.
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

  // Smoothly animate filtered tiles when switching category tabs (animates .gallery-card).
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

  // Scroll-driven Polaroid print slide & tilt effect (animates child .print while keeping photo 100% clear).
  useGSAP(
    () => {
      const container = gridRef.current;
      if (!container) return;
      const cards = gsap.utils.toArray<HTMLElement>(".gallery-card", container);
      if (cards.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card) => {
          const printEl = card.querySelector<HTMLElement>("[data-print]");
          if (!printEl) return;

          const tilt = Number(printEl.dataset.tilt ?? 0);

          gsap.fromTo(
            printEl,
            { y: 60, rotate: 0 },
            {
              y: 0,
              rotate: tilt,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "top 65%",
                scrub: true,
                fastScrollEnd: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        ScrollTrigger.refresh();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        cards.forEach((card) => {
          const printEl = card.querySelector<HTMLElement>("[data-print]");
          if (printEl) {
            const tilt = Number(printEl.dataset.tilt ?? 0);
            gsap.set(printEl, { y: 0, rotate: tilt });
          }
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: gridRef, dependencies: [active, filtered.length] },
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
      <div className="mt-10 columns-1 gap-6 sm:columns-2 md:columns-3 xl:columns-4">
        {filtered.map((p, i) => {
          const tilt = TILTS[i % TILTS.length];
          const categoryLabel = p.categories[0]?.name ?? "Bấu Chụp Choẹt";
          return (
            <Link
              key={p.id}
              href={`/gallery/${p.id}`}
              aria-label={p.altText ?? categoryLabel}
              className="gallery-card group relative mb-7 block break-inside-avoid p-1.5"
            >
              <div
                data-print
                data-tilt={tilt}
                style={{ transform: `rotate(${tilt}deg)` }}
                className="print relative rounded-[10px] bg-[#F7F5EE] p-2.5 pb-3.5 shadow-[0_14px_32px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-[0_20px_42px_rgba(107,142,90,0.28)]"
              >
                <div className={`relative w-full overflow-hidden rounded-[4px] bg-dark-12 ${ratios[i % ratios.length]}`}>
                  <Image
                    src={p.imageUrl}
                    alt={p.altText ?? categoryLabel}
                    fill
                    quality={100}
                    sizes="(min-width: 1280px) 1000px, (min-width: 768px) 75vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
                  <span className="truncate text-xs font-semibold tracking-[0.06em] text-[#2B2A26]">
                    {categoryLabel}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-[#7A7567]">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
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
