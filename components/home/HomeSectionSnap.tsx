"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DownwardScrollButton } from "@/components/home/DownwardScrollButton";
import { gsap } from "@/lib/gsap";
import {
  BAU_CANCEL_SNAP_EVENT,
  BAU_NAV_INTENT_EVENT,
  getStickyHeaderHeight,
  smoothScrollToElement,
  smoothScrollToTop,
  type BauNavIntentDetail,
} from "@/lib/navigation";
import {
  buildSectionStop,
  hasMoreStopsBelow,
  normalizeSnapStops,
  resolveMagneticSnapTarget,
  resolveNextStopOnButtonClick,
  type SnapStop,
} from "@/lib/section-snap";

/** Minimum accumulated wheel delta (px) to trigger magnetic section pull. */
const WHEEL_SNAP_THRESHOLD_PX = 16;
/** Minimum vertical touch swipe distance (px) to trigger magnetic section pull. */
const TOUCH_SNAP_THRESHOLD_PX = 28;
/** Minimum scrollbar / native scroll displacement (px) to settle onto next stop. */
const SCROLL_SETTLE_THRESHOLD_PX = 36;

function isInteractiveInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="dialog"]',
    ),
  );
}

/**
 * Coordinates the Homepage floating Downward Scroll Button and Magnetic
 * Section-by-Section Snapping across:
 *   Hero Stage 1 -> Hero Stage 2 -> Hero Stage 3 -> About -> Services ->
 *   Portfolio -> Testimonials -> Contact CTA -> Footer.
 */
