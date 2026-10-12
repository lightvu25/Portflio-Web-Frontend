"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CategoryMarquee } from "@/components/shared/CategoryMarquee";
import { CONTACT, FacebookIcon, InstagramIcon } from "@/components/shared/contact";
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

  const fetched = useRef(false);
  useEffect(() => {
    if (fetched.current || pathname.startsWith("/admin")) return;
    fetched.current = true;
    getCategories().then(setCategories).catch(() => {});
    getSiteSettings().then(setSite).catch(() => {});
  }, [pathname]);

  // Admin pages render their own chrome.
  if (pathname.startsWith("/admin")) return null;

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
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={socialBtn}>
              <InstagramIcon />
            </a>
            <a href={CONTACT.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className={socialBtn}>
              <FacebookIcon />
            </a>
            <span aria-hidden="true" className="text-dark-20">|</span>
            <a href={CONTACT.mailto} className={`${linkCls} text-xs`}>
              {CONTACT.email}
            </a>
            <span aria-hidden="true" className="text-dark-20">|</span>
            <a href={CONTACT.phoneHref} className={`${linkCls} text-xs`}>
              {CONTACT.phone}
            </a>
          </div>
          <p className="text-xs text-grey-40">
            © {new Date().getFullYear()} {site?.photographerName ?? "Bấu Chụp Choẹt"}
          </p>
        </div>
      </div>
    </footer>
  );
}
