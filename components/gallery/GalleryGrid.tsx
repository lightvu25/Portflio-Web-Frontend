"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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

  const filtered = useMemo(
    () =>
      active === ""
        ? photos
        : photos.filter((p) => p.categories.some((c) => String(c.id) === active)),
    [active, photos],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo danh mục">
        {[{ id: "", name: "Tất cả" }, ...categories.map((c) => ({ id: String(c.id), name: c.name }))].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => setActive(c.id)}
            className={`rounded-[10px] px-4 py-2 font-medium text-sm font-medium transition-colors ${
              active === c.id
                ? "bg-purple-55/15 text-purple-55"
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
            className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-[14px] border border-dark-12 bg-dark-08"
          >
            <div className={`relative w-full ${ratios[i % ratios.length]}`}>
              <Image
                src={p.thumbnailUrl ?? p.imageUrl}
                alt={p.altText ?? p.title ?? "Ảnh"}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="absolute inset-x-0 bottom-0 flex items-baseline justify-between bg-gradient-to-t from-black/75 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="font-medium text-sm font-medium text-white">{p.title}</span>
              <span className="text-xs uppercase tracking-wider text-white/60">
                {p.categories[0]?.name}
              </span>
            </span>
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
