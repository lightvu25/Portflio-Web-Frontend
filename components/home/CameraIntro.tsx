"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SESSION_KEY = "bau_camera_intro_seen_v1";
const MIN_SHUTTER_HOLD_MS = 280;
const SHUTTER_OPEN_FAILSAFE_MS = 1280;
const MINIMAL_FADE_FAILSAFE_MS = 320;

/** Module-level flag so SPA back/forward navigations to `/` with warm image cache never flash an overlay. */
let seenInCurrentDocument = false;

type LoaderMode = "shutter" | "minimal";
type LoaderPhase = "holding" | "opening";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const INTRO_CSS = `
.bau-cam-intro-overlay {
  --intro-step-x: 16vw;
  --intro-step-y: 11vh;
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: auto;
  user-select: none;
  overflow: hidden;
}
.bau-cam-intro-overlay[data-phase="opening"] {
  pointer-events: none;
}
@media (max-width: 767px) {
  .bau-cam-intro-overlay {
    --intro-step-x: 28vw;
    --intro-step-y: 12vh;
  }
}

/* ---------------- Mode 1: Camera Shutter Intro (First Visit) ---------------- */
.bau-cam-blade {
  position: absolute;
  background-color: #0a0a0c;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}
.bau-cam-blade-top {
  top: 0;
  left: 0;
  right: 0;
  height: 50.5vh;
}
.bau-cam-blade-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 50.5vh;
}
.bau-cam-blade-left {
  top: 0;
  bottom: 0;
  left: 0;
  width: 50.5vw;
}
.bau-cam-blade-right {
  top: 0;
  bottom: 0;
  right: 0;
  width: 50.5vw;
}

.bau-cam-intro-overlay[data-mode="shutter"][data-phase="opening"] {
  animation: bauOverlayDone 1.16s linear forwards;
}
.bau-cam-intro-overlay[data-mode="shutter"][data-phase="opening"] .bau-cam-blade-top {
  animation: bauShutterTop 1.12s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-intro-overlay[data-mode="shutter"][data-phase="opening"] .bau-cam-blade-bottom {
  animation: bauShutterBottom 1.12s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-intro-overlay[data-mode="shutter"][data-phase="opening"] .bau-cam-blade-left {
  animation: bauShutterLeft 1.12s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-intro-overlay[data-mode="shutter"][data-phase="opening"] .bau-cam-blade-right {
  animation: bauShutterRight 1.12s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

.bau-cam-viewfinder {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--intro-step-x) * 2);
  height: calc(var(--intro-step-y) * 2);
  min-width: 196px;
  min-height: 132px;
  transform: translate3d(-50%, -50%, 0) scale(0.84);
  opacity: 0;
  will-change: transform, opacity;
  animation: bauViewfinderFocus 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.bau-cam-intro-overlay[data-mode="shutter"][data-phase="opening"] .bau-cam-viewfinder {
  animation: bauViewfinderExpand 1.12s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

.bau-cam-corner {
  position: absolute;
  width: 16px;
  height: 16px;
}
.bau-cam-tl {
  top: 0;
  left: 0;
  border-top: 1.5px solid rgba(255, 255, 255, 0.78);
  border-left: 1.5px solid rgba(255, 255, 255, 0.78);
}
.bau-cam-tr {
  top: 0;
  right: 0;
  border-top: 1.5px solid rgba(255, 255, 255, 0.78);
  border-right: 1.5px solid rgba(255, 255, 255, 0.78);
}
.bau-cam-bl {
  bottom: 0;
  left: 0;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.78);
  border-left: 1.5px solid rgba(255, 255, 255, 0.78);
}
.bau-cam-br {
  bottom: 0;
  right: 0;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.78);
  border-right: 1.5px solid rgba(255, 255, 255, 0.78);
}
.bau-cam-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  transform: translate3d(-50%, -50%, 0);
}
.bau-cam-crosshair::before,
.bau-cam-crosshair::after {
  content: "";
  position: absolute;
  background-color: rgba(163, 190, 149, 0.85);
}
.bau-cam-crosshair::before {
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  transform: translateY(-50%);
}
.bau-cam-crosshair::after {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  transform: translateX(-50%);
}

.bau-cam-hud {
  position: absolute;
  left: 50%;
  top: calc(50% + max(var(--intro-step-y), 66px) + 22px);
  transform: translate3d(-50%, 0, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 168px;
  transition: opacity 0.18s ease-out;
}
.bau-cam-intro-overlay[data-phase="opening"] .bau-cam-hud {
  opacity: 0;
}
.bau-cam-hud-bar {
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.16);
  overflow: hidden;
}
.bau-cam-hud-fill {
  height: 100%;
  border-radius: 999px;
  background-color: #a3be95;
  transition: width 0.22s ease-out;
}
.bau-cam-hud-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.66);
  font-variant-numeric: tabular-nums;
}

/* ---------------- Mode 2: Minimal Studio Loader (Reload / Reduced Motion) ---------------- */
.bau-cam-minimal {
  display: none;
}
.bau-cam-intro-overlay[data-mode="minimal"],
.bau-cam-intro-overlay[data-prepaint-minimal="1"] {
  z-index: 55;
  background-color: var(--dark-03, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.24s ease-out, visibility 0.24s ease-out;
}
.bau-cam-intro-overlay[data-mode="minimal"][data-phase="opening"],
.bau-cam-intro-overlay[data-prepaint-minimal="1"][data-phase="opening"] {
  opacity: 0;
  visibility: hidden;
  animation: none !important;
}
.bau-cam-intro-overlay[data-mode="minimal"] .bau-cam-blade,
.bau-cam-intro-overlay[data-mode="minimal"] .bau-cam-viewfinder,
.bau-cam-intro-overlay[data-mode="minimal"] .bau-cam-hud,
.bau-cam-intro-overlay[data-prepaint-minimal="1"] .bau-cam-blade,
.bau-cam-intro-overlay[data-prepaint-minimal="1"] .bau-cam-viewfinder,
.bau-cam-intro-overlay[data-prepaint-minimal="1"] .bau-cam-hud {
  display: none !important;
}
.bau-cam-intro-overlay[data-mode="minimal"] .bau-cam-minimal,
.bau-cam-intro-overlay[data-prepaint-minimal="1"] .bau-cam-minimal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.bau-cam-minimal-spinner {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 2px solid var(--dark-15, #d8d8de);
  border-top-color: var(--brand-55, #6B8E5A);
  animation: bauMinimalSpin 0.8s linear infinite;
}
.bau-cam-minimal-bar {
  width: 148px;
  height: 2px;
  border-radius: 999px;
  background-color: var(--dark-12, #e4e4e9);
  overflow: hidden;
}
.bau-cam-minimal-fill {
  height: 100%;
  border-radius: 999px;
  background-color: var(--brand-55, #6B8E5A);
  transition: width 0.2s ease-out;
}
.bau-cam-minimal-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--grey-50, #767882);
  font-variant-numeric: tabular-nums;
}

@keyframes bauMinimalSpin {
  to { transform: rotate(360deg); }
}
@keyframes bauViewfinderFocus {
  0% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(0.72); }
  100% { opacity: 0.96; transform: translate3d(-50%, -50%, 0) scale(0.88); }
}
@keyframes bauShutterTop {
  0% { transform: translate3d(0, 0, 0); }
  32% { transform: translate3d(0, calc(var(--intro-step-y) * -1), 0); }
  100% { transform: translate3d(0, -52vh, 0); }
}
@keyframes bauShutterBottom {
  0% { transform: translate3d(0, 0, 0); }
  32% { transform: translate3d(0, var(--intro-step-y), 0); }
  100% { transform: translate3d(0, 52vh, 0); }
}
@keyframes bauShutterLeft {
  0% { transform: translate3d(0, 0, 0); }
  32% { transform: translate3d(calc(var(--intro-step-x) * -1), 0, 0); }
  100% { transform: translate3d(-52vw, 0, 0); }
}
@keyframes bauShutterRight {
  0% { transform: translate3d(0, 0, 0); }
  32% { transform: translate3d(var(--intro-step-x), 0, 0); }
  100% { transform: translate3d(52vw, 0, 0); }
}
@keyframes bauViewfinderExpand {
  0% { opacity: 0.96; transform: translate3d(-50%, -50%, 0) scale(0.88); }
  32% { opacity: 0.95; transform: translate3d(-50%, -50%, 0) scale(1); }
  85% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(2.8); }
  100% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(3.2); }
}
@keyframes bauOverlayDone {
  0%, 96% { opacity: 1; visibility: visible; }
  100% { opacity: 0; visibility: hidden; }
}
@media (prefers-reduced-motion: reduce) {
  .bau-cam-minimal-spinner {
    animation-duration: 1.6s;
  }
}
`;

