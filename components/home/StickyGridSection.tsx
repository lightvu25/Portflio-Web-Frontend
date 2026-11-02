"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { HeroImageProgress } from "@/components/home/HomeHeroStage";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isAdminCategory, isPackageCategory } from "@/lib/labels";
import type { ResolvedSiteStats } from "@/lib/site-stats";
import type { Photo } from "@/types/photo";
import styles from "./StickyGridSection.module.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const GRID_COUNT = 12;
const NUM_COLUMNS = 3;

/** Deterministic subtle Polaroid tilt angles (degrees) matching /gallery. */
const POLAROID_TILTS = [
  -1.8, 1.5, -1.3, 1.9, -1.5, 1.7, -1.6, 1.4, -1.9, 1.3, -1.4, 1.6,
];

interface PolaroidSlot {
  slotKey: string;
  photo: Photo;
  tilt: number;
  displayIndex: string;
}

/**
 * Scroll-driven sticky 3-column Polaroid hero with continuous vertical
 * infinite auto-scroll per column and stage-by-stage ScrollTrigger auto-align.
 *
 * Scrubbed scroll sequence:
 *  1. Stage 1 (scrollY=0): Greeting ("Xin chào cả nhà, tui tên là") + H1 photographer name
 *     over continuously auto-scrolling Polaroid columns.
 *  2. Stage 2 (~50%): Stats appear sequentially with 0 → N counters
 *     (clientsCount+ → experienceYears → conceptsCount+).
 *  3. Stage 3 (100%): Stats fade out while Polaroid columns zoom & separate to
 *     frame the final CTA block ("Khoảnh khắc đáng giữ" + booking/gallery links).
 */
