import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types/photo";
import type { SiteSettings } from "@/types/site";

const cardTitle =
  "flex items-center gap-2.5 font-semibold text-lg font-semibold text-absolutewhite";

const socialBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite";

/**
 * About — matches the reference: eyebrow + big title + "Know More" CTA on top,
 * portrait image left, Introduction and Contact Information cards right.
 */
export function AboutSection({ photos, site }: { photos: Photo[]; site: SiteSettings | null }) {
  const portrait = photos[0];
  const name = site?.photographerName ?? "Bấu Chụp Choẹt";
  const socials = [
    { label: "Facebook", url: site?.facebookUrl },
    { label: "Instagram", url: site?.instagramUrl },
    { label: "Messenger", url: site?.messengerUrl },
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
          {/* Portrait */}
          {portrait && (
            <Link
              href={`/gallery/${portrait.id}`}
              className="group relative block overflow-hidden rounded-[14px] bg-dark-08"
            >
              <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[480px]">
                <Image
                  src={site?.profileImageUrl ?? portrait.imageUrl}
                  alt={site?.profileImageUrl ? `Chân dung ${name}` : (portrait.altText ?? portrait.title ?? "Ảnh")}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
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
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {socials.map((s) => (
                  <a key={s.label} href={s.url!} target="_blank" rel="noreferrer" aria-label={s.label} className={socialBtn}>
                    {s.label === "Facebook" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V5.1c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z"/></svg>
                    )}
                    {s.label === "Instagram" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>
                    )}
                    {s.label === "Messenger" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.9 3 3 6.6 3 11.1c0 2.6 1.2 4.9 3.2 6.4V21l2.9-1.6c.9.3 1.9.4 2.9.4 5.1 0 9-3.6 9-8.1S17.1 3 12 3zm1 10.9-2.4-2.6-4.3 2.6 4.7-5 2.4 2.6 4.3-2.6-4.7 5z"/></svg>
                    )}
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
