import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { PricingPackage } from "@/types/pricing";

/** Pricing page — packages from GET /api/pricing (active, sortOrder asc). */
export function PricingPage({ packages, deposit }: { packages: PricingPackage[]; deposit: number }) {
  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
            Dịch vụ
          </p>
          <h1 className="mt-3 font-semibold text-4xl font-semibold text-absolutewhite md:text-6xl">
            Bảng giá chụp ảnh
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-grey-50">
            Gói chụp cho cá nhân và cặp đôi. Đặt cọc {formatVnd(deposit)} để giữ lịch —
            phần còn lại thanh toán sau buổi chụp.
          </p>
        </div>
      </section>
      <section className="flex-1">
        <div className="mx-auto grid max-w-[1400px] gap-5 px-5 py-12 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
          {packages.map((p, i) => (
            <Reveal key={p.id} delay={i * 90} from="up">
            <article className="flex h-full flex-col rounded-[14px] border border-dark-12 bg-dark-08 p-6 transition-colors hover:border-dark-20">
              <p className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-purple-90">
                {sessionTypeLabel[p.sessionType]}
              </p>
              <h2 className="mt-3 font-semibold text-xl font-semibold text-absolutewhite">
                {p.name}
              </h2>
              <p className="mt-2 font-semibold text-2xl font-semibold text-purple-55">
                {formatVnd(p.price)}
              </p>
              <p className="mt-1 text-xs text-grey-40">
                cho {p.groupSize} người
              </p>
              {p.description && (
                <p className="mt-5 flex-1 text-sm leading-6 text-grey-50">
                  {p.description}
                </p>
              )}
              <Link
                href={`/booking?package=${p.id}`}
                className="mt-6 block rounded-[10px] bg-purple-55 py-2.5 text-center font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.02]"
              >
                Đặt gói này
              </Link>
            </article>
            </Reveal>
          ))}
          {packages.length === 0 && (
            <p className="col-span-full py-16 text-center text-sm text-grey-40">
              Bảng giá đang được cập nhật — vui lòng quay lại sau.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
