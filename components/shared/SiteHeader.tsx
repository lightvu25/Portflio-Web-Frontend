"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  cancelActiveSnap,
  dispatchNavIntent,
  smoothScrollToTop,
} from "@/lib/navigation";

const BRAND = "BẤU CHỤP CHOẸT";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Bộ sưu tập", href: "/gallery" },
  { label: "Dịch vụ", href: "/pricing" },
];

function isNavItemActive(targetPath: string, itemHref: string): boolean {
  if (itemHref === "/") return targetPath === "/";
  return targetPath === itemHref || targetPath.startsWith(itemHref + "/");
}

/** Editorial header with a morphing active-pill that slides between nav items. */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<{ open: boolean; path: string }>({
    open: false,
    path: pathname,
  });
  const [pendingNav, setPendingNav] = useState<{
    fromPath: string;
    toHref: string;
  } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const open = menuState.open && menuState.path === pathname;
  const setOpen = (next: boolean) =>
    setMenuState({ open: next, path: pathname });

  const effectivePath =
    pendingNav && pendingNav.fromPath === pathname && pendingNav.toHref !== pathname
      ? pendingNav.toHref
      : pathname;

  // Allow closing mobile menu with Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuState({ open: false, path: pathname });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pathname]);

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
  }, [effectivePath]);

  // Admin pages render their own chrome.
  if (pathname.startsWith("/admin")) return null;

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setOpen(false);
    cancelActiveSnap();

    if (href === "/" && pathname === "/") {
      e.preventDefault();
      if (window.location.hash || window.location.search) {
        window.history.pushState(null, "", "/");
      }
      dispatchNavIntent({ type: "scroll-top" });
      return;
    }

    if (href === "/gallery" && pathname === "/gallery") {
      e.preventDefault();
      if (window.location.search || window.location.hash) {
        window.history.pushState(null, "", "/gallery");
      }
      dispatchNavIntent({ type: "gallery-category", category: null });
      smoothScrollToTop();
      return;
    }

    if (href === "/pricing" && pathname === "/pricing") {
      e.preventDefault();
      if (window.location.search || window.location.hash) {
        window.history.pushState(null, "", "/pricing");
      }
      dispatchNavIntent({ type: "pricing-overview" });
      return;
    }

    setPendingNav({ fromPath: pathname, toHref: href });
  };

  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    cancelActiveSnap();

    if (pathname === "/pricing") {
      e.preventDefault();
      if (window.location.hash !== "#booking") {
        window.history.pushState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#booking`,
        );
      }
      dispatchNavIntent({ type: "pricing-booking" });
      return;
    }

    setPendingNav({ fromPath: pathname, toHref: "/pricing" });
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-dark-12 bg-dark-03/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-4 py-4 sm:px-5 md:px-10">
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="truncate font-semibold text-base font-semibold tracking-[0.12em] text-absolutewhite sm:text-lg sm:tracking-[0.14em]"
        >
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
            className={`pointer-events-none absolute left-0 top-1.5 bottom-1.5 rounded-full bg-dark-08 transition-[transform,width,opacity] duration-300 ease-out will-change-transform ${
              pill ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate3d(${pill?.left ?? 0}px, 0, 0)`,
              width: pill?.width ?? 0,
            }}
          />
          {navItems.map((item) => {
            const active = isNavItemActive(effectivePath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 ${
                  active
                    ? "text-absolutewhite"
                    : "text-grey-70 hover:text-absolutewhite"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/pricing#booking"
            onClick={handleBookingClick}
            className="inline-flex items-center justify-center rounded-full bg-brand-55 px-4 py-2 font-medium text-xs text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-[1.03] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2 sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3"
          >
            Đặt lịch
          </Link>
          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 md:hidden"
          >
            <span aria-hidden="true">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav overlay + click-outside backdrop */}
      {open && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[72px] z-40 bg-black/25 md:hidden"
          />
          <nav
            className="absolute left-0 right-0 top-full z-50 border-b border-dark-12 bg-dark-03/98 px-5 py-3.5 shadow-xl backdrop-blur-md md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isNavItemActive(effectivePath, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`block rounded-[8px] px-3 py-2.5 font-medium text-sm transition-colors ${
                      active
                        ? "bg-dark-08 text-absolutewhite"
                        : "text-grey-70 hover:bg-dark-06 hover:text-absolutewhite"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/pricing#booking"
              onClick={handleBookingClick}
              className="mt-2.5 block rounded-[10px] bg-brand-55 px-4 py-2.5 text-center font-medium text-sm text-white transition-colors hover:bg-brand-60"
            >
              Đặt lịch
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
