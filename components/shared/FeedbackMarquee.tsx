"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { formatDate } from "@/lib/labels";
import type { Feedback } from "@/types/feedback";
import type { Photo } from "@/types/photo";

/** Auto-scroll speed in CSS px / second. */
const SPEED_PX_PER_SEC = 36;
/** Pause after the user releases a drag before auto-scroll resumes. */
const RESUME_DELAY_MS = 1500;
/** Pointer travel (px) before a press becomes a drag (so plain clicks still work). */
const DRAG_THRESHOLD_PX = 6;

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionServer = () => false;

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.6 5C6 6.6 3.9 9.6 3.9 13.1c0 3.3 2 5.9 5 5.9 2.4 0 4.2-1.8 4.2-4.1 0-2.2-1.6-3.9-3.8-3.9-.4 0-.8.1-1 .1.3-2 1.9-4 3.9-5.1L9.6 5zm10.5 0c-3.6 1.6-5.7 4.6-5.7 8.1 0 3.3 2 5.9 5 5.9 2.4 0 4.2-1.8 4.2-4.1 0-2.2-1.6-3.9-3.8-3.9-.4 0-.8.1-1 .1.3-2 1.9-4 3.9-5.1L20.1 5z" />
    </svg>
  );
}

const cardHover =
  "transition-[transform,box-shadow] duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50";

/** Feedback screenshot card — clicking the image opens the full-size view. */
function PhotoCard({
  photo,
  grow,
  interactive,
  onOpen,
}: {
  photo: Photo;
  grow: number;
  interactive: boolean;
  onOpen: (photo: Photo) => void;
}) {
  const label = photo.altText ?? photo.title ?? "Ảnh feedback của khách hàng";
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={interactive ? `Xem ảnh feedback: ${label}` : undefined}
      onClick={() => onOpen(photo)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(photo);
        }
      }}
      style={{ flexGrow: grow }}
      className={`relative min-h-0 basis-0 cursor-pointer overflow-hidden rounded-[18px] bg-dark-08 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 ${cardHover}`}
    >
      <Image
        src={photo.imageUrl}
        alt={interactive ? label : ""}
        fill
        quality={100}
        sizes="(min-width: 640px) 320px, 280px"
        className="object-cover"
        draggable={false}
      />
    </div>
  );
}

/** Feedback text card — separate from the image card. */
function TextCard({ feedback }: { feedback: Feedback }) {
  return (
    <figure
      className={`flex min-h-0 flex-1 basis-0 flex-col overflow-hidden rounded-[18px] bg-dark-08 p-5 ${cardHover}`}
    >
      <QuoteIcon className="h-6 w-6 shrink-0 text-brand-55/70" />
      <blockquote className="mt-3 line-clamp-5 flex-1 text-sm leading-7 text-grey-50">
        “{feedback.content}”
      </blockquote>
      <figcaption className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-dark-12/60 pt-3">
        <span className="truncate text-sm font-semibold text-absolutewhite">
          {feedback.customerName}
        </span>
        <span className="shrink-0 text-[11px] text-grey-40">{formatDate(feedback.createdAt)}</span>
      </figcaption>
    </figure>
  );
}

interface Column {
  key: string;
  photo: Photo | null;
  text: Feedback | null;
}

/** One marquee column: an image card and a text card stacked, order alternating per column. */
function ColumnView({
  column,
  index,
  interactive,
  onOpen,
}: {
  column: Column;
  index: number;
  interactive: boolean;
  onOpen: (photo: Photo) => void;
}) {
  const { photo, text } = column;
  const imageFirst = index % 2 === 0;
  const both = photo && text;
  const image = photo ? (
    <PhotoCard photo={photo} grow={both ? 1.6 : 1} interactive={interactive} onOpen={onOpen} />
  ) : null;
  const quote = text ? <TextCard feedback={text} /> : null;
  return (
    <div className="flex h-[560px] w-[270px] shrink-0 flex-col gap-4 sm:w-[310px]">
      {imageFirst ? image : quote}
      {imageFirst ? quote : image}
    </div>
  );
}

function PhotoLightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh feedback"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
      >
        ✕
      </button>
      <div className="relative h-[88vh] w-[94vw] max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={photo.imageUrl}
          alt={photo.altText ?? photo.title ?? "Ảnh feedback của khách hàng"}
          fill
          quality={100}
          sizes="(min-width: 1024px) 896px, 94vw"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

/**
 * Feedback marquee.
 *
 * Motion model — ONE controller (requestAnimationFrame writing `scrollLeft`):
 *  - auto-scroll runs continuously (hover does NOT pause it);
 *  - pressing the pointer pauses it immediately; while dragging only the
 *    user moves `scrollLeft`;
 *  - on release the position is kept and auto-scroll resumes after a short rest.
 * Seamless loop: the column set is rendered 3×; position is kept inside the
 * middle copy and shifted by exactly one copy width when it crosses an edge.
 * The pointer is only captured once movement passes a threshold, so a plain
 * click on an image still opens it. `touch-action: pan-y` keeps vertical page
 * scrolling working on touch devices.
 */
