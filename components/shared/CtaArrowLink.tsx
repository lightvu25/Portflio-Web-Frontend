import Link from "next/link";

/**
 * Circular arrow CTA used next to the "CÙNG HỢP TÁC" headings (hero + footer).
 * Equal width/height with shrink-0 keeps it a clean circle inside flex rows.
 */
export function CtaArrowLink({ className = "h-12 w-12 sm:h-14 sm:w-14" }: { className?: string }) {
  return (
    <Link
      href="/booking"
      aria-label="Đặt lịch chụp"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-purple-55 text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-105 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
