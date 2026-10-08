# Frontend Architecture

Next.js 16 (App Router) + TypeScript + Tailwind v4. Routes in `app/`,
Figma-derived UI in `components/`, backend integration in `lib/api/`,
domain types in `types/`.

## Route layer — `app/`

Routes only. Pages compose section components; no API calls, no assets,
no section JSX living inside `app/` (except `globals.css`, `favicon.ico`).

```
app/
├── page.tsx                 # /  — public homepage (home sections)
├── layout.tsx               # root layout + globals.css + metadata
├── globals.css              # single styling entry (Tailwind v4 + Figma tokens/animations)
├── gallery/page.tsx         # /gallery  — portfolio sections
├── pricing/page.tsx         # /pricing  — services/pricing sections
├── booking/page.tsx         # /booking  — placeholder
├── booking/result/page.tsx  # /booking/result — placeholder
├── feedback/page.tsx        # /feedback — placeholder
└── admin/                   # /admin* — all placeholder pages
    ├── page.tsx
    ├── login/page.tsx
    ├── photos|categories|bookings|payments|feedback|pricing|settings/page.tsx
```

`/home` was consolidated into `/` (the old redirect was removed).

## Component layer — `components/`

Figma-generated sections grouped by domain — never `*Page` folders.

| Figma folder | New location |
|---|---|
| `app/HomePage/*` | `components/home/*` |
| `app/PortfolioPage/*` | `components/portfolio/*` |
| `app/ServicePage/*` | `components/services/*` |
| `app/AboutPage/*` | `components/about/*` (unrouted — content for later use) |
| `app/ContactPage/*` | `components/contact/*` (unrouted) |

`components/admin/`, `components/ui/`, `components/layout/` exist for the
next phases. Same-named components in different domains (e.g. five
`SiteHeaderSection`s) are **not** identical — verified by checksum; they
stay per-domain.

## API layer — `lib/api/`

`client.ts` is the single fetch wrapper (`NEXT_PUBLIC_API_URL`,
`ApiError`, JSON/FormData, Bearer token). Feature modules map 1:1 to
backend controllers: `auth`, `photos`, `categories`, `pricing`,
`availability`, `bookings` (incl. blocked slots), `payments`,
`feedback`, `site`. Components must call these — never `fetch()` directly.

## Auth layer — `lib/auth/token.ts`

Admin JWT kept in `localStorage` (`hb_admin_token`); all helpers are
no-ops on the server. Single admin, no roles.

## Type layer — `types/`

Interfaces mirror the real backend DTOs/entity JSON (verified against
Spring source): `auth`, `booking`, `availability`, `photo`, `category`,
`pricing`, `payment`, `feedback`, `site`, `error`.

## Data flow

```
UI component → lib/api/<feature>.ts → lib/api/client.ts → Spring Boot → PostgreSQL / Cloudinary
```

## Styling

Tailwind v4 via `app/globals.css` only. The five identical per-page
`tailwind.css` files were merged here (Figma color tokens, `animate-*`
classes, keyframes, base form reset) and deleted; the unused
`tailwind.config.js` (v3-style) was removed.

## Placeholder image assets — IMPORTANT

The Figma export shipped **without its image assets** (they were never
committed). Every `import x from "./icon-*.svg"` / `"./image-*.png"`
referenced a missing file, so ~272 1×1 transparent placeholder assets
were generated in the component folders to keep imports resolving and
the build green. **Replace them with the real Figma asset export** —
same filenames — before visual review.

## Hardcoded demo content (to be wired to the API next phase)

- "Damien Braun" name/bio/testimonials throughout → `GET /api/site`
  (`photographerName`, `bio`, social URLs) + `GET /api/feedback`
- USD prices in `components/services/PhotographyPricingSection.tsx`
  → `GET /api/pricing` (VND amounts)
- Static portfolio/collage images → `GET /api/gallery` (Cloudinary URLs)
- Generic `facebook.com/instagram.com/linkedin.com` links → site settings
- Booking CTAs → `/booking` flow with `POST /api/bookings`