export function FeedbackMarquee({
  texts,
  photos,
}: {
  texts: Feedback[];
  photos: Photo[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<Column[]>(() => {
    const n = Math.max(texts.length, photos.length);
    return Array.from({ length: n }, (_, i) => ({
      key: `${photos[i]?.id ?? "x"}-${texts[i]?.id ?? "x"}-${i}`,
      photo: photos[i] ?? null,
      text: texts[i] ?? null,
    }));
  }, [texts, photos]);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );

  /** How many times the column set repeats inside one copy so a copy always spans the viewport. */
  const [repeat, setRepeat] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [zoomed, setZoomed] = useState<Photo | null>(null);

  // Mutable motion state — refs so frames never trigger React renders.
  const posRef = useRef(0); // float scroll position
  const copyWidthRef = useRef(0);
  const pressedRef = useRef(false);
  const draggedRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const initializedRef = useRef(false);
  const inViewRef = useRef(true);

  // Measure one copy; derive repeat count; place the viewport inside the middle copy.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const copy = copyRef.current;
    if (!viewport || !copy) return;
    const measure = () => {
      const baseWidth = copy.scrollWidth / repeat;
      if (baseWidth <= 0) return;
      const needed = Math.max(1, Math.ceil(viewport.clientWidth / baseWidth));
      if (needed !== repeat) {
        setRepeat(needed);
        return;
      }
      copyWidthRef.current = copy.offsetWidth;
      if (!initializedRef.current) {
        posRef.current = copy.offsetWidth;
        viewport.scrollLeft = copy.offsetWidth;
        initializedRef.current = true;
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(copy);
    return () => ro.disconnect();
  }, [columns, repeat]);

  /** Keep the float position inside the middle copy [w, 2w). */
  const wrap = useCallback((pos: number) => {
    const w = copyWidthRef.current;
    if (w <= 0) return pos;
    while (pos >= 2 * w) pos -= w;
    while (pos < w) pos += w;
    return pos;
  }, []);

  // Single animation loop — completely stops RAF when off-screen or when tab is hidden.
  useEffect(() => {
    if (reducedMotion || columns.length === 0) return;
    let raf = 0;
    let running = false;
    let last = performance.now();

    const tick = (now: number) => {
      if (!inViewRef.current || document.hidden) {
        running = false;
        raf = 0;
        return;
      }
      const dt = Math.min(64, now - last);
      last = now;
      const viewport = viewportRef.current;
      const active =
        viewport &&
        copyWidthRef.current > 0 &&
        !pressedRef.current &&
        now >= pausedUntilRef.current;
      if (active) {
        // Adopt any external scroll (wheel / keyboard) before advancing.
        if (Math.abs(viewport.scrollLeft - posRef.current) > 2) {
          posRef.current = viewport.scrollLeft;
        }
        posRef.current = wrap(posRef.current + (SPEED_PX_PER_SEC * dt) / 1000);
        viewport.scrollLeft = posRef.current;
      }
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running || !inViewRef.current || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    };

    const viewport = viewportRef.current;
    const obs =
      viewport && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              inViewRef.current = entry.isIntersecting;
              if (entry.isIntersecting) startLoop();
              else stopLoop();
            },
            { rootMargin: "120px 0px" },
          )
        : null;
    if (viewport && obs) obs.observe(viewport);

    const onVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    startLoop();

    return () => {
      stopLoop();
      obs?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reducedMotion, columns.length, wrap]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    pressedRef.current = true; // pauses auto-scroll immediately
    draggedRef.current = false;
    startXRef.current = e.clientX;
    posRef.current = viewport.scrollLeft;
    startPosRef.current = viewport.scrollLeft;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pressedRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const dx = e.clientX - startXRef.current;
    if (!draggedRef.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      draggedRef.current = true;
      setDragging(true);
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    // Re-anchor on wrap so dragging stays seamless in both directions.
    const target = startPosRef.current - dx;
    const wrapped = wrap(target);
    if (wrapped !== target) {
      startPosRef.current += wrapped - target;
    }
    posRef.current = wrapped;
    viewport.scrollLeft = wrapped;
  }, [wrap]);

  const endPress = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    const viewport = viewportRef.current;
    if (viewport) {
      posRef.current = viewport.scrollLeft;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* not captured */
      }
    }
    if (draggedRef.current) setDragging(false);
    pausedUntilRef.current = performance.now() + RESUME_DELAY_MS;
  }, []);

  /** Swallow the click that follows a real drag; plain clicks pass through. */
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      draggedRef.current = false;
    }
  }, []);

  const open = useCallback((photo: Photo) => setZoomed(photo), []);

  if (columns.length === 0) return null;

  return (
    <div className="relative w-full">
      <div
        ref={viewportRef}
        role="region"
        aria-label="Cảm nhận của khách hàng"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onClickCapture={onClickCapture}
        className={`flex w-full touch-pan-y select-none overflow-x-auto overflow-y-hidden py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {[0, 1, 2].map((copyIndex) => (
          <div
            key={copyIndex}
            ref={copyIndex === 0 ? copyRef : undefined}
            aria-hidden={copyIndex > 0 ? true : undefined}
            className="flex shrink-0 gap-4 pr-4"
          >
            {Array.from({ length: repeat }, (_, rep) =>
              columns.map((column, i) => (
                <ColumnView
                  key={`${rep}-${column.key}`}
                  column={column}
                  index={i}
                  interactive={copyIndex === 0 && rep === 0}
                  onOpen={open}
                />
              )),
            )}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-dark-06 to-transparent sm:w-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-dark-06 to-transparent sm:w-20"
      />
      {zoomed && <PhotoLightbox photo={zoomed} onClose={() => setZoomed(null)} />}
    </div>
  );
}
