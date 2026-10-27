"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isPublicPortfolioCategory, isPublicPortfolioPhoto } from "@/lib/labels";
import type { ResolvedSiteStats } from "@/lib/site-stats";
import type { Photo } from "@/types/photo";
import styles from "./StickyGridSection.module.css";

const GRID_COUNT = 12;
const NUM_COLUMNS = 3;
const BUBBLE_VERTEX_COUNT = 16;
const BUBBLE_CENTER_X = 500;
const BUBBLE_CENTER_Y = 350;
const BUBBLE_BASE_RX = 345;
const BUBBLE_BASE_RY = 225;

/** Deterministic subtle Polaroid tilt angles (degrees) matching /gallery. */
const POLAROID_TILTS = [
  -1.8, 1.5, -1.3, 1.9, -1.5, 1.7, -1.6, 1.4, -1.9, 1.3, -1.4, 1.6,
];

interface BubblePoint {
  x: number;
  y: number;
}

/**
 * Converts a closed ring of points into a smooth C1-continuous cubic Bézier SVG path
 * using Catmull-Rom spline tangents. Allows concave inward dents ("nảy sâu vào")
 * and convex outward stretches ("giãn ra") without sharp corners.
 */
function buildClosedBubblePath(
  points: BubblePoint[],
  tension = 0.35,
  precision = 1,
): string {
  const n = points.length;
  if (n < 3) return "";
  const fmt = (v: number) => v.toFixed(precision);
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 2;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 2;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 2;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 2;

    d += ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return `${d} Z`;
}

