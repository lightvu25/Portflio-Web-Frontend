"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Photo } from "@/types/photo";
import styles from "./StickyGridSection.module.css";

const GRID_COUNT = 12;
const NUM_COLUMNS = 3;

/**
 * Scroll-driven sticky 3×4 photo grid showcase — adapted from Codrops
 * "Sticky Grid Scroll" (MIT License, Theo Plawinski & Codrops).
 *
 * Preserves the exact core animation architecture from the template:
 *  1. `initContent` — hides description & CTA button, centers title vertically via `yPercent`.
 *  2. `groupItemsByColumn` — buckets the 12 grid items into 3 columns (`index % 3`).
 *  3. `addParallaxOnScroll` — scrubs `.wrapper` from `yPercent: -100` (`top bottom` → `top top`).
 *  4. `animateTitleOnScroll` — fades in `.title` at `start: "top 57%"`.
 *  5. `animateGridOnScroll` — scrubbed timeline (`start: "top 25%"`, `end: "bottom bottom"`)
 *     combining `gridRevealTimeline`, `gridZoomTimeline` (`-=0.6`), and `toggleContent` (`-=0.32`).
 */
export function StickyGridSection({ photos }: { photos: Photo[] }) {
  const blockRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const content = contentRef.current;
      const title = titleRef.current;
      const description = descriptionRef.current;
      const button = buttonRef.current;
      const grid = gridRef.current;

      if (!block || !wrapper || !content || !title || !description || !button || !grid) {
        return;
      }

      const items = Array.from(grid.querySelectorAll<HTMLElement>("[data-grid-item]"));
      if (items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. initContent() — compute dynamic vertical center offset for title
        const getTitleOffsetY = () => {
          const contentH = content.offsetHeight || 1;
          const dy = (contentH - title.offsetHeight) / 2;
          return (dy / contentH) * 100;
        };

        gsap.set(title, {
          autoAlpha: 0,
          yPercent: getTitleOffsetY(),
        });
        gsap.set([description, button], {
          autoAlpha: 0,
          y: 16,
          pointerEvents: "none",
        });

        // 2. groupItemsByColumn()
        const columns: HTMLElement[][] = Array.from({ length: NUM_COLUMNS }, () => []);
        items.forEach((item, index) => {
          columns[index % NUM_COLUMNS].push(item);
        });

        // 3. Scrubbed title entry before sticky lock so scrolling up/down is 100% reversible
        gsap.fromTo(
          title,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            ease: "power1.out",
            overwrite: "auto",
            scrollTrigger: {
              trigger: block,
              start: "top 75%",
              end: "top 15%",
              scrub: 0.35,
              invalidateOnRefresh: true,
            },
          },
        );

        // 4. gridRevealTimeline(columns)
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

        // 5. gridZoomTimeline(columns) — zooms grid, parts columns, and scrubs title/CTA reveal
        const gridZoomTimeline = (cols = columns) => {
          const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.inOut" } });
          tl.to(grid, { scale: 2.05 }, 0);
          tl.to(cols[0], { xPercent: -40 }, 0);
          tl.to(cols[2], { xPercent: 40 }, 0);
          tl.to(
            cols[1],
            {
              yPercent: (index) => (index < Math.floor(cols[1].length / 2) ? -1 : 1) * 40,
              duration: 0.55,
              ease: "power2.inOut",
            },
            0.35,
          );
          tl.fromTo(
            title,
            { yPercent: () => getTitleOffsetY() },
            {
              yPercent: 0,
              duration: 0.5,
              ease: "power2.inOut",
              immediateRender: false,
            },
            0.42,
          );
          tl.fromTo(
            [description, button],
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.38,
              stagger: 0.05,
              ease: "power2.out",
              immediateRender: false,
            },
            0.56,
          );
          return tl;
        };

        // 6. Unified scrubbed mainTimeline — deterministic in both scroll directions
        const mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const interactive = self.progress >= 0.72;
              button.style.pointerEvents = interactive ? "auto" : "none";
            },
          },
        });

        mainTimeline
          .set(title, { yPercent: () => getTitleOffsetY() }, 0)
          .set([description, button], { autoAlpha: 0, y: 16 }, 0)
          .add(gridRevealTimeline(), 0)
          .add(gridZoomTimeline(), "-=0.55");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([wrapper, title, description, button, grid, ...items], {
          clearProps: "all",
        });
        gsap.set([title, description, button], {
          autoAlpha: 1,
          y: 0,
          yPercent: 0,
          pointerEvents: "auto",
        });
      });

      return () => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        mm.revert();
      };
    },
    { scope: blockRef, dependencies: [gridPhotos.length] },
  );

  if (gridPhotos.length === 0) return null;

  return (
    <section
      ref={blockRef}
      aria-label="Trải nghiệm bộ sưu tập"
      className={styles.block}
    >
      <div ref={wrapperRef} className={styles.wrapper}>
        <div ref={contentRef} className={styles.content}>
          <h2 ref={titleRef} className={styles.title}>
            <span className={styles.eyebrow}>Bấu Chụp Choẹt</span>
            Khoảnh khắc đáng giữ
          </h2>
          <p ref={descriptionRef} className={styles.description}>
            Mỗi khung hình là một câu chuyện tuổi trẻ tự nhiên, trong trẻo và
            tràn đầy cảm xúc qua ống kính của Bấu.
          </p>
          <Link ref={buttonRef} href="/gallery" className={styles.button}>
            Khám phá bộ sưu tập ↗
          </Link>
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
                  sizes="(min-width: 1024px) 260px, 30vw"
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
