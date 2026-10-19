"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { Photo } from "@/types/photo";

const cardWidth =
  "w-[calc(50vw-32px)] sm:w-[calc(33.33vw-30px)] lg:w-[calc(25vw-38px)] min-[1480px]:w-[332px]";

function PhotoGroup({ photos }: { photos: Photo[] }) {
  return (
    <div data-group className="flex shrink-0 gap-6 pr-6">
      {photos.map((p) => (
        <Link
          key={p.id}
          href={`/gallery/${p.id}`}
          aria-label={p.altText ?? p.title ?? "Xem ảnh"}
          className={`group/img relative block aspect-[4/5] shrink-0 overflow-hidden rounded-[14px] bg-dark-08 ${cardWidth}`}
        >
          <Image
            src={p.imageUrl}
            alt={p.altText ?? p.title ?? "Ảnh"}
            fill
            sizes="(min-width: 1480px) 332px, (min-width: 1024px) calc(25vw - 38px), (min-width: 640px) calc(33.33vw - 30px), calc(50vw - 32px)"
            className="object-cover transition-transform duration-300 group-hover/img:scale-105"
          />
        </Link>
      ))}
    </div>
  );
}

/**
 * Portfolio preview — heading + "Xem tất cả", then an auto-sliding photo
 * band that loops seamlessly using the same technique as CategoryMarquee:
 * enough identical copies to cover the viewport plus one group, translated
 * by exactly one group width (pauses on hover).
 */
export function PortfolioPreviewSection({ photos }: { photos: Photo[] }) {
  const [copies, setCopies] = useState(2);
  const trackRef = useRef<HTMLDivElement>(null);

  // Copies needed = ceil(viewport / groupWidth) + 1 (min 2), so the visible
  // window is always covered through a full one-group shift.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const group = track?.querySelector<HTMLElement>("[data-group]");
    const viewport = track?.parentElement;
    if (!track || !group || !viewport) return;
    const measure = () =>
      setCopies(Math.max(2, Math.ceil(viewport.clientWidth / group.offsetWidth) + 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(group);
    return () => ro.disconnect();
  }, [photos]);

  if (photos.length === 0) return null;
  return (
    <section aria-label="Portfolio preview" className="border-b border-dark-12">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 md:px-10 md:pt-20">
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
          <Link
            href="/gallery"
            className="hidden shrink-0 rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 sm:inline-block"
          >
            Xem tất cả ↗
          </Link>
        </div>
      </div>

      {/* Auto-sliding band — full-bleed so the loop never shows a gap at
          the section edges; cards keep the same responsive widths as the
          old manual scroller (2/3/4 visible columns). */}
      <div className="group relative mt-10 overflow-hidden pb-14 md:pb-20">
        <div
          ref={trackRef}
          className="animate-marquee-track flex w-max [--duration:60s] group-hover:[animation-play-state:paused]"
          style={{ "--copies": copies } as React.CSSProperties}
        >
          {Array.from({ length: copies }, (_, i) =>
            i === 0 ? (
              <PhotoGroup key={i} photos={photos} />
            ) : (
              <div key={i} aria-hidden="true" className="contents">
                <PhotoGroup photos={photos} />
              </div>
            ),
          )}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-dark-03 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-dark-03 to-transparent" />
      </div>
    </section>
  );
}
