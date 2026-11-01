import type { ComponentType } from "react";
import {
  ClockEveningIcon,
  ClockIcon,
  FilesFolderIcon,
  FilmStripIcon,
  MapPinRouteIcon,
  PhotoFrameIcon,
  SparkleIcon,
  StaffProfileIcon,
  StudioLightIcon,
  TravelBikeIcon,
  type ServiceIconProps,
} from "@/components/pricing/ServiceIcons";

/** Photographer-defined service constants — exact policy & schedule strings preserved. */
const SESSIONS = [
  { label: "Ca sáng", time: "07:00 – 11:30" },
  { label: "Ca chiều", time: "13:00 – 17:00" },
] as const;

interface BenefitItem {
  title: string;
  note?: string;
  Icon: ComponentType<ServiceIconProps>;
}

const BENEFITS: readonly BenefitItem[] = [
  {
    title: "Súng bong bóng, hắt sáng",
    Icon: SparkleIcon,
  },
  {
    title: "Đèn (flash + giả nắng)",
    Icon: StudioLightIcon,
  },
  {
    title: "Trả full file đã căn chỉnh cơ bản",
    Icon: FilesFolderIcon,
  },
  {
    title: "Hậu kì 10 ảnh chi tiết",
    Icon: PhotoFrameIcon,
  },
  {
    title: "Staff đi kèm",
    note: "(có tính thêm phí)",
    Icon: StaffProfileIcon,
  },
  {
    title: "Hỗ trợ chụp film",
    note: "(nếu khách có máy sẵn)",
    Icon: FilmStripIcon,
  },
];

/**
 * Editorial photography-studio specification block for /pricing:
 *  1. Thời gian nhận ca
 *  2. Quyền lợi dịch vụ
 *  3. Phụ phí & Lưu ý
 *
 * Designed on the clean white studio canvas (`bg-dark-03` = #FFFFFF) with dark ink
 * (`text-absolutewhite` = #121214, `text-grey-70` = #4C4E57), hairline borders
 * (`border-dark-12`), and brand olive accents (`text-brand-60` / `text-brand-90`).
 * Stacks headings cleanly above content up to 1279px so tablet (768px) and small
 * desktop (1024px) never feel cramped, switching to a 12-column index split at `xl`.
 */
export function ServiceInfoSection() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
      {/* 1. Thời gian nhận ca */}
      <div className="grid grid-cols-1 gap-6 border-b border-dark-12 py-10 md:py-12 xl:grid-cols-12 xl:gap-10">
        <div className="xl:col-span-3">
          <span
            aria-hidden="true"
            className="block font-mono text-xs font-medium tracking-[0.14em] text-brand-90"
          >
            01
          </span>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-absolutewhite md:text-xl">
            Thời gian nhận ca
          </h2>
        </div>

        <dl className="grid grid-cols-1 divide-y divide-dark-12 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:col-span-9">
          {SESSIONS.map((s, idx) => (
            <div
              key={s.label}
              className={
                idx === 0
                  ? "pb-5 sm:pb-0 sm:pr-8 md:pr-12"
                  : "pt-5 sm:pt-0 sm:pl-8 md:pl-12"
              }
            >
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-grey-70">
                <ClockIcon size={17} className="shrink-0 text-brand-60" />
                <span>{s.label}</span>
              </dt>
              <dd className="mt-2.5 text-3xl font-semibold tracking-tight tabular-nums text-absolutewhite md:text-4xl">
                {s.time}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 2. Quyền lợi dịch vụ */}
      <div className="grid grid-cols-1 gap-6 border-b border-dark-12 py-10 md:py-12 xl:grid-cols-12 xl:gap-10">
        <div className="xl:col-span-3">
          <span
            aria-hidden="true"
            className="block font-mono text-xs font-medium tracking-[0.14em] text-brand-90"
          >
            02
          </span>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-absolutewhite md:text-xl">
            Quyền lợi dịch vụ
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:col-span-9">
          {BENEFITS.map(({ title, note, Icon }) => (
            <li key={title} className="flex items-start gap-3.5">
              <Icon size={20} className="mt-0.5 shrink-0 text-brand-60" />
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-snug text-absolutewhite">
                  {title}
                </p>
                {note && (
                  <p className="mt-1 text-xs leading-5 text-grey-70">{note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Phụ phí & Lưu ý */}
      <div className="grid grid-cols-1 gap-6 border-b border-dark-12 py-10 md:py-12 xl:grid-cols-12 xl:gap-10">
        <div className="xl:col-span-3">
          <span
            aria-hidden="true"
            className="block font-mono text-xs font-medium tracking-[0.14em] text-brand-90"
          >
            03
          </span>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-absolutewhite md:text-xl">
            Phụ phí &amp; Lưu ý
          </h2>
        </div>

        <div className="xl:col-span-9">
          <div className="grid grid-cols-1 divide-y divide-dark-12 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="flex items-start gap-3.5 pb-5 sm:pb-0 sm:pr-8 md:pr-10">
              <ClockEveningIcon
                size={20}
                className="mt-0.5 shrink-0 text-brand-60"
              />
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold leading-snug text-absolutewhite">
                  Chụp kéo dài đến 19:00
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-grey-70">
                  Phụ phí{" "}
                  <span className="font-semibold tabular-nums text-brand-90">
                    +300.000 VNĐ
                  </span>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 pt-5 sm:pt-0 sm:pl-8 md:pl-10">
              <MapPinRouteIcon
                size={20}
                className="mt-0.5 shrink-0 text-brand-60"
              />
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold leading-snug text-absolutewhite">
                  Chụp ngoại tỉnh
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-grey-70">
                  <span className="font-semibold text-absolutewhite">
                    Chỉ áp dụng cho gói Cả ngày.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3.5 border-t border-dark-12 pt-5 sm:mt-6 sm:pt-6">
            <TravelBikeIcon
              size={20}
              className="mt-0.5 shrink-0 text-brand-60"
            />
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-snug text-absolutewhite">
                Chi phí di chuyển
              </h3>
              <p className="mt-1.5 max-w-[68ch] text-sm leading-6 text-grey-70">
                Giá gói chưa bao gồm chi phí di chuyển. Phí di chuyển được ước
                tính theo địa điểm chụp thực tế và sẽ được xác nhận trước khi
                chốt lịch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
