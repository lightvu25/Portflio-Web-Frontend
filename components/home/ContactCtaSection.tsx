import Link from "next/link";
import { formatVnd } from "@/lib/labels";
import type { SiteSettings } from "@/types/site";

/** Closing contact / booking CTA band. */
export function ContactCtaSection({ site }: { site: SiteSettings | null }) {
  const deposit = site?.depositAmount ?? 500000;
  return (
    <section aria-label="Đặt lịch chụp" className="border-b border-dark-12">
      <div className="mx-auto max-w-[1400px] px-5 py-16 text-center md:px-10 md:py-24">
        <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
          Sẵn sàng khi bạn sẵn sàng
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-semibold text-3xl font-semibold leading-tight text-absolutewhite md:text-5xl">
          Cùng tạo nên những bức ảnh đáng giữ.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-grey-50">
          Kiểm tra lịch trống, chọn gói chụp và giữ chỗ cho buổi chụp của bạn. Đặt cọc{" "}
          {formatVnd(deposit)} để giữ lịch.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/booking"
            className="rounded-[10px] bg-purple-55 px-8 py-3.5 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.02]"
          >
            Đặt lịch chụp
          </Link>
          <Link
            href="/gallery"
            className="rounded-[10px] bg-dark-12 px-8 py-3.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15"
          >
            Xem bộ sưu tập
          </Link>
        </div>
      </div>
    </section>
  );
}
