# Frontend Visual & Production Integration Report — Bấu Chụp Choẹt

Updated: 2026-10-21

## 1. Homepage (`/`) Composition

Composed in `components/home/HomePage.tsx` and wired to live backend endpoints (`GET /api/site`, `GET /api/gallery/featured`, `GET /api/gallery`, `GET /api/categories`, `GET /api/feedback`):

| # | Section | File | Key Implementation Details |
|---|---------|------|----------------------------|
| 1 | Header / nav | `components/shared/SiteHeader.tsx` | Sticky header with desktop morphing active pill, visible `"Liên hệ"` button on both mobile and desktop (`whitespace-nowrap`), and mobile drawer with `"Đặt lịch ngay"` CTA |
| 2 | Hero | `components/home/HeroSection.tsx` | Eyebrow `"Chào cả nhà, tui tên là"`, photographer name from `/api/site`, `"ĐẶT LỊCH NGAY"` CTA + `CtaArrowLink` to `/booking`, decorative rings in `var(--brand-55)` (`#6B8E5A`) |
| 3 | Category marquee | `components/home/PhotographyMarquee.tsx` | Displays the 5 signature categories (`Kỉ yếu THCS`, `Kỉ yếu THPT`, `Tốt nghiệp đại học`, `Áo dài`, `Concept`) linking to `/gallery?category=<name>` when present in `/api/categories` |
| 4 | Featured collage | `components/home/FeaturedCollage.tsx` | Asymmetric 12-col collage rendered at `quality={100}` |
| 5 | About | `components/home/AboutSection.tsx` | Displays `site.aboutPhoto` (resolved exclusively from the reserved `Admin` category), `site.bio` (with neutral fallback `"Thông tin giới thiệu đang được cập nhật."`), and CTAs `"Đặt lịch ngay"` (`/booking`) + `"Xem bộ sưu tập ↗"` (`/gallery`) |
| 6 | Services preview | `components/home/ServicesPreviewSection.tsx` | Category showcase driven by `/api/categories` and `/api/gallery` at `quality={100}` |
| 7 | Portfolio preview | `components/home/PortfolioPreviewSection.tsx` | Featured portfolio cards linking to `/gallery/[id]` at `quality={100}` |
| 8 | Testimonials | `components/home/TestimonialsSection.tsx` | Published customer feedback from `/api/feedback` |
| 9 | Contact CTA | `components/home/ContactCtaSection.tsx` | Pre-footer `"Đặt lịch ngay"` + `"Xem bảng giá"` callout |
| 10 | Footer | `components/shared/SiteFooter.tsx` | Category marquee, `"ĐẶT LỊCH NGAY"` CTA, navigation links, and social links (`Facebook`, `Instagram`) |

## 2. Public Pages

| Route | Component | Status & Features |
|-------|-----------|-------------------|
| `/` | `components/home/HomePage.tsx` | Live backend integration, `#6B8E5A` brand palette, `quality={100}` photos |
| `/gallery` | `components/gallery/GalleryPage.tsx`, `GalleryGrid.tsx` | Filterable masonry grid of published public photos (`Admin` category excluded) |
| `/gallery/[id]` | `components/gallery/PhotoDetail.tsx` | High-res photo view (`quality={100}`), keyboard navigation, related package card |
| `/pricing` | `components/pricing/PricingPage.tsx` | Live packages from `/api/pricing`, full equipment & post-processing benefits (`Full file đã căn chỉnh cơ bản`, `Hậu kỳ 10 ảnh chi tiết`, `Staff hỗ trợ tính thêm phí`, etc.), surcharge cards (`+300.000 VNĐ` until 19:00, out-of-province `FULL_DAY`, travel fee notice), and FAQ |
| `/booking` | `components/booking/BookingPage.tsx` | Real-time slot availability (`GET /api/availability`), labels `"Ngày dự kiến chụp"`, `"Họ tên bạn"`, `"Địa chỉ cụ thể"` (with school/ward/province guidance), `"Lưu ý với thợ"`, Turnstile verification, `POST /api/bookings` (30-min `PENDING` hold), and post-booking copyable message with separate Copy, Facebook, and Instagram actions |
| `/feedback` | `components/feedback/FeedbackPage.tsx` | Published reviews with guarded optional review images (`hasValidImageUrl`) and review submission form (`POST /api/feedback`) |

## 3. Validation Summary

- `npm run lint` → **0 errors**.
- `npm test` → **All Vitest suites pass** (`lib/turnstile.test.ts`, `lib/booking-message.test.ts`).
- `npm run build` → **Production build succeeds** across all public and admin routes.
