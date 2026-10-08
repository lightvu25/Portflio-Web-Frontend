# Frontend Visual Integration Report

Phase: visual composition + temporary sample content. No backend integration yet.

## Homepage (`/`)

Composed in `components/home/HomePage.tsx` as one coherent visual story:

| # | Section | File |
|---|---------|------|
| 1 | Header / nav | `components/shared/SiteHeader.tsx` |
| 2 | Hero | `components/home/HeroSection.tsx` |
| 3 | Category marquee | `components/home/PhotographyMarquee.tsx` |
| 4 | Featured collage | `components/home/FeaturedCollage.tsx` |
| 5 | About | `components/home/AboutSection.tsx` |
| 6 | Services/pricing preview | `components/home/ServicesPreviewSection.tsx` |
| 7 | Portfolio preview | `components/home/PortfolioPreviewSection.tsx` |
| 8 | Testimonials | `components/home/TestimonialsSection.tsx` |
| 9 | Contact CTA | `components/home/ContactCtaSection.tsx` |
| 10 | Footer | `components/shared/SiteFooter.tsx` |

### Composition changes

- The original Figma exports are **fixed-1920px, absolutely-positioned** canvases
  (`w-[1920px]`, `absolute top-0 left-[calc(50%-960px)]`, `ml-[-971px]`). Stacked
  together they overlap and cannot form a coherent page. They were therefore
  **rebuilt as responsive flex/grid components that preserve the Figma design
  language**: `bg-dark-03`, `border-dark-12` section dividers, `dark-06/dark-08`
  surfaces, `grey-40/50/70` text hierarchy, `purple-55` CTAs, Manrope type,
  `rounded-[10px]`/pill buttons.
- **Theme is now LIGHT.** The Figma palette vars in `globals.css` were remapped
  (`dark-*` surface ramp → white→light grey, `grey-*` text ramp → faint→near-black,
  `purple-55` accent kept). Token class names are unchanged, so the whole design
  system renders light consistently. Purple CTA buttons use literal `text-white`
  since `absolutewhite` now maps to near-black.
- Hero keeps the reference's editorial split: "STUNNING PHOTOGRAPHY BY /
  HẢI BẤU" left, "LET'S / WORK TOGETHER" + circular arrow CTA + booking button
  right; purple blur accent retained.
- Featured composition is an **asymmetric 12-col collage** (4-wide tile, 8-wide
  2-row feature, two 2-wide tiles) — not an equal-column grid.
- Marquee is a horizontally scrollable uppercase category strip with `✦`
  separators (original icon SVGs were never committed — placeholders render
  invisible, so text separators were used).

### Responsive changes

- All sections share one container: `max-w-[1400px] mx-auto px-5 md:px-10`.
- Hero: 2-col on `md+`, stacked on mobile.
- Collage: asymmetric grid on `md+`, feature image + 2-col row on mobile.
- Header: sticky, hamburger menu under `md`.
- Marquee: `overflow-x-auto`, no page overflow.

### Motion

- `components/shared/Reveal.tsx` — IntersectionObserver wrapper that fades/
  slides children in on enter and out on leave (replays scrolling both
  directions), with `delay` stagger and `from` direction props; honors
  `prefers-reduced-motion`. Applied to every homepage section, pricing cards
  (staggered), gallery grid, booking form, feedback cards + form.
- `PhotographyMarquee` auto-scrolls via the existing `.animate-marquee`
  keyframes (seamless two-copy loop, `translateX(-100% - gap)`), pauses on
  hover, gradient edge fades.
- `SiteHeader` desktop nav uses a **morphing active pill** — an absolutely
  positioned `bg-dark-08` span whose `left`/`width` transition to the active
  link's measured position on route change and window resize.
- Every photo on the site links to `/gallery/[id]` — a photo detail page
  (SSG via `generateStaticParams`): image left with prev/next buttons and
  arrow-key/Esc navigation; right panel shows title, category, the mapped
  package (`mockPackageForCategory` in `lib/mock/pricing.ts`), VND price,
  features, and a "Book This Package" button → `/booking?package=<id>`.
  The booking form reads `?package=` via `useSearchParams` (inside `<Suspense>`)
  to preselect the package.

