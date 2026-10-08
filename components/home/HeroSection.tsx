import Link from "next/link";
import type { SiteSettings } from "@/types/site";

/** Decorative concentric-rings widget — matches the reference hero's center ornament. */
function RingsWidget() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden="true" className="h-36 w-36 opacity-60 md:h-52 md:w-52 lg:h-64 lg:w-64">
      {[100, 78, 56, 34].map((r) => (
        <circle key={r} cx="110" cy="110" r={r} stroke="#22C55E" strokeOpacity={0.35 - r / 400} strokeWidth="1" />
      ))}
      <circle cx="110" cy="110" r="5" fill="#22C55E" />
      <path d="M110 96v28M96 110h28" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Editorial hero — matches the reference template:
 * "STUNNING PHOTOGRAPHY BY / NAME" left, decorative rings widget in the
 * center, "LET'S ↗ / WORK TOGETHER" right. Stacks vertically on mobile.
 */
export function HeroSection({ site }: { site: SiteSettings | null }) {
  return (
    <section className="relative overflow-hidden border-b border-dark-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-55/10 blur-[120px]"
      />
      {/* Center widget — absolutely centered, behind text */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
      >
        <RingsWidget />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center gap-10 px-5 py-16 md:flex-row md:justify-between md:px-10 lg:py-24">
        <div className="self-start">
          <p className="font-medium text-sm font-medium uppercase tracking-[0.2em] text-grey-40 md:text-base">
            NHIẾP ẢNH BỞI
          </p>
          <h1 className="mt-3 font-semibold text-[44px] font-semibold leading-[1.05] tracking-tight text-absolutewhite sm:text-[64px] lg:text-[80px]">
            {(site?.photographerName ?? "Bấu Chụp Choẹt").toUpperCase()}
          </h1>
        </div>

        <div className="flex flex-col items-start gap-2 self-start md:items-end">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-[32px] font-semibold leading-none text-absolutewhite sm:text-[44px] lg:text-[54px]">
              CÙNG
            </p>
            <Link
              href="/booking"
              aria-label="Đặt lịch chụp"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-55 shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-105 sm:h-14 sm:w-14"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17L17 7M17 7H9M17 7v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <p className="font-semibold text-[32px] font-semibold leading-none text-absolutewhite sm:text-[44px] lg:text-[54px]">
            HỢP TÁC
          </p>
        </div>
      </div>
    </section>
  );
}
