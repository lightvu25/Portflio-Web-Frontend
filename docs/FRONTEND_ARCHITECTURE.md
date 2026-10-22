# Frontend Architecture — Bấu Chụp Choẹt

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

## Route Layer — `app/`

Pages in `app/` are server components (with `export const revalidate = 60` on public data routes) that fetch live data via `lib/api/*` and compose presentation components from `components/`:

```text
app/
├── page.tsx                 # / — Public homepage (getSiteSettings, getFeaturedPhotos, getPublishedPhotos, getCategories, getPublishedFeedback)
├── layout.tsx               # Root layout, Be Vietnam Pro font, metadata
├── globals.css              # Single styling entry (Tailwind v4 + brand color tokens --brand-55: #6B8E5A)
├── gallery/
│   ├── page.tsx             # /gallery — Filterable portfolio grid
│   └── [id]/page.tsx        # /gallery/[id] — Photo detail + related pricing package
├── pricing/page.tsx         # /pricing — Active packages, benefits, surcharges, FAQ
├── booking/page.tsx         # /booking — Availability check, Turnstile, POST /api/bookings, copyable message
├── booking/result/page.tsx  # /booking/result — Booking status lookup by code
├── feedback/page.tsx        # /feedback — Published customer reviews + submission form
└── admin/                   # /admin/* — JWT-protected admin dashboard routes
    ├── page.tsx
    ├── login/page.tsx
    └── photos|categories|bookings|payments|feedback|pricing|settings/page.tsx
```

## Component Layer — `components/`

- **Active Public Components**:
  - `components/shared/`: `SiteHeader.tsx`, `SiteFooter.tsx`, `CategoryMarquee.tsx`, `CtaArrowLink.tsx`, `Reveal.tsx`, `SmoothScroll.tsx`
  - `components/home/`: `HomePage.tsx`, `HeroSection.tsx`, `PhotographyMarquee.tsx`, `FeaturedCollage.tsx`, `AboutSection.tsx`, `ServicesPreviewSection.tsx`, `PortfolioPreviewSection.tsx`, `TestimonialsSection.tsx`, `ContactCtaSection.tsx`
  - `components/gallery/`: `GalleryPage.tsx`, `GalleryGrid.tsx`, `PhotoDetail.tsx`
  - `components/pricing/`: `PricingPage.tsx`
  - `components/booking/`: `BookingPage.tsx`
  - `components/feedback/`: `FeedbackPage.tsx`
- **Active Admin Components**:
  - `components/admin/`: `auth/LoginPage.tsx`, `layout/AdminShell.tsx`, `dashboard/DashboardPage.tsx`, `photos/PhotosPage.tsx`, `photos/CropEditor.tsx`, `categories/CategoriesPage.tsx`, `pricing/PricingAdminPage.tsx`, `bookings/BookingsPage.tsx`, `payments/PaymentsPage.tsx`, `feedback/FeedbackAdminPage.tsx`, `settings/SettingsPage.tsx`

## API & Helper Layer — `lib/`

- `lib/api/client.ts`: Central fetch wrapper (`NEXT_API_URL`, `ApiError`, JSON/FormData, Bearer token).
- Feature modules (`auth.ts`, `photos.ts`, `categories.ts`, `pricing.ts`, `availability.ts`, `bookings.ts`, `payments.ts`, `feedback.ts`, `site.ts`) map 1:1 to Spring Boot controllers.
- `lib/booking-message.ts`: Pure helper that formats the post-booking copyable summary message (`buildBookingCopyMessage`) and social contact links (`SOCIAL_CONTACT_LINKS`), tested in `lib/booking-message.test.ts`.
- `lib/turnstile.ts`: Cloudflare Turnstile token validation helper, tested in `lib/turnstile.test.ts`.
- `lib/labels.ts`: Vietnamese UI labels and currency/date formatters.

## Styling & Image Pipeline

- **Brand Token System**: Defined in `app/globals.css` with `--brand-55: #6B8E5A` (`--brand-60`..`--brand-99`), and `--purple-*` aliased to `var(--brand-*)` for backward compatibility.
- **Image Quality (`quality={100}`)**: Configured in `next.config.ts` (`images.qualities: [75, 100]`) and applied across all public photographic `<Image />` components (`HeroSection`, `FeaturedCollage`, `AboutSection`, `ServicesPreviewSection`, `PortfolioPreviewSection`, `GalleryGrid`, `PhotoDetail`, `PricingPage`, `FeedbackPage`).
