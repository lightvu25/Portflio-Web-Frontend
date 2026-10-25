"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { ResolvedSiteStats } from "@/lib/site-stats";
import type { Photo } from "@/types/photo";
import styles from "./StickyGridSection.module.css";

const GRID_COUNT = 12;
const NUM_COLUMNS = 3;

/**
 * Scroll-driven sticky 3×4 photo grid hero — adapted from Codrops
 * "Sticky Grid Scroll" (MIT License, Theo Plawinski & Codrops).
 *
 * Mounted at the top of the homepage on an ivory (#F5F3EC) backdrop with a
 * green gradient center panel so text never clashes with grid photos.
 * Scrubbed scroll sequence:
 *  1. At scrollY=0: Greeting ("Xin chào cả nhà, tui tên là") + H1 photographer name.
 *  2. Photo columns slide in (`gridRevealTimeline`) as greeting fades out.
 *  3. Stats appear sequentially: clientsCount+ → experienceYears → conceptsCount+.
 *  4. Stats fade out while grid zooms & separates (`gridZoomTimeline`).
 *  5. Final CTA block ("Khoảnh khắc đáng giữ" + booking/gallery links) fades in.
 */
export function StickyGridSection({
  photos,
  photographerName,
  stats,
}: {
  photos: Photo[];
  photographerName?: string | null;
  stats: ResolvedSiteStats;
}) {
  const blockRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = (photographerName?.trim() || "Bấu Chụp Choẹt").toUpperCase();

  // Ensure exactly 12 items for the 3×4 grid, cycling through published photos if < 12 exist.
  const gridPhotos = useMemo(() => {
    if (photos.length === 0) return [];
    return Array.from({ length: GRID_COUNT }, (_, i) => ({
      slotKey: `${photos[i % photos.length].id}-slot-${i}`,
      photo: photos[i % photos.length],
    }));
  }, [photos]);

  // Debounced ScrollTrigger.refresh() as grid images finish decoding.
  const handleImageLoad = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

  useGSAP(
    () => {
      const block = blockRef.current;
      const wrapper = wrapperRef.current;
      const greeting = greetingRef.current;
      const statsContainer = statsRef.current;
      const ctaContainer = ctaRef.current;
      const grid = gridRef.current;

      if (!block || !wrapper || !greeting || !statsContainer || !ctaContainer || !grid) {
        return;
      }

      const items = Array.from(grid.querySelectorAll<HTMLElement>("[data-grid-item]"));
      const statEls = Array.from(statsContainer.querySelectorAll<HTMLElement>("[data-stat-item]"));
      const statValueEls = statEls.map((el) =>
        el.querySelector<HTMLElement>("[data-stat-value]"),
      );
      const statTargets = statValueEls.map((el) => Number(el?.dataset.target ?? 0));
      const statSuffixes = statValueEls.map((el) => el?.dataset.suffix ?? "");
      const ctaEls = Array.from(ctaContainer.querySelectorAll<HTMLElement>("[data-cta-item]"));
      if (items.length === 0) return;

      const setStatText = (idx: number, raw: number) => {
        const el = statValueEls[idx];
        if (!el) return;
        el.textContent = `${Math.round(raw)}${statSuffixes[idx]}`;
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let headerH = 0;
        const measureHeader = () => {
          const headerEl = document.querySelector("header");
          headerH = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
          block.style.setProperty("--sg-offset", `${headerH}px`);
        };

        measureHeader();
        gsap.set(greeting, { autoAlpha: 1, yPercent: 0 });
        gsap.set(statEls, { autoAlpha: 0, y: 24 });
        gsap.set(ctaEls, { autoAlpha: 0, y: 24 });

        const counterValues = statTargets.map(() => ({ val: 0 }));
        const counterActive = statTargets.map(() => false);
        const counterTweens: (gsap.core.Tween | null)[] = statTargets.map(() => null);
        statTargets.forEach((_, idx) => setStatText(idx, 0));

        const syncStatCounters = () => {
          statEls.forEach((el, idx) => {
            const opacity = Number(gsap.getProperty(el, "opacity")) || 0;
            if (opacity > 0.05 && !counterActive[idx]) {
              counterActive[idx] = true;
              counterTweens[idx]?.kill();
              counterValues[idx].val = 0;
              setStatText(idx, 0);
              counterTweens[idx] = gsap.to(counterValues[idx], {
                val: statTargets[idx],
                duration: 0.85,
                ease: "power2.out",
                onUpdate: () => setStatText(idx, counterValues[idx].val),
              });
            } else if (opacity <= 0.02 && counterActive[idx]) {
              counterActive[idx] = false;
              counterTweens[idx]?.kill();
              counterTweens[idx] = null;
              counterValues[idx].val = 0;
              setStatText(idx, 0);
            }
          });
        };

        // Bucket the 12 grid items into 3 columns (index % 3)
        const columns: HTMLElement[][] = Array.from({ length: NUM_COLUMNS }, () => []);
        items.forEach((item, index) => {
          columns[index % NUM_COLUMNS].push(item);
        });

        const gridRevealTimeline = (cols = columns) => {
          const tl = gsap.timeline();
          cols.forEach((column, colIndex) => {
            const fromTop = colIndex % 2 === 0;
            tl.from(
              column,
              {
                y: () => {
                  const wh = window.innerHeight;
                  const dy = wh - (wh - grid.offsetHeight) / 2;
                  return dy * (fromTop ? -1 : 1);
                },
                stagger: {
                  each: 0.06,
                  from: fromTop ? "end" : "start",
                },
                ease: "power1.inOut",
              },
              "grid-reveal",
            );
          });
          return tl;
        };

        const gridZoomTimeline = (cols = columns) => {
          const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.inOut" } });
          tl.to(grid, { scale: 2.05 });
          tl.to(cols[0], { xPercent: -40 }, "<");
          tl.to(cols[2], { xPercent: 40 }, "<");
          tl.to(
            cols[1],
            {
              yPercent: (index) => (index < Math.floor(cols[1].length / 2) ? -1 : 1) * 40,
              duration: 0.5,
              ease: "power1.inOut",
            },
            "-=0.5",
          );
          return tl;
        };

        const mainTimeline = gsap.timeline({
          onUpdate: syncStatCounters,
          scrollTrigger: {
            trigger: block,
            start: () => `top top+=${headerH}`,
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        mainTimeline
          .add(gridRevealTimeline(), "reveal")
          .to(
            greeting,
            { autoAlpha: 0, yPercent: -30, duration: 0.35, ease: "power2.inOut" },
            "reveal+=0.38",
          )
          .fromTo(
            statEls,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.28,
              duration: 0.32,
              ease: "power2.out",
            },
            ">-0.05",
          )
          .to(
            statEls,
            {
              autoAlpha: 0,
              y: -24,
              stagger: 0.06,
              duration: 0.28,
              ease: "power2.in",
            },
            "+=0.42",
          )
          .add(gridZoomTimeline(), "<")
          .fromTo(
            ctaEls,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.38,
              ease: "power2.out",
            },
            "-=0.4",
          )
          .to({}, { duration: 0.2 });

        ScrollTrigger.addEventListener("refreshInit", measureHeader);

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", measureHeader);
          counterTweens.forEach((t) => t?.kill());
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        statTargets.forEach((target, idx) => setStatText(idx, target));
        gsap.set([wrapper, greeting, ...statEls, ...ctaEls, grid, ...items], {
          clearProps: "all",
        });
      });

      return () => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        mm.revert();
      };
    },
    {
      scope: blockRef,
      dependencies: [
        gridPhotos.length,
        stats.clientsCount,
        stats.experienceYears,
        stats.conceptsCount,
      ],
    },
  );

  if (gridPhotos.length === 0) return null;

  return (
    <section
      ref={blockRef}
      aria-label="Giới thiệu và trải nghiệm bộ sưu tập"
      className={styles.block}
    >
      <div ref={wrapperRef} className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.panel}>
            {/* Stage 1: Greeting + H1 (visible immediately at scrollY=0) */}
            <div ref={greetingRef} data-stage="greeting" className={styles.greeting}>
              <span className={styles.eyebrow}>Xin chào cả nhà, tui tên là</span>
              <h1 className={styles.heroTitle}>{displayName}</h1>
            </div>

            {/* Stage 2: Sequential stats */}
            <div ref={statsRef} data-stage="stats" className={styles.stats}>
              <div data-stat-item className={styles.statItem}>
                <span
                  data-stat-value
                  data-target={stats.clientsCount}
                  data-suffix="+"
                  aria-label={`${stats.clientsCount}+`}
                  className={styles.statValue}
                >
                  {stats.clientsCount}+
                </span>
                <span className={styles.statLabel}>khách đã chụp</span>
              </div>
              <div data-stat-item className={styles.statItem}>
                <span
                  data-stat-value
                  data-target={stats.experienceYears}
                  data-suffix=""
                  aria-label={`${stats.experienceYears}`}
                  className={styles.statValue}
                >
                  {stats.experienceYears}
                </span>
                <span className={styles.statLabel}>năm kinh nghiệm</span>
              </div>
              <div data-stat-item className={styles.statItem}>
                <span
                  data-stat-value
                  data-target={stats.conceptsCount}
                  data-suffix="+"
                  aria-label={`${stats.conceptsCount}+`}
                  className={styles.statValue}
                >
                  {stats.conceptsCount}+
                </span>
                <span className={styles.statLabel}>concept đã chụp</span>
              </div>
            </div>

            {/* Stage 3: Final CTA */}
            <div ref={ctaRef} data-stage="cta" className={styles.cta}>
              <span data-cta-item className={`${styles.eyebrow} ${styles.ctaItem}`}>
                {displayName}
              </span>
              <h2 data-cta-item className={`${styles.ctaTitle} ${styles.ctaItem}`}>
                Khoảnh khắc đáng giữ
              </h2>
              <p data-cta-item className={`${styles.description} ${styles.ctaItem}`}>
                Mỗi khung hình là một câu chuyện tuổi trẻ tự nhiên, trong trẻo và
                tràn đầy cảm xúc qua ống kính của Bấu.
              </p>
              <div data-cta-item className={`${styles.actions} ${styles.ctaItem}`}>
                <Link href="/booking" className={styles.primaryButton}>
                  Đặt lịch ngay
                </Link>
                <Link href="/gallery" className={styles.secondaryButton}>
                  Khám phá bộ sưu tập ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.gallery}>
          <ul ref={gridRef} className={styles.grid}>
            {gridPhotos.map(({ slotKey, photo }, idx) => (
              <li key={slotKey} data-grid-item className={styles.item}>
                <Image
                  src={photo.imageUrl}
                  alt={photo.altText ?? photo.title ?? `Ảnh bộ sưu tập ${idx + 1}`}
                  fill
                  quality={100}
                  sizes="(min-width: 1280px) 1000px, (min-width: 768px) 70vw, 100vw"
                  onLoad={handleImageLoad}
                  className={styles.image}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
