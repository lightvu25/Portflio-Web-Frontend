"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  /** Slide direction before entering the viewport. */
  from?: "up" | "down" | "left" | "right";
};

const offsets = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
};

/**
 * Scroll-reveal wrapper — fades/slides children in when they enter the
 * viewport and back out when they leave, so animation replays both ways.
 */
export function Reveal({ children, className = "", delay = 0, from = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal transition-all duration-700 ease-out will-change-transform ${
        visible ? "translate-x-0 translate-y-0 opacity-100" : `opacity-0 ${offsets[from]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
