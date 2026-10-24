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
    let isVisible = false;
    let listening = false;

    const flushPosition = () => {
      rafId = 0;
      el.style.setProperty("--spotlight-x", `${targetX}px`);
      el.style.setProperty("--spotlight-y", `${targetY}px`);
      if (!isVisible) {
        isVisible = true;
        el.dataset.active = "true";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        return;
      }
      targetX = e.clientX;
      targetY = e.clientY;
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(flushPosition);
      }
    };

    const onPointerLeave = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      isVisible = false;
      el.dataset.active = "false";
    };

    const updateSubscription = () => {
      const shouldListen = finePointerMq.matches && !reducedMotionMq.matches;
      if (shouldListen && !listening) {
        listening = true;
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onPointerLeave, {
          passive: true,
        });
        window.addEventListener("blur", onPointerLeave, { passive: true });
      } else if (!shouldListen && listening) {
        listening = false;
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
        onPointerLeave();
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
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
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
