"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export interface CursorSpotlightProps {
  /** Outer radius of the radial spotlight in pixels (default: 560). */
  radius?: number;
  /** Master opacity when active (default: 1). */
  opacity?: number;
  /** RGB triplet string for the inner core light (default: "107, 142, 90" — brand sage). */
  color?: string;
  /** RGB triplet string for the mid falloff halo (default: "163, 190, 149"). */
  glowColor?: string;
  className?: string;
}

/**
 * Restrained, studio-grade cursor spotlight for public portfolio pages.
 *
 * - Updates `--spotlight-x` and `--spotlight-y` directly on the DOM node via a
 *   one-shot `requestAnimationFrame` gate (zero React state updates, zero
 *   continuous animation loop when the pointer is stationary).
 * - Automatically disabled on `/admin` routes, touch/coarse-pointer devices,
 *   and when `prefers-reduced-motion: reduce` is enabled.
 */
export function CursorSpotlight({
  radius,
  opacity,
  color,
  glowColor,
  className,
}: CursorSpotlightProps = {}) {
  const pathname = usePathname();
  const spotlightRef = useRef<HTMLDivElement>(null);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    const el = spotlightRef.current;
    if (!el || typeof window === "undefined") return;

    const finePointerMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let rafId = 0;
    let targetX = -9999;
    let targetY = -9999;
    let currentX = -9999;
    let currentY = -9999;
    let isVisible = false;
    let listening = false;

    const LERP_FACTOR = 0.28;
    const STOP_EPSILON = 0.45;

    const renderFrame = () => {
      rafId = 0;

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      const dist = Math.hypot(dx, dy);

      if (dist <= STOP_EPSILON) {
        currentX = targetX;
        currentY = targetY;
      } else {
        currentX += dx * LERP_FACTOR;
        currentY += dy * LERP_FACTOR;
        rafId = window.requestAnimationFrame(renderFrame);
      }

      el.style.setProperty("--spotlight-x", `${currentX.toFixed(1)}px`);
      el.style.setProperty("--spotlight-y", `${currentY.toFixed(1)}px`);

      if (!isVisible) {
        isVisible = true;
        el.dataset.active = "true";
      }
    };

    const updateTarget = (clientX: number, clientY: number) => {
      targetX = clientX;
      targetY = clientY;

      // Snap immediately on first entry so the spotlight never flies in from off-screen
      if (!isVisible || currentX === -9999) {
        currentX = clientX;
        currentY = clientY;
      }

      if (rafId === 0) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        return;
      }
      updateTarget(e.clientX, e.clientY);
    };

    const onDragOver = (e: DragEvent) => {
      if (e.clientX > 0 || e.clientY > 0) {
        updateTarget(e.clientX, e.clientY);
      }
    };

    const hideSpotlight = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      isVisible = false;
      el.dataset.active = "false";
    };

    const onMouseOut = (e: MouseEvent) => {
      // Only hide when the cursor actually leaves the browser viewport window,
      // not when crossing internal sticky/composited section boundaries.
      if (e.relatedTarget !== null) return;
      const outOfBounds =
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight;
      if (outOfBounds) {
        hideSpotlight();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        hideSpotlight();
      }
    };

    const updateSubscription = () => {
      const shouldListen = finePointerMq.matches && !reducedMotionMq.matches;
      if (shouldListen && !listening) {
        listening = true;
        window.addEventListener("pointermove", onPointerMove, {
          capture: true,
          passive: true,
        });
        window.addEventListener("pointerdown", onPointerMove, {
          capture: true,
          passive: true,
        });
        window.addEventListener("dragover", onDragOver, {
          capture: true,
          passive: true,
        });
        window.addEventListener("mouseout", onMouseOut, { passive: true });
        window.addEventListener("blur", hideSpotlight, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange, {
          passive: true,
        });
      } else if (!shouldListen && listening) {
        listening = false;
        window.removeEventListener("pointermove", onPointerMove, true);
        window.removeEventListener("pointerdown", onPointerMove, true);
        window.removeEventListener("dragover", onDragOver, true);
        window.removeEventListener("mouseout", onMouseOut);
        window.removeEventListener("blur", hideSpotlight);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        hideSpotlight();
      }
    };

    updateSubscription();
    finePointerMq.addEventListener("change", updateSubscription);
    reducedMotionMq.addEventListener("change", updateSubscription);

    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      finePointerMq.removeEventListener("change", updateSubscription);
      reducedMotionMq.removeEventListener("change", updateSubscription);
      if (listening) {
        window.removeEventListener("pointermove", onPointerMove, true);
        window.removeEventListener("pointerdown", onPointerMove, true);
        window.removeEventListener("dragover", onDragOver, true);
        window.removeEventListener("mouseout", onMouseOut);
        window.removeEventListener("blur", hideSpotlight);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  const customVars: Record<string, string> = {};
  if (radius !== undefined) customVars["--spotlight-radius"] = `${radius}px`;
  if (opacity !== undefined) customVars["--spotlight-opacity"] = String(opacity);
  if (color !== undefined) customVars["--spotlight-color"] = color;
  if (glowColor !== undefined) customVars["--spotlight-glow-color"] = glowColor;

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      data-spotlight="cursor"
      data-active="false"
      style={customVars as React.CSSProperties}
      className={`cursor-spotlight${className ? ` ${className}` : ""}`}
    />
  );
}
