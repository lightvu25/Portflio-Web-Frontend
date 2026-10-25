"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { BookingSection } from "@/components/booking/BookingPage";
import { Reveal } from "@/components/shared/Reveal";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";

/** Photographer-defined service constants — stable content, kept as page data. */
const SESSIONS = [
  { label: "Ca sáng", time: "07:00 – 11:30" },
  { label: "Ca chiều", time: "13:00 – 17:00" },
];

const BENEFITS = [
  "Không giới hạn file chụp",
  "Thoải mái check ảnh",
  "Full file đã căn chỉnh cơ bản",
  "Hậu kỳ 10 ảnh chi tiết",
  "Lưu file 3 tháng",
  "Hỗ trợ hắt sáng",
  "Hỗ trợ súng bắn bong bóng",
  "Hỗ trợ đèn giả nắng",
  "Hỗ trợ đèn flash",
  "Hỗ trợ chụp phim nếu khách có sẵn máy",
  "Staff hỗ trợ tính thêm phí",
];

const SURCHARGES = [
  {
    title: "Chụp kéo dài đến 19:00",
    detail: "Phụ phí +300.000 VNĐ.",
  },
  {
    title: "Chụp ngoại tỉnh",
    detail: "Chỉ áp dụng cho gói Cả ngày.",
  },
  {
    title: "Chi phí di chuyển",
    detail:
      "Giá gói chưa bao gồm chi phí di chuyển. Phí di chuyển được ước tính theo địa điểm chụp thực tế và sẽ được xác nhận trước khi chốt lịch.",
  },
];

/** The three customer groups — keyed by PricingPackage.groupSize. */
const GROUPS = [
  { size: 1, title: "Cá nhân" },
  { size: 2, title: "2 người" },
  { size: 3, title: "3 người" },
];

/** Package cover → group's other covers → page photos → neutral surface. */
function packageImage(p: PricingPackage, groupCovers: Map<number, string>, fallback?: string) {
  return p.coverImageUrl ?? groupCovers.get(p.groupSize) ?? fallback ?? null;
}

/**
 * Combined Services & Booking page (/pricing):
 *  1. Group selector & Pricing packages
 *  2. Session times, Benefits, Surcharges
 *  3. Concise 4-step Booking Process ("Giữ lịch trong 4 bước") with 4 large display numbers
 *  4. Integrated Booking Form (#booking) right below
 */