export function StickyGridSection({
  photos,
  photographerName,
  stats,
  isReady = true,
  onLoadProgress,
}: {
  photos: Photo[];
  photographerName?: string | null;
  stats: ResolvedSiteStats;
  isReady?: boolean;
  onLoadProgress?: (progress: HeroImageProgress) => void;
}) {
  const blockRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settledSlotsRef = useRef<Set<string>>(new Set());
  const pendingDecodeSlotsRef = useRef<Set<string>>(new Set());
  const activeBatchIdRef = useRef(0);
  const onLoadProgressRef = useRef(onLoadProgress);
  const isReadyRef = useRef(isReady);
  const playEntranceRef = useRef<(() => void) | null>(null);

  const displayName = (photographerName?.trim() || "Bấu Chụp Choẹt").toUpperCase();

  // Ensure at least 12 Polaroid slots distributed across 3 columns ( exclusively from the Scroll category ).
  const gridColumns = useMemo(() => {
    const scrollPhotos = photos.filter((p) =>
      (p.categories ?? []).every(
        (c) => !isAdminCategory(c) && c.type !== "FEEDBACK" && !isPackageCategory(c),
      ),
    );
    if (scrollPhotos.length === 0) return [];
    const totalSlots = Math.max(GRID_COUNT, scrollPhotos.length);
    const cols: PolaroidSlot[][] = Array.from({ length: NUM_COLUMNS }, () => []);
    for (let i = 0; i < totalSlots; i++) {
      const photo = scrollPhotos[i % scrollPhotos.length];
      cols[i % NUM_COLUMNS].push({
        slotKey: `${photo.id}-slot-${i}`,
        photo,
        tilt: POLAROID_TILTS[i % POLAROID_TILTS.length],
        displayIndex: String(i + 1).padStart(2, "0"),
      });
    }
    return cols;
  }, [photos]);

  const expectedSlotKeys = useMemo(
    () => gridColumns.flat().map((slot) => slot.slotKey),
    [gridColumns],
  );

  useIsomorphicLayoutEffect(() => {
    onLoadProgressRef.current = onLoadProgress;
  }, [onLoadProgress]);

  useIsomorphicLayoutEffect(() => {
    isReadyRef.current = isReady;
  }, [isReady]);

  // Debounced ScrollTrigger.refresh() as grid images finish decoding.
  const scheduleScrollRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

  const finalizeSlotSettled = useCallback(
    (slotKey: string, batchId: number, totalCount: number) => {
      if (activeBatchIdRef.current !== batchId) return;
      if (settledSlotsRef.current.has(slotKey)) return;

      settledSlotsRef.current.add(slotKey);
      const loaded = settledSlotsRef.current.size;

      if (loaded < totalCount) {
        onLoadProgressRef.current?.({
          loaded,
          total: totalCount,
          ready: false,
        });
        return;
      }

      // All unique hero slots have loaded; ensure any visible loop clones (e.g. Column 1 at -50%)
      // are also decoded before signaling full readiness.
      const cloneImgs = Array.from(
        gridRef.current?.querySelectorAll<HTMLImageElement>('img[data-hero-clone="true"]') ?? [],
      ).filter((img) => img.complete && img.naturalWidth > 0 && typeof img.decode === "function");

      if (cloneImgs.length === 0) {
        onLoadProgressRef.current?.({
          loaded: totalCount,
          total: totalCount,
          ready: true,
        });
        return;
      }

      Promise.all(cloneImgs.map((img) => img.decode().catch(() => {}))).finally(() => {
        if (activeBatchIdRef.current !== batchId) return;
        onLoadProgressRef.current?.({
          loaded: totalCount,
          total: totalCount,
          ready: true,
        });
      });
    },
    [],
  );

  const settleSlotWithDecode = useCallback(
    (slotKey: string, imgEl: HTMLImageElement | null, batchId: number, totalCount: number) => {
      if (activeBatchIdRef.current !== batchId) return;
      if (
        settledSlotsRef.current.has(slotKey) ||
        pendingDecodeSlotsRef.current.has(slotKey)
      ) {
        return;
      }

      if (imgEl && imgEl.naturalWidth > 0 && typeof imgEl.decode === "function") {
        pendingDecodeSlotsRef.current.add(slotKey);
        imgEl
          .decode()
          .catch(() => {})
          .finally(() => {
            pendingDecodeSlotsRef.current.delete(slotKey);
            finalizeSlotSettled(slotKey, batchId, totalCount);
          });
        return;
      }

      finalizeSlotSettled(slotKey, batchId, totalCount);
    },
    [finalizeSlotSettled],
  );

  // Scan pre-hydrated / memory-cached `<img>` elements immediately on mount.
  useIsomorphicLayoutEffect(() => {
    const batchId = ++activeBatchIdRef.current;
    settledSlotsRef.current = new Set();
    pendingDecodeSlotsRef.current = new Set();

    const total = expectedSlotKeys.length;
    if (total === 0) {
      onLoadProgressRef.current?.({ loaded: 0, total: 0, ready: true });
      return;
    }

    const slotImgs = Array.from(
      gridRef.current?.querySelectorAll<HTMLImageElement>("img[data-hero-slot]") ?? [],
    );

    // Fast path for warm browser cache (e.g. SPA navigation back to `/`):
    // if every slot image is already complete in memory, mark ready synchronously before paint.
    if (
      slotImgs.length >= total &&
      slotImgs.every((img) => img.complete && img.naturalWidth > 0)
    ) {
      settledSlotsRef.current = new Set(expectedSlotKeys);
      onLoadProgressRef.current?.({ loaded: total, total, ready: true });
      return;
    }

    onLoadProgressRef.current?.({ loaded: 0, total, ready: false });

    for (const img of slotImgs) {
      const slotKey = img.dataset.heroSlot;
      if (!slotKey) continue;
      if (img.complete) {
        if (img.naturalWidth > 0) {
          settleSlotWithDecode(slotKey, img, batchId, total);
        } else if (img.getAttribute("src")) {
          finalizeSlotSettled(slotKey, batchId, total);
        }
      }
    }
  }, [expectedSlotKeys, finalizeSlotSettled, settleSlotWithDecode]);

  const handleHeroImageLoad = useCallback(
    (slotKey: string, isClone: boolean, imgEl: HTMLImageElement) => {
      if (!isClone) {
        scheduleScrollRefresh();
        settleSlotWithDecode(
          slotKey,
          imgEl,
          activeBatchIdRef.current,
          expectedSlotKeys.length,
        );
      }
    },
    [expectedSlotKeys.length, scheduleScrollRefresh, settleSlotWithDecode],
  );

  const handleHeroImageError = useCallback(
    (slotKey: string, isClone: boolean) => {
      if (!isClone) {
        finalizeSlotSettled(
          slotKey,
          activeBatchIdRef.current,
          expectedSlotKeys.length,
        );
      }
    },
    [expectedSlotKeys.length, finalizeSlotSettled],
  );

  // Trigger entrance reveal + fresh ScrollTrigger measurement once the loading gate opens.
  useEffect(() => {
    if (!isReady) return;
    ScrollTrigger.refresh();
    playEntranceRef.current?.();
  }, [isReady]);

  useGSAP(
    () => {
      const block = blockRef.current;
      const wrapper = wrapperRef.current;
      const panel = panelRef.current;
      const greeting = greetingRef.current;
      const statsContainer = statsRef.current;
      const ctaContainer = ctaRef.current;
      const grid = gridRef.current;

      if (!block || !wrapper || !panel || !greeting || !statsContainer || !ctaContainer || !grid) {
        return;
      }

      const colEls = Array.from(grid.querySelectorAll<HTMLElement>("[data-grid-col]"));
      const trackEls = Array.from(grid.querySelectorAll<HTMLElement>("[data-col-track]"));
      const polaroidEls = Array.from(grid.querySelectorAll<HTMLElement>("[data-polaroid]"));
      const greetingItems = Array.from(
        greeting.querySelectorAll<HTMLElement>("[data-greeting-item]"),
      );
      const statEls = Array.from(statsContainer.querySelectorAll<HTMLElement>("[data-stat-item]"));
      const statValueEls = statEls.map((el) =>
        el.querySelector<HTMLElement>("[data-stat-value]"),
      );
      const statTargets = statValueEls.map((el) => Number(el?.dataset.target ?? 0));
      const statSuffixes = statValueEls.map((el) => el?.dataset.suffix ?? "");
      const ctaEls = Array.from(ctaContainer.querySelectorAll<HTMLElement>("[data-cta-item]"));
      if (colEls.length === 0) return;

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

        // Initial page-load fade-in animation (paused until the hero image gate opens
        // so it never finishes unseen behind the closed loading curtain).
        gsap.set(panel, { autoAlpha: 0, scale: 0.94 });
        gsap.set(polaroidEls, { autoAlpha: 0, scale: 0.9, y: 28 });
        gsap.set(greetingItems, { autoAlpha: 0, y: 22 });

        const loadTl = gsap.timeline({ paused: true });
        loadTl
          .to(
            panel,
            { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" },
            0,
          )
          .to(
            polaroidEls,
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.85,
              stagger: { each: 0.03, from: "center" },
              ease: "power2.out",
              clearProps: "scale,y",
            },
            0.06,
          )
          .to(
            greetingItems,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.14,
              ease: "power3.out",
            },
            0.18,
          );

        let entrancePlayed = false;
        const playEntrance = () => {
          if (entrancePlayed) return;
          entrancePlayed = true;
          const hasShutterIntro = Boolean(
            document.querySelector('[data-camera-intro][data-mode="shutter"]'),
          );
          loadTl.delay(hasShutterIntro ? 0.14 : 0.02).play(0);
        };
        playEntranceRef.current = playEntrance;
        if (isReadyRef.current) {
          playEntrance();
        }

        // Continuous vertical infinite auto-scroll per column:
        // Columns 0 & 2 drift upward (0% -> -50%), Column 1 drifts downward (-50% -> 0%).
        const autoScrollTweens = trackEls.map((track, colIdx) => {
          const moveUp = colIdx % 2 === 0;
          return gsap.fromTo(
            track,
            { yPercent: moveUp ? 0 : -50 },
            {
              yPercent: moveUp ? -50 : 0,
              duration: moveUp ? 26 + colIdx * 2 : 30,
              ease: "none",
              repeat: -1,
            },
          );
        });

        // Pause infinite column tweens when scrolled past the hero or when tab is hidden
        let heroInView = true;
        const updateAutoScrollState = () => {
          const shouldPlay = heroInView && !document.hidden;
          autoScrollTweens.forEach((t) => {
            if (shouldPlay) t.play();
            else t.pause();
          });
        };

        const visibilityObs =
          typeof IntersectionObserver !== "undefined"
            ? new IntersectionObserver(
                ([entry]) => {
                  heroInView = entry.isIntersecting;
                  updateAutoScrollState();
                },
                { rootMargin: "160px 0px" },
              )
            : null;
        visibilityObs?.observe(block);
        document.addEventListener("visibilitychange", updateAutoScrollState);

        const counterValues = statTargets.map(() => ({ val: 0 }));
        const counterActive = statTargets.map(() => false);
        const counterTweens: (gsap.core.Tween | null)[] = statTargets.map(() => null);
        statTargets.forEach((_, idx) => setStatText(idx, 0));

        const syncStatCounters = () => {
          const prog = mainTimeline.progress();
          if (prog < 0.15 || prog > 0.85) {
            if (!counterActive.some(Boolean)) return;
          }
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

        const gridRevealTimeline = () => {
          const tl = gsap.timeline();
          colEls.forEach((colEl, colIndex) => {
            const fromTop = colIndex % 2 === 0;
            tl.fromTo(
              colEl,
              { y: fromTop ? -64 : 64 },
              {
                y: 0,
                duration: 0.68,
                ease: "power1.inOut",
              },
              "grid-reveal",
            );
          });
          return tl;
        };

        const gridZoomTimeline = () => {
          const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.inOut" } });
          tl.to(grid, { scale: 1.65 });
          if (colEls[0]) tl.to(colEls[0], { xPercent: -24 }, "<");
          if (colEls[2]) tl.to(colEls[2], { xPercent: 24 }, "<");
          if (colEls[1]) {
            tl.to(
              colEls[1],
              {
                autoAlpha: 0.35,
                duration: 0.6,
                ease: "power2.inOut",
              },
              "<0.15",
            );
          }
          return tl;
        };

        const mainTimeline = gsap.timeline({
          onUpdate: syncStatCounters,
          scrollTrigger: {
            trigger: block,
            start: () => `top top+=${headerH}`,
            end: "bottom bottom",
            scrub: 0.35,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (value, self) => {
                const total = mainTimeline.duration() || 1;
                const statsProgress =
                  (mainTimeline.labels["stage-stats"] ?? total * 0.48) / total;
                const points = [0, statsProgress, 1];
                const dir = self?.direction ?? 0;
                const threshold = 0.04;
                if (dir > 0) {
                  for (const p of points) {
                    if (p >= value - threshold) return p;
                  }
                  return 1;
                }
                if (dir < 0) {
                  for (let i = points.length - 1; i >= 0; i--) {
                    if (points[i] <= value + threshold) return points[i];
                  }
                  return 0;
                }
                return gsap.utils.snap(points, value);
              },
              inertia: false,
              duration: { min: 0.28, max: 0.55 },
              delay: 0.06,
              ease: "power2.inOut",
            },
          },
        });

        mainTimeline
          .addLabel("stage-greeting", 0)
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
          .addLabel("stage-stats", "+=0.1")
          .to(
            statEls,
            {
              autoAlpha: 0,
              y: -24,
              stagger: 0.06,
              duration: 0.28,
              ease: "power2.in",
            },
            "+=0.32",
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
          .to({}, { duration: 0.2 })
          .addLabel("stage-cta");

        ScrollTrigger.addEventListener("refreshInit", measureHeader);

        return () => {
          playEntranceRef.current = null;
          ScrollTrigger.removeEventListener("refreshInit", measureHeader);
          document.removeEventListener("visibilitychange", updateAutoScrollState);
          visibilityObs?.disconnect();
          loadTl.kill();
          autoScrollTweens.forEach((t) => t.kill());
          counterTweens.forEach((t) => t?.kill());
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        statTargets.forEach((target, idx) => setStatText(idx, target));
        gsap.set(
          [
            wrapper,
            panel,
            greeting,
            ...greetingItems,
            ...statEls,
            ...ctaEls,
            grid,
            ...colEls,
            ...trackEls,
            ...polaroidEls,
          ],
          {
            clearProps: "all",
          },
        );
      });

      return () => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        mm.revert();
      };
    },
    {
      scope: blockRef,
      dependencies: [
        gridColumns.length,
        stats.clientsCount,
        stats.experienceYears,
        stats.conceptsCount,
      ],
    },
  );

  if (gridColumns.length === 0) return null;

  return (
    <section
      ref={blockRef}
      aria-label="Giới thiệu và trải nghiệm bộ sưu tập"
      className={styles.block}
    >
      <div ref={wrapperRef} className={styles.wrapper}>
        <div className={styles.content}>
          <div ref={panelRef} data-hero-panel className={styles.panel}>
            {/* Stage 1: Greeting + H1 (visible immediately at scrollY=0) */}
            <div ref={greetingRef} data-stage="greeting" className={styles.greeting}>
              <span data-greeting-item className={styles.eyebrow}>
                Xin chào cả nhà, tui tên là
              </span>
              <h1 data-greeting-item className={styles.heroTitle}>
                {displayName}
              </h1>
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
                <Link href="/pricing#booking" className={styles.primaryButton}>
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
          <div ref={gridRef} className={styles.grid}>
            {gridColumns.map((colSlots, colIdx) => {
              const trackItems = [
                ...colSlots.map((slot) => ({ ...slot, isClone: false })),
                ...colSlots.map((slot) => ({ ...slot, isClone: true })),
              ];
              return (
                <div
                  key={`col-${colIdx}`}
                  data-grid-col={colIdx}
                  className={styles.column}
                >
                  <div data-col-track={colIdx} className={styles.columnTrack}>
                    {trackItems.map((slot, itemIdx) => (
                      <div
                        key={`${slot.slotKey}-${slot.isClone ? "clone" : "orig"}-${itemIdx}`}
                        data-grid-item={slot.isClone ? undefined : ""}
                        data-loop-clone={slot.isClone ? "true" : undefined}
                        aria-hidden={slot.isClone ? true : undefined}
                        style={{ transform: `rotate(${slot.tilt}deg)` }}
                        className={
                          slot.isClone
                            ? `${styles.item} ${styles.loopClone}`
                            : styles.item
                        }
                      >
                        <div data-polaroid className={styles.polaroid}>
                          <div className={styles.imageFrame}>
                            <Image
                              src={slot.photo.imageUrl}
                              alt={
                                slot.isClone
                                  ? ""
                                  : (slot.photo.altText ??
                                    slot.photo.title ??
                                    `Ảnh bộ sưu tập ${slot.displayIndex}`)
                              }
                              width={1000}
                              height={1250}
                              quality={100}
                              loading="eager"
                              fetchPriority={itemIdx < 2 ? "high" : "auto"}
                              sizes="(min-width: 1280px) 480px, (min-width: 768px) 32vw, 45vw"
                              data-hero-slot={slot.isClone ? undefined : slot.slotKey}
                              data-hero-clone={slot.isClone ? "true" : undefined}
                              onLoad={(e) =>
                                handleHeroImageLoad(
                                  slot.slotKey,
                                  slot.isClone,
                                  e.currentTarget,
                                )
                              }
                              onError={() =>
                                handleHeroImageError(slot.slotKey, slot.isClone)
                              }
                              className={styles.image}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
