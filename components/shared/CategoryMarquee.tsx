"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getCategories } from "@/lib/api/categories";

function CategoryGroup({ names }: { names: string[] }) {
  return (
    <div data-group className="flex shrink-0 items-center gap-8 pr-8">
      {names.map((label, i) => (
        <span key={`${label}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
          <Link
            href={`/gallery?category=${encodeURIComponent(label)}`}
            className="font-medium text-base font-medium uppercase tracking-[0.14em] text-purple-90 transition-colors hover:text-purple-55 md:text-lg"
          >
            {label}
          </Link>
          <span aria-hidden="true" className="text-grey-40">✦</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Auto-scrolling category band. Renders enough identical copies of the
 * category sequence to always cover the viewport plus one group, then
 * translates the track by exactly one group width — a seamless loop with
 * no fixed pixel values (pauses on hover). Data-driven from backend
 * categories when not passed.
 */
export function CategoryMarquee({ categories }: { categories?: string[] }) {
  const [names, setNames] = useState<string[]>(categories ?? []);
  const [copies, setCopies] = useState(2);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categories) return;
    let cancelled = false;
    getCategories()
      .then((list) => {
        if (!cancelled) setNames(list.map((c) => c.name));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [categories]);

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
  }, [names]);

  if (names.length === 0) return null;
  return (
    <div className="group relative overflow-hidden py-5">
      <div
        ref={trackRef}
        className="animate-marquee-track flex w-max [--duration:32s] group-hover:[animation-play-state:paused]"
        style={{ "--copies": copies } as React.CSSProperties}
      >
        {Array.from({ length: copies }, (_, i) =>
          i === 0 ? (
            <CategoryGroup key={i} names={names} />
          ) : (
            <div key={i} aria-hidden="true" className="contents">
              <CategoryGroup names={names} />
            </div>
          ),
        )}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-dark-06 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-dark-06 to-transparent" />
    </div>
  );
}
