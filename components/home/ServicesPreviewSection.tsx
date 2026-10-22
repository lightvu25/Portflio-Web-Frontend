"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";

const arrowBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-08 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55";

const DEFAULT_PACKAGE_HIGHLIGHTS = [
  "Không giới hạn file chụp & full file đã căn chỉnh cơ bản",
  "Hậu kỳ 10 ảnh chi tiết theo concept",
  "Hỗ trợ súng bong bóng, hắt sáng, đèn flash & đèn giả nắng",
];

/**
 * Services showcase on the homepage — driven by active PricingPackage items
 * from GET /api/pricing. Displays one featured service package at a time in a
 * 2-column layout (package details + booking CTA on the left, cover/gallery
 * photo on the right) with prev/next arrow navigation.
 */
export function ServicesPreviewSection({
  packages,
  photos,
}: {
  packages: PricingPackage[];
  photos: Photo[];
}) {
  const sortedPackages = useMemo(
    () =>
      [...packages]
        .filter((p) => p.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [packages],
  );

  const groupCovers = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of sortedPackages) {
      if (p.coverImageUrl && !map.has(p.groupSize)) {
        map.set(p.groupSize, p.coverImageUrl);
      }
    }
    return map;
  }, [sortedPackages]);

  const [index, setIndex] = useState(0);
  if (sortedPackages.length === 0) return null;

  const currentIdx = index % sortedPackages.length;
  const pkg = sortedPackages[currentIdx];
  const fallbackPhoto =
    photos.length > 0 ? photos[currentIdx % photos.length] : null;
  const imageUrl =
    pkg.coverImageUrl ??
    groupCovers.get(pkg.groupSize) ??
    fallbackPhoto?.imageUrl ??
    null;

  const step = (dir: number) =>
    setIndex((i) => (i + dir + sortedPackages.length) % sortedPackages.length);

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
            <span className="hidden text-xs font-medium tabular-nums text-grey-50 md:inline-block">
              {String(currentIdx + 1).padStart(2, "0")} /{" "}
              {String(sortedPackages.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Gói dịch vụ trước"
              className={arrowBtn}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Gói dịch vụ sau"
              className={arrowBtn}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Link
              href="/pricing"
              className="hidden rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 sm:inline-block"
            >
              Xem bảng giá ↗
            </Link>
          </div>
        </div>

        {/* Featured service package */}
        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-brand-55/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-55">
                {sessionTypeLabel[pkg.sessionType]} · {pkg.groupSize} người
              </span>
            </div>

            <Link
              href={`/booking?package=${pkg.id}`}
              className="group mt-4 inline-flex items-center gap-3"
            >
              <h3 className="font-semibold text-2xl font-semibold uppercase text-absolutewhite md:text-4xl">
                {pkg.name}
              </h3>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-55 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 17L17 7M17 7H9M17 7v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>

            <p className="mt-3 font-semibold text-2xl font-semibold text-brand-55 md:text-3xl">
              {formatVnd(pkg.price)}
            </p>

            {pkg.description ? (
              <p className="mt-4 max-w-lg text-sm leading-7 text-grey-50">
                {pkg.description}
              </p>
            ) : (
              <p className="mt-4 max-w-lg text-sm leading-7 text-grey-50">
                Gói chụp {sessionTypeLabel[pkg.sessionType].toLowerCase()} dành cho{" "}
                {pkg.groupSize === 1 ? "cá nhân" : `nhóm ${pkg.groupSize} người`}{" "}
                — bao gồm trọn bộ quyền lợi thiết bị và hậu kỳ tiêu chuẩn của Bấu Chụp Choẹt.
              </p>
            )}

            <ul className="mt-5 space-y-2 text-sm text-grey-70">
              {DEFAULT_PACKAGE_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 text-brand-55">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/booking?package=${pkg.id}`}
                className="inline-flex items-center justify-center rounded-[10px] bg-brand-55 px-6 py-3 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-all hover:scale-[1.02] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
              >
                Đặt gói này
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-[10px] bg-dark-08 px-5 py-3 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
              >
                Xem chi tiết bảng giá ↗
              </Link>
            </div>
          </div>

          {imageUrl && (
            <Link
              href={`/booking?package=${pkg.id}`}
              className="group relative block overflow-hidden rounded-[14px] bg-dark-08"
            >
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[480px]">
                <Image
                  src={imageUrl}
                  alt={pkg.name}
                  fill
                  quality={100}
                  sizes="(min-width: 1280px) 800px, (min-width: 1024px) 60vw, 100vw"
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