export function HomeSectionSnap() {
  const [showDownward, setShowDownward] = useState(true);

  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isSnappingRef = useRef(false);
  const snapCompletedAtRef = useRef(0);
  const navOverrideUntilRef = useRef(0);

  // Wheel / trackpad gesture tracking
  const wheelAccumRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const lastAbsDeltaRef = useRef(0);
  const wheelGestureLockedRef = useRef(false);
  const lockedDirRef = useRef<1 | -1>(1);

  // Touch swipe tracking
  const touchActiveRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartScrollYRef = useRef(0);

  // Scrollbar / native scroll settle tracking
  const pointerHeldRef = useRef(false);
  const scrollGestureStartYRef = useRef<number | null>(null);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collectSnapStops = useCallback((): {
    stops: SnapStop[];
    maxScrollY: number;
  } => {
    const viewportH = window.innerHeight;
    const headerH = getStickyHeaderHeight();
    const maxScrollY = Math.max(
      0,
      document.documentElement.scrollHeight - viewportH,
    );
    const rawStops: SnapStop[] = [];

    const heroEl = document.querySelector<HTMLElement>("[data-sticky-hero]");
    if (heroEl && heroEl.offsetHeight > viewportH * 1.4) {
      const heroSpan = Math.max(0, heroEl.offsetHeight - (viewportH - headerH));
      const parsedStats = Number(heroEl.dataset.statsScrollY);
      const parsedCta = Number(heroEl.dataset.ctaScrollY);

      const statsY =
        Number.isFinite(parsedStats) && parsedStats > 0
          ? parsedStats
          : Math.round(heroEl.offsetTop + heroSpan * 0.48);
      const ctaY =
        Number.isFinite(parsedCta) && parsedCta > 0
          ? parsedCta
          : Math.round(heroEl.offsetTop + heroSpan * 0.98);

      rawStops.push(
        { id: "hero-greeting", topY: 0, bottomExitY: 0 },
        {
          id: "hero-stats",
          topY: Math.min(statsY, maxScrollY),
          bottomExitY: Math.min(statsY, maxScrollY),
        },
        {
          id: "hero-cta",
          topY: Math.min(ctaY, maxScrollY),
          bottomExitY: Math.min(ctaY, maxScrollY),
        },
      );
    }

    const sectionEls = document.querySelectorAll<HTMLElement>(
      "[data-snap-section]",
    );
    sectionEls.forEach((el, idx) => {
      const id = el.dataset.snapSection || `section-${idx}`;
      const rect = el.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY;
      rawStops.push(
        buildSectionStop({
          id,
          offsetTop,
          offsetHeight: el.offsetHeight,
          viewportHeight: viewportH,
          headerHeight: headerH,
          maxScrollY,
          preserveFullHeightScroll: el.hasAttribute("data-snap-preserve-form"),
        }),
      );
    });

    const footerEl = document.querySelector<HTMLElement>("footer");
    if (footerEl) {
      const rect = footerEl.getBoundingClientRect();
      const offsetTop = rect.top + window.scrollY;
      rawStops.push(
        buildSectionStop({
          id: "footer",
          offsetTop,
          offsetHeight: footerEl.offsetHeight,
          viewportHeight: viewportH,
          headerHeight: headerH,
          maxScrollY,
        }),
      );
    }

    return {
      stops: normalizeSnapStops(rawStops),
      maxScrollY,
    };
  }, []);

  const syncButtonVisibility = useCallback(
    (overrideY?: number) => {
      if (typeof window === "undefined") return;
      const { stops, maxScrollY } = collectSnapStops();
      const y = overrideY ?? window.scrollY;
      setShowDownward(hasMoreStopsBelow(stops, y, maxScrollY));
    },
    [collectSnapStops],
  );

  const stopActiveTween = useCallback(() => {
    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }
    isSnappingRef.current = false;
  }, []);

  const animateToStop = useCallback(
    (targetY: number) => {
      if (typeof window === "undefined") return;
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const clampedY = Math.max(0, Math.min(Math.round(targetY), maxScrollY));
      const startY = window.scrollY;
      const dist = Math.abs(clampedY - startY);

      stopActiveTween();
      scrollGestureStartYRef.current = null;
      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
        scrollIdleTimerRef.current = null;
      }

      syncButtonVisibility(clampedY);

      if (dist < 4) {
        window.scrollTo(0, clampedY);
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        window.scrollTo(0, clampedY);
        return;
      }

      isSnappingRef.current = true;
      const duration = gsap.utils.clamp(0.46, 0.78, dist / 2200);
      const proxy = { y: startY };

      tweenRef.current = gsap.to(proxy, {
        y: clampedY,
        duration,
        ease: "power3.out",
        onUpdate: () => {
          window.scrollTo(0, proxy.y);
        },
        onComplete: () => {
          tweenRef.current = null;
          isSnappingRef.current = false;
          snapCompletedAtRef.current = performance.now();
          scrollGestureStartYRef.current = null;
          syncButtonVisibility();
        },
      });
    },
    [stopActiveTween, syncButtonVisibility],
  );

  const handleDownwardClick = useCallback(() => {
    const { stops } = collectSnapStops();
    const next = resolveNextStopOnButtonClick(stops, window.scrollY);
    if (next) {
      wheelGestureLockedRef.current = false;
      animateToStop(next.topY);
    }
  }, [animateToStop, collectSnapStops]);

  useEffect(() => {
    const initialRaf = requestAnimationFrame(() => {
      syncButtonVisibility();
    });

    // Respect initial hash navigation (e.g. arriving at `/#feedback` from another page)
    if (window.location.hash === "#feedback") {
      navOverrideUntilRef.current = performance.now() + 1200;
      requestAnimationFrame(() => {
        setTimeout(() => {
          smoothScrollToElement("feedback");
        }, 80);
      });
    }

    const onCancelSnap = () => {
      stopActiveTween();
      wheelGestureLockedRef.current = false;
      wheelAccumRef.current = 0;
      scrollGestureStartYRef.current = null;
      navOverrideUntilRef.current = performance.now() + 1100;
    };

    const onNavIntent = (evt: Event) => {
      const detail = (evt as CustomEvent<BauNavIntentDetail>).detail;
      if (!detail) return;
      if (detail.type === "scroll-top") {
        onCancelSnap();
        smoothScrollToTop();
      } else if (detail.type === "scroll-element") {
        onCancelSnap();
        smoothScrollToElement(detail.id);
      }
    };

    const onPointerDown = () => {
      pointerHeldRef.current = true;
    };
    const onPointerUp = () => {
      pointerHeldRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (isInteractiveInputTarget(e.target) || isInteractiveInputTarget(document.activeElement)) {
        return;
      }

      const now = performance.now();
      if (now < navOverrideUntilRef.current) return;

      const pxDelta =
        e.deltaMode === 1
          ? e.deltaY * 32
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;

      if (Math.abs(pxDelta) < 0.5) return;

      const gapMs = now - lastWheelTimeRef.current;
      const absDelta = Math.abs(pxDelta);
      const dir: 1 | -1 = pxDelta > 0 ? 1 : -1;

      if (isSnappingRef.current) {
        e.preventDefault();
        lastWheelTimeRef.current = now;
        lastAbsDeltaRef.current = absDelta;
        return;
      }

      if (wheelGestureLockedRef.current) {
        const pausedEnough = gapMs > 130;
        const reversed = dir !== lockedDirRef.current;
        const freshSpike =
          now - snapCompletedAtRef.current > 180 &&
          absDelta >= 24 &&
          absDelta > lastAbsDeltaRef.current * 1.65;

        if (pausedEnough || reversed || freshSpike) {
          wheelGestureLockedRef.current = false;
          wheelAccumRef.current = 0;
        } else {
          e.preventDefault();
          lastWheelTimeRef.current = now;
          lastAbsDeltaRef.current = absDelta;
          return;
        }
      }

      if (gapMs > 180 || Math.sign(wheelAccumRef.current) !== dir) {
        wheelAccumRef.current = 0;
      }

      wheelAccumRef.current += pxDelta;
      lastWheelTimeRef.current = now;
      lastAbsDeltaRef.current = absDelta;

      if (Math.abs(wheelAccumRef.current) < WHEEL_SNAP_THRESHOLD_PX) return;

      const { stops } = collectSnapStops();
      const target = resolveMagneticSnapTarget(stops, window.scrollY, dir);
      wheelAccumRef.current = 0;

      if (target) {
        e.preventDefault();
        wheelGestureLockedRef.current = true;
        lockedDirRef.current = dir;
        animateToStop(target.topY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        touchActiveRef.current = false;
        return;
      }
      if (isInteractiveInputTarget(e.target)) {
        touchActiveRef.current = false;
        return;
      }
      touchActiveRef.current = true;
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchStartScrollYRef.current = window.scrollY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;
      touchActiveRef.current = false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (isSnappingRef.current || performance.now() < navOverrideUntilRef.current) {
        return;
      }
      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touchStartXRef.current - touch.clientX;
      const dy = touchStartYRef.current - touch.clientY;
      if (Math.abs(dx) >= Math.abs(dy)) return;
      if (Math.abs(dy) < TOUCH_SNAP_THRESHOLD_PX) return;

      const dir: 1 | -1 = dy > 0 ? 1 : -1;
      const { stops } = collectSnapStops();
      const target = resolveMagneticSnapTarget(
        stops,
        touchStartScrollYRef.current,
        dir,
      );
      if (!target) return;

      if (dir === 1 && target.topY > window.scrollY + 8) {
        animateToStop(target.topY);
      } else if (dir === -1 && target.topY < window.scrollY - 8) {
        animateToStop(target.topY);
      }
    };

    const onScroll = () => {
      syncButtonVisibility();

      if (
        isSnappingRef.current ||
        touchActiveRef.current ||
        performance.now() < navOverrideUntilRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      // Skip scroll-settle right after a wheel snap completed
      if (performance.now() - lastWheelTimeRef.current < 260) {
        return;
      }

      if (scrollGestureStartYRef.current === null) {
        scrollGestureStartYRef.current = window.scrollY;
      }

      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }

      scrollIdleTimerRef.current = setTimeout(() => {
        scrollIdleTimerRef.current = null;
        if (
          pointerHeldRef.current ||
          touchActiveRef.current ||
          isSnappingRef.current ||
          performance.now() < navOverrideUntilRef.current
        ) {
          return;
        }
        const originY = scrollGestureStartYRef.current;
        scrollGestureStartYRef.current = null;
        if (originY === null) return;

        const currentY = window.scrollY;
        const delta = currentY - originY;
        if (Math.abs(delta) < SCROLL_SETTLE_THRESHOLD_PX) return;

        const dir: 1 | -1 = delta > 0 ? 1 : -1;
        const { stops } = collectSnapStops();
        const nearExistingStop = stops.some(
          (s) => Math.abs(s.topY - currentY) <= 22,
        );
        if (nearExistingStop) return;

        const target = resolveMagneticSnapTarget(stops, originY, dir);
        if (!target) return;

        // Settle when inside the sticky hero or within magnetic pull range of a section boundary
        const heroEl = document.querySelector<HTMLElement>("[data-sticky-hero]");
        const insideHero = heroEl ? currentY < heroEl.offsetHeight : false;
        const withinPullRange = Math.abs(currentY - originY) <= window.innerHeight * 0.65;

        if (insideHero || withinPullRange) {
          animateToStop(target.topY);
        }
      }, 150);
    };

    const onResize = () => syncButtonVisibility();

    window.addEventListener(BAU_CANCEL_SNAP_EVENT, onCancelSnap);
    window.addEventListener(BAU_NAV_INTENT_EVENT, onNavIntent);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(initialRaf);
      stopActiveTween();
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
      window.removeEventListener(BAU_CANCEL_SNAP_EVENT, onCancelSnap);
      window.removeEventListener(BAU_NAV_INTENT_EVENT, onNavIntent);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [animateToStop, collectSnapStops, stopActiveTween, syncButtonVisibility]);

  return (
    <DownwardScrollButton visible={showDownward} onClick={handleDownwardClick} />
  );
}
