"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

const BRAND = "BẤU CHỤP CHOẸT";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Bộ sưu tập", href: "/gallery" },
  { label: "Dịch vụ", href: "/pricing" },
  { label: "Đặt lịch", href: "/booking" },
  { label: "Cảm nhận", href: "/feedback" },
];

/** Editorial header with a morphing active-pill that slides between nav items. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // Measure the active link and slide the background pill to it ("morph").
  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const active = nav?.querySelector<HTMLElement>('[data-active="true"]');
      if (!nav || !active) {
        setPill(null);
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setPill({ left: rect.left - navRect.left, width: rect.width });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  // Admin pages render their own chrome.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-dark-12 bg-dark-03/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="font-semibold text-lg font-semibold tracking-[0.14em] text-absolutewhite">
          {BRAND}
        </Link>

        {/* Desktop nav — outlined pill bar with sliding morph highlight */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 rounded-full border border-dark-20 p-1.5 md:flex"
          aria-label="Primary navigation"
        >
          <span
            aria-hidden="true"
            className={`absolute top-1.5 bottom-1.5 rounded-full bg-dark-08 transition-[left,width,opacity] duration-300 ease-out ${
              pill ? "opacity-100" : "opacity-0"
            }`}
            style={{ left: pill?.left ?? 0, width: pill?.width ?? 0 }}
          />
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                  active ? "text-absolutewhite" : "text-grey-70 hover:text-absolutewhite"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="hidden rounded-[10px] bg-purple-55 px-5 py-2.5 font-medium text-sm text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.03] md:inline-block"
          >
            Liên hệ
          </Link>
          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-dark-12 text-grey-80 md:hidden"
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-dark-12 px-5 py-3 md:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-[8px] px-3 py-2.5 font-medium text-sm font-medium ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-dark-08 text-absolutewhite"
                  : "text-grey-70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
