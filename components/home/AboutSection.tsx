import Image from "next/image";
import Link from "next/link";
import { CONTACT, FacebookIcon, InstagramIcon, MailIcon, MessengerIcon, PhoneIcon } from "@/components/shared/contact";
import type { SiteSettings } from "@/types/site";

const cardTitle =
  "flex items-center gap-2.5 font-semibold text-lg font-semibold text-absolutewhite";

const socialBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite";

/**
 * About — matches the reference: eyebrow + big title + "Know More" CTA on top,
 * portrait image left, Introduction and Contact Information cards right.
 */
export function AboutSection({ site }: { site: SiteSettings | null }) {
  // The self-introduction image is reserved to the backend's "Admin" category —
  // never a public-gallery photo. `aboutPhoto` is resolved server-side and is
  // null when no eligible photo exists.
  const portrait = site?.aboutPhoto ?? null;
  const name = site?.photographerName ?? "Bấu Chụp Choẹt";
  // Same contact channels as the site footer (shared source: lib contact.tsx).
  const socials = [
    { label: "Facebook", url: CONTACT.facebook, Icon: FacebookIcon },
    { label: "Instagram", url: CONTACT.instagram, Icon: InstagramIcon },
    { label: "Messenger", url: site?.messengerUrl, Icon: MessengerIcon },
  ].filter((s) => s.url);

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
            className="hidden shrink-0 rounded-[10px] bg-dark-08 px-5 py-2.5 font-medium text-sm font-medium text-absolutewhite transition-colors hover:bg-dark-15 sm:inline-block"
          >
            Xem thêm ↗
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
                  alt={portrait.altText ?? portrait.title ?? `Chân dung ${name}`}
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
                <span aria-hidden="true" className="text-purple-55">✦</span> Giới thiệu
              </h3>
              <p className="mt-4 text-sm leading-7 text-grey-50">
                {site?.bio ??
                  "Nhiếp ảnh gia tại Việt Nam, tập trung vào chân dung, cặp đôi và những khoảnh khắc đời thường. Tôi làm việc với ánh sáng tự nhiên để tạo ra những bức ảnh chân thật."}
              </p>
              {site?.experience && (
                <p className="mt-3 font-medium text-xs font-medium uppercase tracking-[0.12em] text-purple-90">
                  {site.experience}
                </p>
              )}
            </div>

            <div className="rounded-[14px] bg-dark-08 p-6 md:p-8">
              <h3 className={cardTitle}>
                <span aria-hidden="true" className="text-purple-55">✦</span> Thông tin liên hệ
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
                  href="/booking"
                  className="ml-auto rounded-[10px] bg-purple-55 px-6 py-2.5 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.03]"
                >
                  Đặt lịch chụp
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
