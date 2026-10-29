"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CategoryMarquee,
  MARQUEE_CATEGORIES,
} from "@/components/shared/CategoryMarquee";
import { CtaArrowLink } from "@/components/shared/CtaArrowLink";
import {
  CONTACT,
  FacebookIcon,
  InstagramIcon,
  resolveFacebookHref,
  resolveInstagramHref,
  resolveZaloHref,
  resolveZaloPhone,
  ZaloIcon,
} from "@/components/shared/contact";
import { getCategories } from "@/lib/api/categories";
import { getSiteSettings } from "@/lib/api/site";
import { isPublicPortfolioCategory } from "@/lib/labels";
import {
  cancelActiveSnap,
  dispatchNavIntent,
  resolveCategoryHref,
  smoothScrollToElement,
  smoothScrollToTop,
} from "@/lib/navigation";
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

  const publicCategories = useMemo(
    () => categories.filter(isPublicPortfolioCategory),
    [categories],
  );

  const footerCategoryLinks = useMemo(() => {
    if (publicCategories.length > 0) {
      return publicCategories.slice(0, 5).map((c) => ({
        key: String(c.id),
        label: c.name,
        href: `/gallery?category=${encodeURIComponent(c.name)}`,
      }));
    }
    return MARQUEE_CATEGORIES.map((name) => ({
      key: name,
      label: name,
      href: resolveCategoryHref(name, null),
    }));
  }, [publicCategories]);

  // Admin pages render their own chrome.
  if (pathname.startsWith("/admin")) return null;

  const facebookHref = resolveFacebookHref(site?.facebookUrl);
  const instagramHref = resolveInstagramHref(site?.instagramUrl);
  const zaloPhone = resolveZaloPhone(site?.messengerUrl);
  const zaloHref = resolveZaloHref(site?.messengerUrl);

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    cancelActiveSnap();
    if (pathname === "/") {
      e.preventDefault();
      if (window.location.hash || window.location.search) {
        window.history.pushState(null, "", "/");
      }
      dispatchNavIntent({ type: "scroll-top" });
    }
  };

  const handleGalleryRootClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    cancelActiveSnap();
    if (pathname === "/gallery") {
      e.preventDefault();
      if (window.location.search || window.location.hash) {
        window.history.pushState(null, "", "/gallery");
      }
      dispatchNavIntent({ type: "gallery-category", category: null });
      smoothScrollToTop();
    }
  };

  const handleGalleryCategoryClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    categoryName: string,
  ) => {
    cancelActiveSnap();
    if (pathname === "/gallery") {
      e.preventDefault();
      window.history.pushState(null, "", href);
      dispatchNavIntent({ type: "gallery-category", category: categoryName });
      smoothScrollToElement("gallery-grid", 16);
    }
  };

  const handlePricingOverviewClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    cancelActiveSnap();
    if (pathname === "/pricing") {
      e.preventDefault();
      if (window.location.search || window.location.hash) {
        window.history.pushState(null, "", "/pricing");
      }
      dispatchNavIntent({ type: "pricing-overview" });
    }
  };

  const handleBookingClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sessionType?: "HALF_DAY" | "FULL_DAY",
  ) => {
    cancelActiveSnap();
    if (pathname === "/pricing") {
      e.preventDefault();
      const targetUrl = sessionType
        ? `/pricing?session=${sessionType}#booking`
        : `/pricing#booking`;
      window.history.pushState(null, "", targetUrl);
      dispatchNavIntent({ type: "pricing-booking", sessionType });
    }
  };

  const handleFeedbackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    cancelActiveSnap();
    if (pathname === "/") {
      e.preventDefault();
      if (window.location.hash !== "#feedback") {
        window.history.pushState(null, "", "/#feedback");
      }
      dispatchNavIntent({ type: "scroll-element", id: "feedback" });
    }
  };

  return (
    <footer className="border-t border-dark-12">
      {/* Scrolling category band */}
      <div className="border-b border-dark-12 bg-dark-06">
        <CategoryMarquee availableCategories={publicCategories} />
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
              ĐẶT LỊCH
            </p>
            <CtaArrowLink label="Đặt lịch ngay" />
          </div>
          <p className="mt-1 font-semibold text-4xl font-semibold leading-tight text-absolutewhite md:text-5xl">
            NGAY
          </p>
        </div>

        {/* Link columns */}
        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Footer navigation">
          <div>
            <h3 className={colTitle}>Trang chủ</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/" onClick={handleHomeClick} className={linkCls}>
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/gallery" onClick={handleGalleryRootClick} className={linkCls}>
                  Bộ sưu tập
                </Link>
              </li>
              <li>
                <Link href="/pricing" onClick={handlePricingOverviewClick} className={linkCls}>
                  Dịch vụ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>Đặt lịch</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/pricing#booking"
                  onClick={(e) => handleBookingClick(e)}
                  className={linkCls}
                >
                  Đặt lịch ngay
                </Link>
              </li>
              <li>
                <Link href="/pricing" onClick={handlePricingOverviewClick} className={linkCls}>
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link href="/#feedback" onClick={handleFeedbackClick} className={linkCls}>
                  Gửi cảm nhận
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>Bộ sưu tập</h3>
            <ul className="mt-4 space-y-2.5">
              {footerCategoryLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleGalleryCategoryClick(e, item.href, item.label)}
                    className={linkCls}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>Dịch vụ</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/pricing?session=HALF_DAY#booking"
                  onClick={(e) => handleBookingClick(e, "HALF_DAY")}
                  className={linkCls}
                >
                  Nửa ngày
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing?session=FULL_DAY#booking"
                  onClick={(e) => handleBookingClick(e, "FULL_DAY")}
                  className={linkCls}
                >
                  Cả ngày
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing#booking"
                  onClick={(e) => handleBookingClick(e)}
                  className={linkCls}
                >
                  Lịch trống
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-4 px-5 py-6 md:flex-row md:justify-between md:px-10">
          <div className="flex gap-6">
            <Link
              href="/pricing"
              onClick={handlePricingOverviewClick}
              className={`${linkCls} text-xs`}
            >
              Dịch vụ &amp; Quyền lợi
            </Link>
            <span aria-hidden="true" className="text-dark-20">|</span>
            <Link
              href="/pricing#booking"
              onClick={(e) => handleBookingClick(e)}
              className={`${linkCls} text-xs`}
            >
              Đặt lịch
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <a href={instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram" className={socialBtn}>
              <InstagramIcon />
            </a>
            <a href={facebookHref} target="_blank" rel="noreferrer" aria-label="Facebook" className={socialBtn}>
              <FacebookIcon />
            </a>
            <a href={zaloHref} target="_blank" rel="noreferrer" aria-label={`Zalo ${zaloPhone}`} className={socialBtn}>
              <ZaloIcon />
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
