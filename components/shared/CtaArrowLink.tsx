"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cancelActiveSnap, dispatchNavIntent } from "@/lib/navigation";

/**
 * Circular arrow CTA used next to the "ĐẶT LỊCH NGAY" headings (hero + footer).
 * Equal width/height with shrink-0 keeps it a clean circle inside flex rows.
 */
export function CtaArrowLink({
  className = "h-12 w-12 sm:h-14 sm:w-14",
  label = "Đặt lịch ngay",
}: {
  className?: string;
  label?: string;
}) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    }
  };

  return (
    <Link
      href="/pricing#booking"
      onClick={handleClick}
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-55 text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-all hover:scale-105 hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
