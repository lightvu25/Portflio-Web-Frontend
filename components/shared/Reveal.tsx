"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  /** Slide direction before entering the viewport. */
  from?: "up" | "down" | "left" | "right";
};

const OFFSET_PX = 24;

function getOffset(from: NonNullable<Props["from"]>) {
  switch (from) {
    case "up":
      return { x: 0, y: OFFSET_PX };
    case "down":
      return { x: 0, y: -OFFSET_PX };
    case "left":
      return { x: -OFFSET_PX, y: 0 };
    case "right":
      return { x: OFFSET_PX, y: 0 };
  }
}

/**
 * GSAP ScrollTrigger reveal wrapper.
 *
 * Uses a stationary outer trigger element (`triggerRef`) and animates only the
 * inner layer (`contentRef`) with compositor-only properties (`x`, `y`, `autoAlpha`)
 * and `once: true`. Because the trigger's bounding box never shifts during the
 * tween and the animation only plays once on enter, sections never oscillate
 * or jitter at the viewport boundary before/while scrolling into view.
 */
export function Reveal({ children, className = "", delay = 0, from = "up" }: Props) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { reduceMotion } = context.conditions ?? {};
          if (reduceMotion) {
            gsap.set(content, { autoAlpha: 1, x: 0, y: 0, clearProps: "transform,willChange" });
            return;
          }

          const { x, y } = getOffset(from);
          const rect = trigger.getBoundingClientRect();
          const alreadyInView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

          if (alreadyInView) {
            gsap.fromTo(
              content,
              { autoAlpha: 0, x, y, willChange: "transform, opacity" },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                duration: 0.65,
                delay: delay / 1000,
                ease: "power3.out",
                overwrite: "auto",
                clearProps: "transform,willChange",
              },
            );
          } else {
            gsap.set(content, { autoAlpha: 0, x, y, willChange: "transform, opacity" });
            gsap.to(content, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: 0.7,
              delay: delay / 1000,
              ease: "power3.out",
              overwrite: "auto",
              clearProps: "transform,willChange",
              scrollTrigger: {
                trigger,
                start: "top 88%",
                once: true,
              },
            });
          }
        },
      );

      return () => mm.revert();
    },
    { scope: triggerRef, dependencies: [delay, from] },
  );

  return (
    <div ref={triggerRef} className={className}>
      <div ref={contentRef} className="reveal">
        {children}
      </div>
    </div>
  );
}
