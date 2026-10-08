"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Photo } from "@/types/photo";

const arrowBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-08 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite";

/**
 * Portfolio preview — reference layout: heading + arrows + "View All Works",
 * horizontal scrolling card row; title + year and a VIEW PROJECT link sit
 * under each image.
 */
export function PortfolioPreviewSection({ photos }: { photos: Photo[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    trackRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <section aria-label="Portfolio preview" className="border-b border-dark-12">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        {/* Section header */}
        <div className="flex items-end justify-between gap-4 border-b border-dark-12 pb-8">
          <div>
            <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Bộ sưu tập
            </p>
            <h2 className="mt-3 font-semibold text-3xl font-semibold uppercase text-absolutewhite md:text-5xl">
              Khám phá tác phẩm
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button type="button" onClick={() => scroll(-1)} aria-label="Scroll left" className={arrowBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Scroll right" className={arrowBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <Link
              href="/gallery"
              className="hidden rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 sm:inline-block"
            >
              Xem tất cả ↗
            </Link>
          </div>
        </div>

        {/* Scrolling cards */}
        <div
          ref={trackRef}
          className="mt-10 flex snap-x gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((p) => (
            <article key={p.id} className="w-[280px] shrink-0 snap-start sm:w-[320px]">
              <Link
                href={`/gallery/${p.id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[14px] bg-dark-08"
              >
                <Image
                  src={p.imageUrl}
                  alt={p.altText ?? p.title ?? "Ảnh"}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-base font-semibold text-absolutewhite">
                    {p.title ?? "Không tiêu đề"}
                  </h3>
                  <p className="mt-0.5 text-xs text-grey-40">
                    {p.categories[0]?.name}
                  </p>
                </div>
                <Link
                  href={`/gallery/${p.id}`}
                  className="shrink-0 font-medium text-xs font-medium uppercase tracking-[0.12em] text-grey-70 transition-colors hover:text-purple-55"
                >
                  Xem ảnh ↗
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
