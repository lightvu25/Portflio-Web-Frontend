"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";

const arrowBtn =
  "absolute top-1/2 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60";

/**
 * Photo detail — image fills the left with prev/next controls
 * (buttons + arrow keys); service/package info + booking CTA on the right.
 */
export function PhotoDetail({
  photo,
  prevId,
  nextId,
  pkg,
}: {
  photo: Photo;
  prevId: string;
  nextId: string;
  pkg: PricingPackage | null;
}) {
  const router = useRouter();
  const category = photo.categories[0]?.name;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") router.push(`/gallery/${prevId}`);
      if (e.key === "ArrowRight") router.push(`/gallery/${nextId}`);
      if (e.key === "Escape") router.push("/gallery");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevId, nextId, router]);

  return (
    <section className="flex-1">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-10 md:px-10 lg:grid-cols-[3fr_2fr]">
        {/* Image + navigation */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-dark-12 bg-dark-08 lg:aspect-auto lg:min-h-[70vh]">
          <Image
            src={photo.imageUrl}
            alt={photo.altText ?? photo.title ?? "Ảnh"}
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
          <Link href={`/gallery/${prevId}`} aria-label="Ảnh trước" className={`${arrowBtn} left-4`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href={`/gallery/${nextId}`} aria-label="Ảnh sau" className={`${arrowBtn} right-4`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {photo.title && (
            <p className="absolute bottom-4 left-4 rounded-[8px] bg-black/50 px-3 py-1.5 font-medium text-xs font-medium text-white backdrop-blur">
              {photo.title}
            </p>
          )}
        </div>

        {/* Info panel */}
        <aside className="flex flex-col gap-6">
          <div>
            <Link
              href="/gallery"
              className="font-medium text-sm font-medium text-grey-50 transition-colors hover:text-absolutewhite"
            >
              ← Quay lại bộ sưu tập
            </Link>
            {category && (
              <p className="mt-6 font-medium text-sm font-medium uppercase tracking-[0.18em] text-purple-55">
                {category}
              </p>
            )}
            <h1 className="mt-2 font-semibold text-3xl font-semibold text-absolutewhite md:text-4xl">
              {photo.title ?? "Không tiêu đề"}
            </h1>
            {photo.description && (
              <p className="mt-3 text-sm leading-7 text-grey-50">
                {photo.description}
              </p>
            )}
          </div>

          <div className="rounded-[14px] border border-dark-12 bg-dark-08 p-6">
            <p className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
              Gói liên quan
            </p>
            {pkg ? (
              <>
                <h2 className="mt-2 font-semibold text-xl font-semibold text-absolutewhite">
                  {pkg.name}
                </h2>
                <p className="mt-1 text-sm text-grey-50">
                  {sessionTypeLabel[pkg.sessionType]} · {pkg.groupSize} người
                </p>
                <p className="mt-3 font-semibold text-2xl font-semibold text-purple-55">
                  {formatVnd(pkg.price)}
                </p>
                {pkg.description && (
                  <p className="mt-4 text-sm leading-6 text-grey-50">
                    {pkg.description}
                  </p>
                )}
                <Link
                  href={`/booking?package=${pkg.id}`}
                  className="mt-6 block rounded-[10px] bg-purple-55 py-3 text-center font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.02]"
                >
                  Đặt gói này
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-grey-50">
                  Chọn gói chụp phù hợp tại trang bảng giá.
                </p>
                <Link
                  href="/booking"
                  className="mt-6 block rounded-[10px] bg-purple-55 py-3 text-center font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.02]"
                >
                  Đặt lịch chụp
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
