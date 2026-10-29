"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";

const arrowBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-08 text-grey-80 transition-[transform,background-color,color] duration-200 hover:scale-105 hover:bg-dark-15 hover:text-absolutewhite active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55";

const DEFAULT_PACKAGE_HIGHLIGHTS = [
  "Không giới hạn file chụp & full file đã căn chỉnh cơ bản",
  "Hậu kỳ 10 ảnh chi tiết theo concept",
  "Hỗ trợ súng bong bóng, hắt sáng, đèn flash & đèn giả nắng",
];

/** Pointer travel (px) before a press becomes a drag (so plain clicks still work). */
const DRAG_THRESHOLD_PX = 6;
/** Horizontal drag distance (px) required to switch to the next/previous package. */
const SWIPE_THRESHOLD_PX = 48;
/** Minimum flick velocity (px/ms) to switch package even on a shorter drag. */
const FLICK_VELOCITY_PX_PER_MS = 0.4;

/**
 * Services showcase on the homepage — driven by active PricingPackage items
 * from GET /api/pricing. Displays one featured service package at a time in a
 * 2-column layout with directional GSAP slide+fade animations on arrow clicks
 * and interactive pointer/touch drag-to-swipe.
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
  const [dragging, setDragging] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  /** Direction of the latest navigation: 1 = next (right), -1 = prev (left). */
  const dirRef = useRef<1 | -1>(1);
  /** Skip entrance animation on initial SSR/mount; animate only on package switches. */
  const shouldAnimateInRef = useRef(false);
  const isAnimatingOutRef = useRef(false);

  // Pointer drag state refs (mutated at 60fps without triggering React renders).
  const pressedRef = useRef(false);
  const draggedRef = useRef(false);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  const count = sortedPackages.length;
  const currentIdx = count > 0 ? ((index % count) + count) % count : 0;

  // Clean up any active slide tweens when the section unmounts.
  useGSAP(
    () => {
      const slide = slideRef.current;
      return () => {
        if (slide) gsap.killTweensOf(slide);
      };
    },
    { scope: sectionRef },
  );

  // Animate incoming package whenever `currentIdx` changes after user navigation.
  useGSAP(
    () => {
      if (!shouldAnimateInRef.current) return;
      shouldAnimateInRef.current = false;
      isAnimatingOutRef.current = false;

      const slide = slideRef.current;
      if (!slide) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(slide, { autoAlpha: 1, x: 0, clearProps: "transform,willChange" });
        return;
      }

      const dir = dirRef.current;
      const q = gsap.utils.selector(slide);
      const items = q(".svc-item");
      const media = q(".svc-media");

      gsap.killTweensOf([slide, ...items, ...media]);

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto" },
        onComplete: () => {
          gsap.set([slide, ...items, ...media], { clearProps: "transform,willChange" });
        },
      });

      tl.fromTo(
        slide,
        { autoAlpha: 0, x: dir * 48, willChange: "transform, opacity" },
        { autoAlpha: 1, x: 0, duration: 0.42 },
        0,
      );

      if (items.length > 0) {
        tl.fromTo(
          items,
          { autoAlpha: 0, x: dir * 24, willChange: "transform, opacity" },
          { autoAlpha: 1, x: 0, duration: 0.42, stagger: 0.035 },
          0.02,
        );
      }

      if (media.length > 0) {
        tl.fromTo(
          media,
          { autoAlpha: 0, x: dir * 36, scale: 0.975, willChange: "transform, opacity" },
          { autoAlpha: 1, x: 0, scale: 1, duration: 0.48 },
          0,
        );
      }

      const counter = sectionRef.current?.querySelector(".svc-counter");
      if (counter) {
        gsap.fromTo(
          counter,
          { y: dir * 6, autoAlpha: 0.35 },
          { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out", overwrite: "auto", clearProps: "transform" },
        );
      }
    },
    { scope: sectionRef, dependencies: [currentIdx] },
  );

  const navigate = useCallback(
    (dir: 1 | -1, fromDrag = false) => {
      if (count <= 1) return;
      dirRef.current = dir;
      shouldAnimateInRef.current = true;

      const slide = slideRef.current;
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!slide || reduceMotion || isAnimatingOutRef.current) {
        if (slide) gsap.killTweensOf(slide);
        isAnimatingOutRef.current = false;
        setIndex((i) => (i + dir + count) % count);
        return;
      }

      isAnimatingOutRef.current = true;
      gsap.killTweensOf(slide);
      gsap.to(slide, {
        x: -dir * (fromDrag ? 72 : 44),
        autoAlpha: 0,
        duration: fromDrag ? 0.13 : 0.16,
        ease: "power2.in",
        overwrite: "auto",
        onComplete: () => {
          setIndex((i) => (i + dir + count) % count);
        },
      });
    },
    [count],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      navigate(dir, false);
    },
    [navigate],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (count <= 1 || isAnimatingOutRef.current) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('a, button, [role="button"]')) return;
      pressedRef.current = true;
      draggedRef.current = false;
      startXRef.current = e.clientX;
      startTimeRef.current = performance.now();
    },
    [count],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pressedRef.current) return;
      const stage = stageRef.current;
      const slide = slideRef.current;
      if (!stage || !slide) return;

      const dx = e.clientX - startXRef.current;
      if (!draggedRef.current) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
        draggedRef.current = true;
        setDragging(true);
        gsap.killTweensOf(slide);
        try {
          stage.setPointerCapture(e.pointerId);
        } catch {
          /* pointer already released */
        }
      }

      const dampedX = dx * 0.58;
      const alpha = gsap.utils.clamp(0.55, 1, 1 - Math.abs(dx) / 540);
      gsap.set(slide, {
        x: dampedX,
        autoAlpha: alpha,
        willChange: "transform, opacity",
      });
    },
    [],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pressedRef.current) return;
      pressedRef.current = false;

      const stage = stageRef.current;
      const slide = slideRef.current;
      if (stage) {
        try {
          stage.releasePointerCapture(e.pointerId);
        } catch {
          /* not captured */
        }
      }

      if (!draggedRef.current) return;
      setDragging(false);

      const dx = e.clientX - startXRef.current;
      const dt = Math.max(1, performance.now() - startTimeRef.current);
      const velocity = Math.abs(dx) / dt;

      if (
        count > 1 &&
        (Math.abs(dx) >= SWIPE_THRESHOLD_PX ||
          (velocity >= FLICK_VELOCITY_PX_PER_MS && Math.abs(dx) >= 20))
      ) {
        const dir: 1 | -1 = dx < 0 ? 1 : -1;
        navigate(dir, true);
      } else if (slide) {
        gsap.to(slide, {
          x: 0,
          autoAlpha: 1,
          duration: 0.36,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "transform,willChange",
        });
      }
    },
    [count, navigate],
  );

  /** Swallow the synthetic click that follows a real drag; plain clicks pass through. */
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      draggedRef.current = false;
    }
  }, []);

  if (count === 0) return null;

  const pkg = sortedPackages[currentIdx];
  const fallbackPhoto = photos.length > 0 ? photos[currentIdx % photos.length] : null;
  const imageUrl =
    pkg.coverImageUrl ??
    groupCovers.get(pkg.groupSize) ??
    fallbackPhoto?.imageUrl ??
    null;

  return (
    <section
      ref={sectionRef}
      aria-label="Dịch vụ chụp ảnh"
      className="overflow-hidden border-b border-dark-12"
    >
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
            <span className="svc-counter hidden text-xs font-medium tabular-nums text-grey-50 md:inline-block">
              {String(currentIdx + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
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

        {/* Featured service package — supports arrow navigation + horizontal drag/swipe */}
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          className={`mt-10 touch-pan-y select-none ${
            count > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
        >
          <div
            ref={slideRef}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2"
          >
            <div>
              <div className="svc-item flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-brand-55/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-55">
                  {sessionTypeLabel[pkg.sessionType]} · {pkg.groupSize} người
                </span>
              </div>

              <div className="svc-item">
                <Link
                  href={`/pricing?package=${pkg.id}#booking`}
                  draggable={false}
                  className="group mt-4 inline-flex items-center gap-3"
                >
                  <h3 className="font-semibold text-2xl font-semibold uppercase text-absolutewhite md:text-4xl">
                    {pkg.name}
                  </h3>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-55 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
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
              </div>

              <p className="svc-item mt-3 font-semibold text-2xl font-semibold text-brand-55 md:text-3xl">
                {formatVnd(pkg.price)}
              </p>

              {pkg.description ? (
                <p className="svc-item mt-4 max-w-lg text-sm leading-7 text-grey-50">
                  {pkg.description}
                </p>
              ) : (
                <p className="svc-item mt-4 max-w-lg text-sm leading-7 text-grey-50">
                  Gói chụp {sessionTypeLabel[pkg.sessionType].toLowerCase()} dành cho{" "}
                  {pkg.groupSize === 1 ? "cá nhân" : `nhóm ${pkg.groupSize} người`}{" "}
                  — bao gồm trọn bộ quyền lợi thiết bị và hậu kỳ tiêu chuẩn của Bấu Chụp Choẹt.
                </p>
              )}

              <ul className="svc-item mt-5 space-y-2 text-sm text-grey-70">
                {DEFAULT_PACKAGE_HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-0.5 text-brand-55">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="svc-item mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/pricing?package=${pkg.id}#booking`}
                  draggable={false}
                  className="inline-flex items-center justify-center rounded-[10px] bg-brand-55 px-6 py-3 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                >
                  Đặt gói này
                </Link>
                <Link
                  href="/pricing"
                  draggable={false}
                  className="inline-flex items-center justify-center rounded-[10px] bg-dark-08 px-5 py-3 font-medium text-sm font-medium text-absolutewhite transition-colors duration-200 hover:bg-dark-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                >
                  Xem chi tiết bảng giá ↗
                </Link>
              </div>
            </div>

            {imageUrl && (
              <Link
                href={`/pricing?package=${pkg.id}#booking`}
                draggable={false}
                className="svc-media group relative block overflow-hidden rounded-[14px] bg-dark-08"
              >
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[480px]">
                  <Image
                    key={imageUrl}
                    src={imageUrl}
                    alt={pkg.name}
                    fill
                    quality={100}
                    draggable={false}
                    sizes="(min-width: 1280px) 800px, (min-width: 1024px) 60vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