/**
 * Runs synchronously before first paint so reloads (`sessionStorage === "1"`) or
 * `prefers-reduced-motion` switch seamlessly to the white studio loader instead
 * of flashing dark shutter blades or exposing unloaded grey Polaroid frames.
 */
const PRE_PAINT_MODE_SCRIPT = `try{if(sessionStorage.getItem("${SESSION_KEY}")==="1"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.currentScript.parentElement.setAttribute("data-prepaint-minimal","1")}}catch(e){}`;

/**
 * Homepage loading gate + camera-shutter aperture intro (`/`).
 *
 * Behavior:
 *  - Waits in `"holding"` until `ready === true` (all scroll-driven hero images
 *    have finished downloading and decoding, or the stage fail-safe fires).
 *  - First visit in session: holds the matte-black camera viewfinder with a
 *    subtle progress indicator, then expands the rectangular shutter aperture.
 *  - Reload (`F5`) or `prefers-reduced-motion`: displays a clean light-mode
 *    studio loader continuous with `app/loading.tsx` until hero images finish,
 *    then fades out smoothly.
 *  - SPA navigation back to `/` when images are already decoded in memory:
 *    dismisses synchronously before paint (`0ms` delay).
 */
export function CameraIntro({
  ready = true,
  loadedCount = 0,
  totalCount = 0,
}: {
  ready?: boolean;
  loadedCount?: number;
  totalCount?: number;
} = {}) {
  const [mode, setMode] = useState<LoaderMode>("shutter");
  const [phase, setPhase] = useState<LoaderPhase>("holding");
  const [dismissed, setDismissed] = useState(false);
  const [minHoldElapsed, setMinHoldElapsed] = useState(false);
  const initializedRef = useRef(false);
  const wasSeenInDocOnMountRef = useRef(false);
  const paintedWhileWaitingRef = useRef(false);

  // Sync mode before paint and skip immediately on warm-cache SPA revisits.
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      wasSeenInDocOnMountRef.current = seenInCurrentDocument;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let seenInSession = seenInCurrentDocument;
      if (!seenInSession) {
        try {
          seenInSession = window.sessionStorage.getItem(SESSION_KEY) === "1";
        } catch {
          // Storage blocked — fall back to in-memory flag.
        }
      }

      const resolvedMode: LoaderMode =
        reducedMotion || seenInSession ? "minimal" : "shutter";

      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      seenInCurrentDocument = true;

      queueMicrotask(() => {
        setMode(resolvedMode);
        if (resolvedMode === "minimal") {
          setMinHoldElapsed(true);
        }
      });
    }

    if (wasSeenInDocOnMountRef.current && ready && !paintedWhileWaitingRef.current) {
      queueMicrotask(() => {
        setDismissed(true);
      });
    }
  }, [ready]);

  // Mark if the browser actually painted a waiting frame so subsequent completion fades smoothly.
  useEffect(() => {
    if (!ready) {
      paintedWhileWaitingRef.current = true;
    }
  }, [ready]);

  // Brief settle beat on first-visit shutter mode so the viewfinder focus-in never snaps abruptly.
  useEffect(() => {
    if (dismissed || minHoldElapsed || mode !== "shutter") return;
    const timer = window.setTimeout(() => {
      setMinHoldElapsed(true);
    }, MIN_SHUTTER_HOLD_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [dismissed, minHoldElapsed, mode]);

  // Transition from "holding" -> "opening" as soon as hero images are ready.
  useEffect(() => {
    if (dismissed || phase === "opening") return;
    if (!ready) return;
    if (mode === "shutter" && !minHoldElapsed) return;

    const rafId = window.requestAnimationFrame(() => {
      setPhase("opening");
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [dismissed, phase, ready, mode, minHoldElapsed]);

  // Guaranteed unmount once the opening shutter or minimal fade completes.
  useEffect(() => {
    if (dismissed || phase !== "opening") return;
    const duration =
      mode === "shutter" ? SHUTTER_OPEN_FAILSAFE_MS : MINIMAL_FADE_FAILSAFE_MS;
    const timer = window.setTimeout(() => {
      setDismissed(true);
    }, duration);
    return () => {
      window.clearTimeout(timer);
    };
  }, [dismissed, phase, mode]);

  if (dismissed) return null;

  const safeTotal = Math.max(0, totalCount);
  const safeLoaded = Math.min(safeTotal, Math.max(0, loadedCount));
  const percent =
    ready || safeTotal === 0
      ? 100
      : Math.min(99, Math.max(6, Math.round((safeLoaded / safeTotal) * 100)));

  return (
    <div
      suppressHydrationWarning
      role="status"
      aria-live="polite"
      aria-label="Đang tải trang chủ"
      data-camera-intro={phase === "holding" ? "holding" : "opening"}
      data-mode={mode}
      data-phase={phase}
      className="bau-cam-intro-overlay"
      onAnimationEnd={(e) => {
        if (
          mode === "shutter" &&
          phase === "opening" &&
          e.target instanceof HTMLElement &&
          e.target.classList.contains("bau-cam-blade-top")
        ) {
          setDismissed(true);
        }
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: INTRO_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_MODE_SCRIPT }} />

      {/* First-visit Camera Shutter + Viewfinder */}
      <div className="bau-cam-blade bau-cam-blade-top" />
      <div className="bau-cam-blade bau-cam-blade-bottom" />
      <div className="bau-cam-blade bau-cam-blade-left" />
      <div className="bau-cam-blade bau-cam-blade-right" />
      <div className="bau-cam-viewfinder" aria-hidden="true">
        <span className="bau-cam-corner bau-cam-tl" />
        <span className="bau-cam-corner bau-cam-tr" />
        <span className="bau-cam-corner bau-cam-bl" />
        <span className="bau-cam-corner bau-cam-br" />
        <span className="bau-cam-crosshair" />
      </div>
      <div className="bau-cam-hud" aria-hidden="true">
        <div className="bau-cam-hud-bar">
          <div className="bau-cam-hud-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="bau-cam-hud-label">
          {safeTotal > 0 ? `Đang tải ảnh · ${percent}%` : "Đang chuẩn bị…"}
        </span>
      </div>

      {/* Reload / Reduced-motion Clean Studio Loader */}
      <div className="bau-cam-minimal" aria-hidden="true">
        <div className="bau-cam-minimal-spinner" />
        {safeTotal > 0 && (
          <>
            <div className="bau-cam-minimal-bar">
              <div
                className="bau-cam-minimal-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="bau-cam-minimal-label">
              Đang tải ảnh · {safeLoaded}/{safeTotal}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
