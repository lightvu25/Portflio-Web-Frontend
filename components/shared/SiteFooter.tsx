"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryMarquee } from "@/components/shared/CategoryMarquee";
import { getCategories } from "@/lib/api/categories";
import { getSiteSettings } from "@/lib/api/site";
import type { Category } from "@/types/category";
import type { SiteSettings } from "@/types/site";

const linkCls =
  "text-sm text-grey-50 transition-colors hover:text-absolutewhite";
const colTitle =
  "font-semibold text-xs font-semibold uppercase tracking-[0.14em] text-grey-70";
const socialBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-full bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite";

/**
 * Footer matching the reference: category marquee band on top, brand CTA
 * block on the left, link columns on the right, legal/social bottom bar.
 */
export function SiteFooter() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [site, setSite] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getSiteSettings().then(setSite).catch(() => {});
  }, []);

  // Admin pages render their own chrome.
  if (pathname.startsWith("/admin")) return null;

  const socials = [
    { label: "Facebook", url: site?.facebookUrl },
    { label: "Instagram", url: site?.instagramUrl },
    { label: "Messenger", url: site?.messengerUrl },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-dark-12">
      {/* Scrolling category band */}
      <div className="border-b border-dark-12 bg-dark-06">
        <CategoryMarquee categories={categories.map((c) => c.name)} />
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 md:px-10 lg:grid-cols-[2fr_3fr]">
        {/* Brand + CTA */}
        <div>
          <p className="font-medium text-xs font-medium uppercase tracking-[0.18em] text-grey-40">
            {site?.photographerName ?? "Bấu Chụp Choẹt"} — Nhiếp ảnh gia
          </p>
          <div className="mt-4 flex items-center gap-4">
            <p className="font-semibold text-4xl font-semibold leading-tight text-absolutewhite md:text-5xl">
              CÙNG NHAU
            </p>
            <Link
              href="/booking"
              aria-label="Đặt lịch chụp"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-55 text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-105"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 font-semibold text-4xl font-semibold leading-tight text-absolutewhite md:text-5xl">
            TẠO KHOẢNH KHẮC
          </p>
        </div>

        {/* Link columns */}
        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Footer navigation">
          <div>
            <h3 className={colTitle}>Trang chủ</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/" className={linkCls}>Trang chủ</Link></li>
              <li><Link href="/gallery" className={linkCls}>Bộ sưu tập</Link></li>
              <li><Link href="/feedback" className={linkCls}>Cảm nhận</Link></li>
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>Đặt lịch</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/booking" className={linkCls}>Đặt lịch chụp</Link></li>
              <li><Link href="/pricing" className={linkCls}>Bảng giá</Link></li>
              <li><Link href="/feedback" className={linkCls}>Gửi cảm nhận</Link></li>
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>Bộ sưu tập</h3>
            <ul className="mt-4 space-y-2.5">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/gallery?category=${encodeURIComponent(c.name)}`} className={linkCls}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>Dịch vụ</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/pricing" className={linkCls}>Nửa ngày</Link></li>
              <li><Link href="/pricing" className={linkCls}>Cả ngày</Link></li>
              <li><Link href="/booking" className={linkCls}>Lịch trống</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-5 py-6 md:flex-row md:justify-between md:px-10">
          <div className="flex gap-6">
            <Link href="#" className={`${linkCls} text-xs`}>Điều khoản</Link>
            <span aria-hidden="true" className="text-dark-20">|</span>
            <Link href="#" className={`${linkCls} text-xs`}>Bảo mật</Link>
          </div>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.url!} target="_blank" rel="noreferrer" aria-label={s.label} className={socialBtn}>
                {s.label === "Facebook" && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V5.1c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z"/></svg>
                )}
                {s.label === "Instagram" && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>
                )}
                {s.label === "Messenger" && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.9 3 3 6.6 3 11.1c0 2.6 1.2 4.9 3.2 6.4V21l2.9-1.6c.9.3 1.9.4 2.9.4 5.1 0 9-3.6 9-8.1S17.1 3 12 3zm1 10.9-2.4-2.6-4.3 2.6 4.7-5 2.4 2.6 4.3-2.6-4.7 5z"/></svg>
                )}
              </a>
            ))}
          </div>
          <p className="text-xs text-grey-40">
            © {new Date().getFullYear()} {site?.photographerName ?? "Bấu Chụp Choẹt"}
          </p>
        </div>
      </div>
    </footer>
  );
}
