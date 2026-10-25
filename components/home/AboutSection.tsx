import Image from "next/image";
import Link from "next/link";
import {
  CONTACT,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  resolveFacebookHref,
  resolveInstagramHref,
  resolveZaloHref,
  resolveZaloPhone,
  ZaloIcon,
} from "@/components/shared/contact";
import type { SiteSettings } from "@/types/site";

const cardTitle =
  "flex items-center gap-2.5 font-semibold text-lg font-semibold text-absolutewhite";

const socialBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55";

const DEFAULT_BIO =
  "Muốn tìm thợ chụp đẹp thì có rất nhiều, muốn tìm thợ đẹp zai, chụp đẹp thì hãy tìm đến anh";

/**
 * About — matches the reference: eyebrow + big title + "Xem bộ sưu tập" CTA on top,
 * portrait image left, Introduction and Contact Information cards right.
 */
export function AboutSection({ site }: { site: SiteSettings | null }) {
  // The self-introduction image is reserved to the backend's "Admin" category —
  // never a public-gallery photo. `aboutPhoto` is resolved server-side and is
  // null when no eligible photo exists.
  const portrait = site?.aboutPhoto ?? null;
  const name = site?.photographerName ?? "Bấu Chụp Choẹt";
  const bio = site?.bio?.trim() ? site.bio.trim() : DEFAULT_BIO;
  const experience = site?.experience?.trim() ? site.experience.trim() : null;

  const facebookHref = resolveFacebookHref(site?.facebookUrl);
  const instagramHref = resolveInstagramHref(site?.instagramUrl);
  const zaloPhone = resolveZaloPhone(site?.messengerUrl);
  const zaloHref = resolveZaloHref(site?.messengerUrl);

  // Same contact channels as the site footer (shared source: lib contact.tsx).
  const socials = [
    { label: "Facebook", url: facebookHref, Icon: FacebookIcon },
    { label: "Instagram", url: instagramHref, Icon: InstagramIcon },
    { label: `Zalo ${zaloPhone}`, url: zaloHref, Icon: ZaloIcon },
  ];

  return (
    <section aria-label="Giới thiệu nhiếp ảnh gia" className="border-b border-dark-12">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        {/* Section header */}
        <div className="flex items-end justify-between gap-4 border-b border-dark-12 pb-8">
          <div>
            <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Giới thiệu
            </p>
            <h2 className="mt-3 font-semibold text-3xl font-semibold uppercase text-absolutewhite md:text-5xl">
              Tôi là {name}
            </h2>
          </div>
          <Link
            href="/gallery"
            className="hidden shrink-0 rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 sm:inline-block"
          >
            Xem bộ sưu tập ↗
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Portrait — Admin-category photo only; no link, since Admin photos
              are not part of the public gallery/detail routes. */}
          {portrait ? (
            <div className="relative overflow-hidden rounded-[14px] bg-dark-08">
              <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[480px]">
                <Image
                  src={portrait.imageUrl}
                  alt={portrait.altText || portrait.title || `Chân dung ${name}`}
                  fill
                  quality={100}
                  sizes="(min-width: 1280px) 800px, (min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[14px] bg-dark-08 lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <p className="px-6 text-center text-sm text-grey-40">
                Ảnh giới thiệu sắp được cập nhật.
              </p>
            </div>
          )}

          {/* Info cards */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[14px] bg-dark-08 p-6 md:p-8">
              <h3 className={cardTitle}>
                <span aria-hidden="true" className="text-brand-55">✦</span> Giới thiệu
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-grey-50">
                {bio}
              </p>
              {experience && (
                <p className="mt-3 font-medium text-xs font-medium uppercase tracking-[0.12em] text-brand-90">
                  {experience}
                </p>
              )}
            </div>

            <div className="rounded-[14px] bg-dark-08 p-6 md:p-8">
              <h3 className={cardTitle}>
                <span aria-hidden="true" className="text-brand-55">✦</span> Thông tin liên hệ
              </h3>
              <div className="mt-6 space-y-3">
                <a
                  href={CONTACT.mailto}
                  className="flex items-center gap-3 text-sm text-grey-70 transition-colors hover:text-absolutewhite"
                >
                  <span className={socialBtn}><MailIcon /></span>
                  {CONTACT.email}
                </a>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center gap-3 text-sm text-grey-70 transition-colors hover:text-absolutewhite"
                >
                  <span className={socialBtn}><PhoneIcon /></span>
                  {CONTACT.phone}
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-dark-12 pt-6">
                {socials.map((s) => (
                  <a key={s.label} href={s.url!} target="_blank" rel="noreferrer" aria-label={s.label} className={socialBtn}>
                    <s.Icon size={16} />
                  </a>
                ))}
                <Link
                  href="/pricing#booking"
                  className="ml-auto rounded-[10px] bg-brand-55 px-6 py-2.5 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-[1.03] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2"
                >
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
