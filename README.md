# Bấu Chụp Choẹt — Photography Portfolio Web Client

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

Frontend web client for **Bấu Chụp Choẹt** (`https://bauchupchoet.vercel.app`), built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Connected to a Spring Boot REST API and Cloudinary media pipeline.

---

## Key Features

- **Maximum Photo Sharpness (`quality={100}`)**: All public-facing portfolio, hero, collage, service preview, about, and detail photographs use `quality={100}` (configured in `next.config.ts` via `images.qualities: [75, 100]`) with calibrated `sizes` for high-DPI screens while keeping below-the-fold lazy loading intact.
- **Unified Brand Palette (`#6B8E5A`)**: Single source of truth in `app/globals.css` via `--brand-55: #6B8E5A` (`--brand-60`..`--brand-99`), with legacy `--purple-*` tokens aliased to `--brand-*`.
- **Category Marquee & Dynamic Gallery**: Displays the 5 signature photography categories (`Kỉ yếu THCS`, `Kỉ yếu THPT`, `Tốt nghiệp đại học`, `Áo dài`, `Concept`) and links to filtered views on `/gallery` when matched in `/api/categories` (or `/gallery` fallback).
- **Transparent Pricing, Deliverables & Surcharges**: Renders active packages from `GET /api/pricing` alongside confirmed equipment/deliverable benefits and surcharge rules (`+300.000 VNĐ` for shoots until 19:00, full-day requirement for out-of-province shoots, and location-based travel fee notice).
- **Hybrid Booking Flow**: Preserves real-time slot availability (`GET /api/availability`), Cloudflare Turnstile verification, and 30-minute temporary holds (`POST /api/bookings`), then generates a copyable summary message with one-click Copy and direct links to Facebook and Instagram.
- **Admin Dashboard**: Protected `/admin/*` interface for managing photos (including non-destructive crop & reserved `Admin` category for the homepage About photo), categories, pricing packages, bookings, payments, feedback, and site settings.

---

## Project Structure

```text
frontend/
├── app/
│   ├── globals.css                # Tailwind v4 theme tokens (--brand-55: #6B8E5A), light palette, marquee animation
│   ├── layout.tsx                 # Root layout, Be Vietnam Pro typography, metadata
│   ├── page.tsx                   # Public homepage (/) — ISR revalidate = 60s
│   ├── gallery/
│   │   ├── page.tsx               # Public portfolio grid (/gallery)
│   │   └── [id]/page.tsx          # Photo detail view (/gallery/[id])
│   ├── pricing/page.tsx           # Pricing packages, benefits, surcharges, and FAQ (/pricing)
│   ├── booking/page.tsx           # Booking form + post-booking copyable message (/booking)
│   ├── feedback/page.tsx          # Customer reviews + review submission (/feedback)
│   └── admin/                     # JWT-protected admin dashboard routes (/admin/*)
├── components/
│   ├── shared/                    # SiteHeader, SiteFooter, CategoryMarquee, CtaArrowLink, Reveal
│   ├── home/                      # HomePage, HeroSection, PhotographyMarquee, FeaturedCollage, AboutSection,
│   │                              # ServicesPreviewSection, PortfolioPreviewSection, TestimonialsSection, ContactCtaSection
│   ├── gallery/                   # GalleryPage, GalleryGrid, PhotoDetail
│   ├── pricing/                   # PricingPage
│   ├── booking/                   # BookingPage
│   ├── feedback/                  # FeedbackPage
│   └── admin/                     # Admin dashboard modules (photos, categories, pricing, bookings, payments, feedback, settings)
├── lib/
│   ├── api/                       # Typed API client modules (client.ts, photos.ts, categories.ts, pricing.ts, bookings.ts, etc.)
│   ├── auth/                      # Admin token storage & hooks
│   ├── booking-message.ts         # Pure post-booking summary message formatter & unit tests
│   ├── labels.ts                  # Vietnamese UI labels & formatters
│   └── turnstile.ts               # Cloudflare Turnstile token resolution & unit tests
├── types/                         # TypeScript interfaces matching backend DTOs
└── next.config.ts                 # Next.js 16 config (images.qualities: [75, 100], Cloudinary & Unsplash remotePatterns)
```

---

## Local Setup & Commands

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_API_URL=http://localhost:8080
TURNSTILE_SITE_KEY=
```

- `NEXT_API_URL`: Base URL of the Spring Boot backend (inlined into `process.env.NEXT_API_URL` via `next.config.ts`).
- `TURNSTILE_SITE_KEY`: Read server-side in `app/booking/page.tsx`. Leave empty in local development (`NODE_ENV !== "production"`) to use the dev bypass token (`local-dev`) when backend `TURNSTILE_ENABLED=false`. Required in production.

### 3. Development, Testing & Production Build

```bash
npm run dev      # Start local dev server on http://localhost:3000
npm run lint     # Run ESLint
npm test         # Run Vitest unit tests (turnstile + booking-message)
npm run build    # Production build
```
