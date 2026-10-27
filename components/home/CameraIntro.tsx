"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "bau_camera_intro_seen_v1";
const FAILSAFE_MS = 1450;

/** Module-level flag so SPA back/forward navigations to `/` never replay the intro. */
let seenInCurrentDocument = false;

const INTRO_CSS = `
.bau-cam-intro-overlay {
  --intro-step-x: 16vw;
  --intro-step-y: 11vh;
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  animation: bauOverlayDone 1.32s linear forwards;
}
@media (max-width: 767px) {
  .bau-cam-intro-overlay {
    --intro-step-x: 28vw;
    --intro-step-y: 12vh;
  }
}
.bau-cam-blade {
  position: absolute;
  background-color: #0a0a0c;
  will-change: transform;
}
.bau-cam-blade-top {
  top: 0;
  left: 0;
  right: 0;
  height: 50.5vh;
  animation: bauShutterTop 1.28s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-blade-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 50.5vh;
  animation: bauShutterBottom 1.28s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-blade-left {
  top: 0;
  bottom: 0;
  left: 0;
  width: 50.5vw;
  animation: bauShutterLeft 1.28s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-blade-right {
  top: 0;
  bottom: 0;
  right: 0;
  width: 50.5vw;
  animation: bauShutterRight 1.28s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}
.bau-cam-viewfinder {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--intro-step-x) * 2);
  height: calc(var(--intro-step-y) * 2);
  min-width: 180px;
  min-height: 120px;
  transform: translate3d(-50%, -50%, 0) scale(0.35);
  opacity: 0;
  will-change: transform, opacity;
  animation: bauViewfinderExpand 1.28s cubic-bezier(0.76, 0, 0.24, 1) forwards;
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
@keyframes bauShutterTop {
  0%, 12% { transform: translate3d(0, 0, 0); }
  38% { transform: translate3d(0, calc(var(--intro-step-y) * -1), 0); }
  100% { transform: translate3d(0, -52vh, 0); }
}
@keyframes bauShutterBottom {
  0%, 12% { transform: translate3d(0, 0, 0); }
  38% { transform: translate3d(0, var(--intro-step-y), 0); }
  100% { transform: translate3d(0, 52vh, 0); }
}
@keyframes bauShutterLeft {
  0%, 12% { transform: translate3d(0, 0, 0); }
  38% { transform: translate3d(calc(var(--intro-step-x) * -1), 0, 0); }
  100% { transform: translate3d(-52vw, 0, 0); }
}
@keyframes bauShutterRight {
  0%, 12% { transform: translate3d(0, 0, 0); }
  38% { transform: translate3d(var(--intro-step-x), 0, 0); }
  100% { transform: translate3d(52vw, 0, 0); }
}
@keyframes bauViewfinderExpand {
  0% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(0.5); }
  14% { opacity: 1; transform: translate3d(-50%, -50%, 0) scale(0.72); }
  38% { opacity: 0.95; transform: translate3d(-50%, -50%, 0) scale(1); }
  85% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(2.8); }
  100% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(3.2); }
}
@keyframes bauOverlayDone {
  0%, 96% { opacity: 1; visibility: visible; }
  100% { opacity: 0; visibility: hidden; }
}
@media (prefers-reduced-motion: reduce) {
  .bau-cam-intro-overlay {
    display: none !important;
  }
}
`;

const PRE_PAINT_SKIP_SCRIPT = `try{if(sessionStorage.getItem("${SESSION_KEY}")==="1"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.currentScript.parentElement.style.display="none"}}catch(e){}`;

/**
 * Minimalist camera-shutter aperture intro for the homepage (`/`).
 *
 * Sequence (~1.28s):
 *  1. Viewport starts covered in matte black (`#0a0a0c`) with a minimal
 *     viewfinder crosshair + corner brackets in the center.
 *  2. A rectangular aperture opens at the center of the viewport, framing the
 *     hero content underneath.
 *  3. The rectangular aperture expands smoothly toward all four edges of the
 *     viewport and unmounts completely once finished.
 *
 * Safety & UX guarantees:
 *  - Runs at most once per browser session (`sessionStorage` + in-memory guard).
 *  - Skipped immediately when `prefers-reduced-motion: reduce` is active.
 *  - `pointer-events: none` throughout so clicks, scroll, and keyboard input
 *    are never blocked, plus both a CSS auto-hide keyframe and a JS failsafe
 *    timer that forces unmount.
 */
export function CameraIntro() {
  const [dismissed, setDismissed] = useState(() => seenInCurrentDocument);
  const startedByInstanceRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      seenInCurrentDocument = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      queueMicrotask(() => setDismissed(true));
      return;
    }

    if (!startedByInstanceRef.current) {
      if (seenInCurrentDocument) {
        queueMicrotask(() => setDismissed(true));
        return;
      }
      try {
        if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
          seenInCurrentDocument = true;
          queueMicrotask(() => setDismissed(true));
          return;
        }
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage blocked (e.g. strict privacy mode) — fall back to in-memory guard
      }
      seenInCurrentDocument = true;
      startedByInstanceRef.current = true;
    }

    const timer = window.setTimeout(() => {
      setDismissed(true);
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      aria-hidden="true"
      data-camera-intro="active"
      className="bau-cam-intro-overlay"
      onAnimationEnd={(e) => {
        if (e.target instanceof HTMLElement && e.target.classList.contains("bau-cam-blade-top")) {
          setDismissed(true);
        }
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: INTRO_CSS }} />
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SKIP_SCRIPT }} />
      <div className="bau-cam-blade bau-cam-blade-top" />
      <div className="bau-cam-blade bau-cam-blade-bottom" />
      <div className="bau-cam-blade bau-cam-blade-left" />
      <div className="bau-cam-blade bau-cam-blade-right" />
      <div className="bau-cam-viewfinder">
        <span className="bau-cam-corner bau-cam-tl" />
        <span className="bau-cam-corner bau-cam-tr" />
        <span className="bau-cam-corner bau-cam-bl" />
        <span className="bau-cam-corner bau-cam-br" />
        <span className="bau-cam-crosshair" />
      </div>
    </div>
  );
}