## Sample content

- **Image source**: public Unsplash photography (`images.unsplash.com`), allowed
  via `images.remotePatterns` in `next.config.ts`; rendered with `next/image`.
- **Count**: 16 sample photos across 6 categories (Portrait, Couple, Fashion,
  Lifestyle, Event, Landscape); homepage uses ~11 unique images, gallery all 16.
- **Mock data files** (all clearly marked temporary, none embedded in JSX):
  - `lib/mock/site.ts` — brand "HẢI BẤU PHOTOGRAPHY", bio, CTA labels, socials, deposit
  - `lib/mock/portfolio.ts` — `mockPortfolio`, `mockCategories`
  - `lib/mock/pricing.ts` — `mockPackages` (real project prices in VND), `formatVnd`
  - `lib/mock/testimonials.ts` — `mockTestimonials` (labeled "Sample review")

## Figma preservation

- **Reused (design language)**: color tokens, borders, Manrope classes, purple
  CTA treatment, marquee concept, hero layout, rounded card style.
- **Newly created (replacing unrenderable fixed-position exports)**:
  `shared/SiteHeader`, `shared/SiteFooter`, `home/HomePage`, `home/HeroSection`,
  `home/PhotographyMarquee`, `home/FeaturedCollage`, `home/AboutSection`,
  `home/ServicesPreviewSection`, `home/PortfolioPreviewSection`,
  `home/TestimonialsSection`, `home/ContactCtaSection`,
  `gallery/GalleryPage`, `gallery/GalleryGrid`, `pricing/PricingPage`,
  `booking/BookingPage`, `feedback/FeedbackPage`.
- **Untouched originals**: `components/home|portfolio|services|about|contact/*`
  Figma exports remain in the repo (unused) as design reference; they are
  superseded, not deleted.
- **Identity**: no "Damien Braun", USD pricing, or USA location content remains
  in rendered pages. Brand is HẢI BẤU PHOTOGRAPHY; prices in VND.

## Pages

| Route | Status |
|-------|--------|
| `/` | Fully composed, responsive, mock content |
| `/gallery` | Filterable masonry grid, 16 mock photos, 6 category filters |
| `/pricing` | 4 VND package cards matching backend package model |
| `/booking` | Visual structure only: package picker, date, slot (HALF_DAY), name/phone/address/instagram, CAPTCHA placeholder, submit (no-op) |
| `/feedback` | Published-review cards (mock) + submission form structure |

Admin routes remain placeholders — out of scope this phase.

## API readiness

All sections consume props/data from `lib/mock/*`, never inline JSX constants:

| Mock source | Replaced by |
|-------------|-------------|
| `mockPortfolio` / `mockCategories` | `GET /api/gallery`, `GET /api/categories` (`lib/api/photos.ts`, `categories.ts`) |
| `mockPackages` / `formatVnd` | `GET /api/pricing` (`lib/api/pricing.ts`) |
| `mockSite` | `GET /api/site` (`lib/api/site.ts`) |
| `mockTestimonials` | `GET /api/feedback` (`lib/api/feedback.ts`) |
| Booking form fields | `GET /api/availability` + `POST /api/bookings` (`lib/api/availability.ts`, `bookings.ts`) |

No changes were made to `lib/api/`, `lib/auth/`, or `types/`.

## Validation

- `npm run lint` → **0 errors**, 81 warnings (all pre-existing `@next/no-img-element`
  in dormant Figma exports — baseline preserved exactly).
- `npx next build --webpack` → **success**, all 15 routes compiled + prerendered.

## Remaining work

- Real client photography assets (replace Unsplash mock URLs).
- Backend integration: swap `lib/mock/*` for `lib/api/*` calls.
- Final copy (bio, testimonials currently labeled samples).
- Booking flow wiring: availability fetch, Turnstile widget, submit, `/booking/result`.
- Admin dashboard UI (all `/admin/*` are placeholders).
- Old Figma section files can be deleted once superseded state is confirmed.
- Dormant Figma `<img>` warnings will disappear when those files are removed.