export function PricingPage({
  packages,
  deposit,
  photos = [],
  turnstileSiteKey,
}: {
  packages: PricingPackage[];
  deposit: number;
  photos?: Photo[];
  turnstileSiteKey?: string;
}) {
  const [group, setGroup] = useState(1);
  const [selectedPkgId, setSelectedPkgId] = useState<number | undefined>(
    undefined,
  );
  const gridRef = useRef<HTMLDivElement>(null);

  /** Representative image per group: first package cover in that group. */
  const groupCovers = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of packages) {
      if (p.coverImageUrl && !map.has(p.groupSize)) map.set(p.groupSize, p.coverImageUrl);
    }
    return map;
  }, [packages]);

  const fallbackImage = photos[0]?.imageUrl ?? null;
  const groupPackages = useMemo(
    () => packages.filter((p) => p.groupSize === group),
    [packages, group],
  );

  const handleChoosePackage = (pkg: PricingPackage) => {
    setSelectedPkgId(pkg.id);
    setGroup(pkg.groupSize);
    const el = document.getElementById("booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBookingSelectPkgId = (id: number) => {
    setSelectedPkgId(id);
    const found = packages.find((p) => p.id === id);
    if (found) {
      setGroup(found.groupSize);
    }
  };

  // Smooth staggered GSAP entrance whenever the selected group changes.
  useGSAP(
    () => {
      const container = gridRef.current;
      if (!container) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>(".pricing-card", container);
      if (cards.length === 0) return;

      if (reduceMotion) {
        gsap.set(cards, { autoAlpha: 1, y: 0, clearProps: "transform,willChange" });
        return;
      }

      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 20, willChange: "transform, opacity" },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "transform,willChange",
        },
      );
    },
    { scope: gridRef, dependencies: [group] },
  );

  const fourSteps = [
    {
      num: "01",
      title: "Chọn gói chụp",
      detail: "Xem bộ sưu tập và bảng giá, chọn gói chụp hợp gu bạn thích.",
    },
    {
      num: "02",
      title: "Gửi thông tin",
      detail: "Chọn ngày chụp ở form bên dưới, web tự soạn sẵn tin nhắn gửi Bấu.",
    },
    {
      num: "03",
      title: "Cọc giữ lịch",
      detail: `Bấu xác nhận lịch trống và gửi thông tin cọc ${formatVnd(deposit)} để giữ lịch.`,
    },
    {
      num: "04",
      title: "Chụp và nhận ảnh",
      detail: "Trao đổi thống nhất concept trước buổi chụp và nhận ảnh hậu kỳ sau 1 tuần.",
    },
  ];

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal from="up">
            <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Dịch vụ &amp; Đặt lịch
            </p>
            <h1 className="mt-3 font-semibold text-4xl font-semibold text-absolutewhite md:text-6xl">
              Bảng giá chụp ảnh
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-grey-50">
              Gói chụp cho cá nhân và nhóm nhỏ. Đặt cọc {formatVnd(deposit)} để giữ lịch —
              phần còn lại thanh toán sau buổi chụp.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Group picker */}
      <section aria-label="Chọn nhóm chụp" className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Bạn chụp cho bao nhiêu người?
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3" role="group" aria-label="Nhóm khách hàng">
            {GROUPS.map((g) => {
              const count = packages.filter((p) => p.groupSize === g.size).length;
              const img = groupCovers.get(g.size) ?? fallbackImage;
              const active = group === g.size;
              return (
                <button
                  key={g.size}
                  type="button"
                  onClick={() => setGroup(g.size)}
                  aria-pressed={active}
                  className={`group overflow-hidden rounded-[14px] text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 ${
                    active
                      ? "bg-brand-55/15"
                      : "bg-dark-08 hover:bg-dark-15"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-dark-12">
                    {img && (
                      <Image
                        src={img}
                        alt={g.title}
                        fill
                        quality={100}
                        sizes="(min-width: 1280px) 480px, (min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    {active && (
                      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-55 text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold text-lg font-semibold text-absolutewhite">{g.title}</p>
                      <p className="mt-0.5 text-xs text-grey-40">
                        {count > 0 ? `${count} gói — chụp cho ${g.size} người` : "Chưa có gói"}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`shrink-0 text-sm transition-transform duration-200 ${active ? "text-brand-55" : "text-grey-40 group-hover:translate-x-0.5"}`}
                    >
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages of the selected group */}
      <section className="flex-1" aria-live="polite">
        <div
          ref={gridRef}
          className="mx-auto grid max-w-[1400px] gap-5 px-5 py-12 sm:grid-cols-2 md:px-10 lg:grid-cols-3"
        >
          {groupPackages.map((p) => {
            const img = packageImage(p, groupCovers, fallbackImage ?? undefined);
            return (
              <article
                key={p.id}
                className="pricing-card flex h-full flex-col overflow-hidden rounded-[14px] bg-dark-08"
              >
                {img ? (
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={img}
                      alt={`${p.name} — ${sessionTypeLabel[p.sessionType]}`}
                      fill
                      quality={100}
                      sizes="(min-width: 1280px) 480px, (min-width: 1024px) 38vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div aria-hidden="true" className="aspect-[4/3] w-full bg-dark-12" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-brand-90">
                    {sessionTypeLabel[p.sessionType]}
                  </p>
                  <h2 className="mt-3 font-semibold text-xl font-semibold text-absolutewhite">
                    {p.name}
                  </h2>
                  <p className="mt-2 font-semibold text-2xl font-semibold text-brand-55">
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
                  <button
                    type="button"
                    onClick={() => handleChoosePackage(p)}
                    className="mt-6 block w-full rounded-[10px] bg-brand-55 py-2.5 text-center font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-[1.02] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2"
                  >
                    Đặt gói này
                  </button>
                </div>
              </article>
            );
          })}
          {groupPackages.length === 0 && (
            <p className="col-span-full py-16 text-center text-sm text-grey-40">
              {packages.length === 0
                ? "Bảng giá đang được cập nhật — vui lòng quay lại sau."
                : "Chưa có gói nào cho nhóm này — hãy chọn nhóm khác."}
            </p>
          )}
        </div>

        {/* Session times */}
        <div className="mx-auto max-w-[1400px] px-5 pb-12 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Thời gian nhận ca
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SESSIONS.map((s) => (
              <div key={s.label} className="rounded-[14px] bg-dark-08 p-6">
                <p className="text-sm text-grey-50">{s.label}</p>
                <p className="mt-1 font-semibold text-2xl font-semibold text-absolutewhite">
                  {s.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Service benefits */}
        <div className="mx-auto max-w-[1400px] px-5 pb-12 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Quyền lợi dịch vụ
          </h2>
          <div className="mt-4 grid gap-3 rounded-[14px] bg-dark-08 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <p key={b} className="flex items-start gap-2.5 text-sm text-grey-70">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-brand-55">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {b}
              </p>
            ))}
          </div>
        </div>

        {/* Surcharges & conditions (separated from package prices) */}
        <div className="mx-auto max-w-[1400px] px-5 pb-14 md:px-10">
          <h2 className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-grey-40">
            Phụ phí &amp; Lưu ý
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {SURCHARGES.map((item) => (
              <div
                key={item.title}
                className="rounded-[14px] bg-dark-08 p-5"
              >
                <p className="font-semibold text-sm font-semibold text-absolutewhite">
                  {item.title}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-grey-70">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Redesigned 4-step Booking Process with 4 large display numbers */}
        <div className="mx-auto max-w-[1400px] px-5 pb-16 md:px-10">
          <Reveal from="up">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-medium text-xs font-medium uppercase tracking-[0.14em] text-brand-55">
                  Quy trình đặt lịch
                </p>
                <h2 className="mt-2 font-semibold text-3xl font-semibold text-absolutewhite md:text-4xl">
                  Giữ lịch trong 4 bước
                </h2>
                <p className="mt-1.5 text-sm text-grey-50">
                  Giữ lịch chụp với Bấu trong 4 bước gọn gàng.
                </p>
              </div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-55/30 bg-brand-55/10 px-4 py-2 text-xs font-medium text-absolutewhite">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-55" />
                Hạn giao ảnh: sau 1 tuần kể từ khi khách chọn ảnh.
              </p>
            </div>

            <div className="relative mt-8">
              {/* Subtle connecting line across the 4 cards on desktop */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-8 right-8 top-12 hidden h-[2px] bg-gradient-to-r from-brand-55/25 via-brand-55/45 to-brand-55/25 lg:block"
              />
              <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {fourSteps.map((step) => (
                  <li
                    key={step.num}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[16px] border border-dark-12 bg-dark-08 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-55/40 hover:shadow-[0_14px_32px_rgba(107,142,90,0.12)]"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-5xl font-bold leading-none tracking-tight tabular-nums text-brand-55 md:text-6xl">
                          {step.num}
                        </span>
                      </div>
                      <h3 className="mt-5 font-semibold text-lg font-semibold text-absolutewhite">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-grey-70">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Integrated Booking Section (#booking) */}
      <BookingSection
        packages={packages}
        turnstileSiteKey={turnstileSiteKey}
        selectedPackageId={selectedPkgId}
        onSelectPackageId={handleBookingSelectPkgId}
      />
    </main>
  );
}
