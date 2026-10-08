"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";

const arrowBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-08 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite";

/**
 * Services carousel driven by backend categories — heading + arrows +
 * "Xem tất cả dịch vụ", one category at a time (name left, a photo from
 * that category right). Arrows cycle through categories.
 */
export function ServicesPreviewSection({ categories, photos }: { categories: Category[]; photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  if (categories.length === 0) return null;

  const category = categories[index % categories.length];
  const photo = photos.find((p) => p.categories.some((c) => c.id === category.id));
  const step = (dir: number) => setIndex((i) => (i + dir + categories.length) % categories.length);

  return (
    <section aria-label="Dịch vụ chụp ảnh" className="border-b border-dark-12">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        {/* Section header */}
        <div className="flex items-end justify-between gap-4 border-b border-dark-12 pb-8">
          <div>
            <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Dịch vụ
            </p>
            <h2 className="mt-3 font-semibold text-3xl font-semibold uppercase text-absolutewhite md:text-5xl">
              Dịch vụ chụp ảnh
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button type="button" onClick={() => step(-1)} aria-label="Dịch vụ trước" className={arrowBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Dịch vụ sau" className={arrowBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <Link
              href="/pricing"
              className="hidden rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 sm:inline-block"
            >
              Xem bảng giá ↗
            </Link>
          </div>
        </div>

        {/* Featured category */}
        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <Link
              href={`/gallery?category=${encodeURIComponent(category.name)}`}
              className="group inline-flex items-center gap-3"
            >
              <h3 className="font-semibold text-2xl font-semibold uppercase text-absolutewhite md:text-3xl">
                {category.name}
              </h3>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-55 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-7 text-grey-50">
              Bộ sưu tập {category.name.toLowerCase()} — xem các tác phẩm đã đăng trong danh mục này.
            </p>
            <Link
              href={`/gallery?category=${encodeURIComponent(category.name)}`}
              className="mt-8 inline-block rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15"
            >
              Xem bộ sưu tập ↗
            </Link>
          </div>
          {photo && (
            <Link href={`/gallery/${photo.id}`} className="group relative block overflow-hidden rounded-[14px] bg-dark-08">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[480px]">
                <Image
                  src={photo.imageUrl}
                  alt={photo.altText ?? photo.title ?? category.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
