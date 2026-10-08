"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";

function CategorySet({ names, className }: { names: string[]; className?: string }) {
  return (
    <div
      className={`animate-marquee flex shrink-0 items-center gap-8 [--duration:32s] [--gap:2rem] group-hover:[animation-play-state:paused] ${className ?? ""}`}
    >
      {names.map((label) => (
        <span key={label} className="flex items-center gap-8 whitespace-nowrap">
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
 * Auto-scrolling category band — two identical sets translate in a seamless
 * loop (pauses on hover). Names come from backend categories when not passed.
 */
export function CategoryMarquee({ categories }: { categories?: string[] }) {
  const [names, setNames] = useState<string[]>(categories ?? []);

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

  if (names.length === 0) return null;
  return (
    <div className="group relative overflow-hidden py-5">
      <div className="flex w-max gap-8">
        <CategorySet names={names} />
        <div aria-hidden="true">
          <CategorySet names={names} />
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-dark-06 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-dark-06 to-transparent" />
    </div>
  );
}
