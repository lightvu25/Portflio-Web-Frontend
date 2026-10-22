import { CtaArrowLink } from "@/components/shared/CtaArrowLink";
import type { SiteSettings } from "@/types/site";

/** Decorative concentric-rings widget — matches the reference hero's center ornament. */
function RingsWidget() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden="true" className="h-36 w-36 opacity-60 md:h-52 md:w-52 lg:h-64 lg:w-64">
      {[100, 78, 56, 34].map((r) => (
        <circle key={r} cx="110" cy="110" r={r} stroke="var(--brand-55)" strokeOpacity={0.35 - r / 400} strokeWidth="1" />
      ))}
    </svg>
  );
}

/**
 * Editorial hero — matches the reference template:
 * "Chào cả nhà, tui tên là / NAME" left, decorative rings widget in the
 * center, "ĐẶT LỊCH ↗ / NGAY" right. Stacks vertically on mobile.
 */
export function HeroSection({ site }: { site: SiteSettings | null }) {
  return (
    <section className="relative overflow-hidden border-b border-dark-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-55/10 blur-[120px]"
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
            Chào cả nhà, tui tên là
          </p>
          <h1 className="mt-3 font-semibold text-[44px] font-semibold leading-[1.05] tracking-tight text-absolutewhite sm:text-[64px] lg:text-[80px]">
            {(site?.photographerName ?? "Bấu Chụp Choẹt").toUpperCase()}
          </h1>
        </div>

        <div className="flex flex-col items-start gap-2 self-start md:items-end">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-[32px] font-semibold leading-none text-absolutewhite sm:text-[44px] lg:text-[54px]">
              ĐẶT LỊCH
            </p>
            <CtaArrowLink label="Đặt lịch ngay" />
          </div>
          <p className="font-semibold text-[32px] font-semibold leading-none text-absolutewhite sm:text-[44px] lg:text-[54px]">
            NGAY
          </p>
        </div>
      </div>
    </section>
  );
}