/** Shortest signed angular distance in [-π, π]. */
function angleDiff(a: number, b: number): number {
  let diff = (a - b) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Computes the 16-vertex organic bubble contour at time `t` (seconds).
 * Combines smooth multi-lobe harmonics with well-separated traveling inward dents
 * so 2–3 edges bounce deeply inward ("nảy sâu vào") while neighboring edges
 * stretch outward ("giãn ra") like a real soap bubble in air currents.
 */
function computeBubblePaths(t: number): {
  corePath: string;
  midPath: string;
  auraPath: string;
  coreOpacity: number;
  midOpacity: number;
  auraOpacity: number;
} {
  const corePts: BubblePoint[] = [];
  const midPts: BubblePoint[] = [];
  const auraPts: BubblePoint[] = [];

  // Two well-separated primary inward dents (~150°-210° apart so they never pinch a sharp spike)
  const dent1Angle = t * 0.56 + 0.65;
  const dent2Angle = dent1Angle + Math.PI + 0.48 * Math.sin(t * 0.72);
  const dentAngles = [dent1Angle, dent2Angle];
  const dentDepths = [
    0.22 * (0.62 + 0.38 * Math.sin(t * 1.85 + 0.3)),
    0.2 * (0.62 + 0.38 * Math.cos(t * 1.55 + 1.6)),
  ];

  // Subtle center drift so the bubble floats organically as it deforms
  const driftX = 9 * Math.sin(t * 0.75) + 5 * Math.cos(t * 1.22);
  const driftY = 7 * Math.cos(t * 0.68) + 4 * Math.sin(t * 1.12);

  for (let i = 0; i < BUBBLE_VERTEX_COUNT; i++) {
    const theta = (i / BUBBLE_VERTEX_COUNT) * Math.PI * 2;

    // Smooth low-order spherical/liquid modes (m = 2, 3, 4) for rounded stretches ("giãn ra")
    const stretchModes =
      0.085 * Math.sin(theta * 2 + t * 1.32) +
      0.075 * Math.cos(theta * 3 - t * 1.65 + 0.7) +
      0.048 * Math.sin(theta * 4 + t * 2.05 + 1.4);

    // Broad, rounded inward indentations ("nảy sâu vào") with flanking volume compensation
    let indentDelta = 0;
    for (let m = 0; m < dentAngles.length; m++) {
      const dTheta = angleDiff(theta, dentAngles[m]);
      const distSq = dTheta * dTheta;
      const wavelet = (1 - distSq / 0.36) * Math.exp(-distSq / 0.5);
      indentDelta += -dentDepths[m] * wavelet;
    }

    const coreScale = Math.max(0.7, Math.min(1.18, 0.92 + stretchModes + indentDelta));
    const midScale = Math.max(
      0.76,
      Math.min(1.24, 1.01 + stretchModes * 0.92 + indentDelta * 0.85),
    );
    const auraScale = Math.max(
      0.82,
      Math.min(1.3, 1.1 + stretchModes * 0.82 + indentDelta * 0.72),
    );

    corePts.push({
      x: BUBBLE_CENTER_X + driftX + Math.cos(theta) * BUBBLE_BASE_RX * coreScale,
      y: BUBBLE_CENTER_Y + driftY + Math.sin(theta) * BUBBLE_BASE_RY * coreScale,
    });
    midPts.push({
      x: BUBBLE_CENTER_X + driftX * 0.9 + Math.cos(theta) * BUBBLE_BASE_RX * midScale,
      y: BUBBLE_CENTER_Y + driftY * 0.9 + Math.sin(theta) * BUBBLE_BASE_RY * midScale,
    });
    auraPts.push({
      x: BUBBLE_CENTER_X + driftX * 0.75 + Math.cos(theta) * BUBBLE_BASE_RX * auraScale,
      y: BUBBLE_CENTER_Y + driftY * 0.75 + Math.sin(theta) * BUBBLE_BASE_RY * auraScale,
    });
  }

  // Smooth breathing opacity fade ("nhấp nháy opacity kiểu fade")
  const fadeWave =
    0.5 + 0.35 * Math.sin(t * 1.85) + 0.15 * Math.cos(t * 3.1 + 0.8);
  const midWave =
    0.5 + 0.35 * Math.sin(t * 1.85 - 0.45) + 0.15 * Math.cos(t * 2.8 + 1.2);
  const auraWave =
    0.5 + 0.36 * Math.sin(t * 1.85 - 0.95) + 0.14 * Math.sin(t * 2.55 + 1.6);

  const coreOpacity = Number(
    (0.46 + Math.max(0, Math.min(1, fadeWave)) * 0.46).toFixed(3),
  );
  const midOpacity = Number(
    (0.38 + Math.max(0, Math.min(1, midWave)) * 0.46).toFixed(3),
  );
  const auraOpacity = Number(
    (0.28 + Math.max(0, Math.min(1, auraWave)) * 0.52).toFixed(3),
  );

  return {
    corePath: buildClosedBubblePath(corePts, 0.35, 1),
    midPath: buildClosedBubblePath(midPts, 0.36, 1),
    auraPath: buildClosedBubblePath(auraPts, 0.36, 1),
    coreOpacity,
    midOpacity,
    auraOpacity,
  };
}

const INITIAL_BUBBLE = computeBubblePaths(1.2);

interface PolaroidSlot {
  slotKey: string;
  photo: Photo;
  tilt: number;
  categoryLabel: string;
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
}: {
  photos: Photo[];
  photographerName?: string | null;
  stats: ResolvedSiteStats;
}) {
  const blockRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = (photographerName?.trim() || "Bấu Chụp Choẹt").toUpperCase();

  // Ensure 12 Polaroid slots distributed across 3 columns (4 original cards per column).
  const gridColumns = useMemo(() => {
    const publicPhotos = photos.filter(isPublicPortfolioPhoto);
    if (publicPhotos.length === 0) return [];
    const cols: PolaroidSlot[][] = Array.from({ length: NUM_COLUMNS }, () => []);
    for (let i = 0; i < GRID_COUNT; i++) {
      const photo = publicPhotos[i % publicPhotos.length];
      const portfolioCat = photo.categories?.find(isPublicPortfolioCategory);
      cols[i % NUM_COLUMNS].push({
        slotKey: `${photo.id}-slot-${i}`,
        photo,
        tilt: POLAROID_TILTS[i % POLAROID_TILTS.length],
        categoryLabel: portfolioCat?.name ?? photo.categories?.[0]?.name ?? "Bấu Chụp Choẹt",
        displayIndex: String(i + 1).padStart(2, "0"),
      });
    }
    return cols;
  }, [photos]);

  // Debounced ScrollTrigger.refresh() as grid images finish decoding.
  const handleImageLoad = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);
  }, []);

  // Continuous organic bubble edge deformation ("nảy sâu vào / giãn ra") + breathing opacity fade
  useEffect(() => {
    const block = blockRef.current;
    const panel = panelRef.current;
    if (!block || !panel) return;
    const bubbleCoreEl = panel.querySelector<SVGPathElement>("[data-bubble-core]");
    const bubbleMidEl = panel.querySelector<SVGPathElement>("[data-bubble-mid]");
    const bubbleAuraEl = panel.querySelector<SVGPathElement>("[data-bubble-aura]");
    const bubbleFabricEl = panel.querySelector<HTMLElement>("[data-bubble-fabric]");
    if (!bubbleCoreEl || !bubbleAuraEl) return;

    let inView = true;
    let rafId = 0;
    const startMs = performance.now();

    const step = (nowMs: number) => {
      if (inView && !document.hidden) {
        const elapsedSec = (nowMs - startMs) / 1000 + 1.2;
        const { corePath, midPath, auraPath, coreOpacity, midOpacity, auraOpacity } =
          computeBubblePaths(elapsedSec);
        bubbleCoreEl.setAttribute("d", corePath);
        bubbleCoreEl.style.opacity = String(coreOpacity);
        if (bubbleMidEl) {
          bubbleMidEl.setAttribute("d", midPath);
          bubbleMidEl.style.opacity = String(midOpacity);
        }
        bubbleAuraEl.setAttribute("d", auraPath);
        bubbleAuraEl.style.opacity = String(auraOpacity);
        if (bubbleFabricEl) bubbleFabricEl.style.opacity = String(coreOpacity);
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);

    const obs =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
            },
            { rootMargin: "160px 0px" },
          )
        : null;
    obs?.observe(block);

    return () => {
      window.cancelAnimationFrame(rafId);
      obs?.disconnect();
    };
  }, [gridColumns.length]);

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

        // Initial page-load fade-in animation (targets inner elements so it never conflicts with ScrollTrigger)
        const hasCameraIntro = Boolean(
          document.querySelector('[data-camera-intro="active"]'),
        );
        const introDelay = hasCameraIntro ? 0.22 : 0.04;
        const loadTl = gsap.timeline({ delay: introDelay });
        loadTl
          .fromTo(
            panel,
            { autoAlpha: 0, scale: 0.94 },
            { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" },
            0,
          )
          .fromTo(
            polaroidEls,
            { autoAlpha: 0, scale: 0.9, y: 28 },
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
          .fromTo(
            greetingItems,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.14,
              ease: "power3.out",
            },
            0.18,
          );

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
            {/* Organic morphing bauble/bubble green backdrop with inward dents, outward stretches & fade pulse */}
            <div aria-hidden="true" className={styles.bubbleStage}>
              <svg
                viewBox="0 0 1000 700"
                preserveAspectRatio="none"
                className={styles.bubbleSvg}
              >
                <defs>
                  <radialGradient id="sg-bubble-aura-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgb(96, 130, 78)" stopOpacity="0.46" />
                    <stop offset="58%" stopColor="rgb(126, 159, 109)" stopOpacity="0.24" />
                    <stop offset="86%" stopColor="rgb(148, 179, 132)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="rgb(163, 190, 149)" stopOpacity="0.02" />
                  </radialGradient>
                  <radialGradient id="sg-bubble-mid-grad" cx="49%" cy="48%" r="50%">
                    <stop offset="0%" stopColor="rgb(84, 116, 68)" stopOpacity="0.64" />
                    <stop offset="56%" stopColor="rgb(107, 142, 90)" stopOpacity="0.46" />
                    <stop offset="86%" stopColor="rgb(134, 166, 118)" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="rgb(154, 184, 138)" stopOpacity="0.06" />
                  </radialGradient>
                  <radialGradient id="sg-bubble-core-grad" cx="48%" cy="46%" r="50%">
                    <stop offset="0%" stopColor="rgb(72, 102, 58)" stopOpacity="0.82" />
                    <stop offset="54%" stopColor="rgb(100, 136, 83)" stopOpacity="0.62" />
                    <stop offset="85%" stopColor="rgb(124, 157, 107)" stopOpacity="0.36" />
                    <stop offset="100%" stopColor="rgb(148, 179, 132)" stopOpacity="0.12" />
                  </radialGradient>
                </defs>
                <path
                  data-bubble-aura
                  d={INITIAL_BUBBLE.auraPath}
                  style={{ opacity: INITIAL_BUBBLE.auraOpacity }}
                  className={styles.bubbleAura}
                />
                <path
                  data-bubble-mid
                  d={INITIAL_BUBBLE.midPath}
                  style={{ opacity: INITIAL_BUBBLE.midOpacity }}
                  className={styles.bubbleMid}
                />
                <path
                  data-bubble-core
                  d={INITIAL_BUBBLE.corePath}
                  style={{ opacity: INITIAL_BUBBLE.coreOpacity }}
                  className={styles.bubbleCore}
                />
              </svg>
              <div
                data-bubble-fabric
                style={{ opacity: INITIAL_BUBBLE.coreOpacity }}
                className={styles.bubbleFabric}
              />
            </div>

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
                              sizes="(min-width: 1280px) 1000px, (min-width: 768px) 70vw, 100vw"
                              onLoad={slot.isClone ? undefined : handleImageLoad}
                              className={styles.image}
                            />
                          </div>
                          <div className={styles.captionBar}>
                            <span className={styles.categoryLabel}>
                              {slot.categoryLabel}
                            </span>
                            <span className={styles.indexLabel}>
                              #{slot.displayIndex}
                            </span>
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
