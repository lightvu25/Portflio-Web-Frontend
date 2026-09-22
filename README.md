# Photography Portfolio Web Client

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A high-performance, media-centric portfolio web client architected for elite visual artists and professional photographers. Designed with an editorial dark-mode aesthetic, the application emphasizes immersive visual storytelling while sustaining sub-second load times and uncompromising Core Web Vitals. Built on the Next.js App Router and Tailwind CSS, it couples fluid responsive interactions with a dedicated Spring Boot RESTful API to manage dynamic exhibitions, booking reservations, and client inquiries with production-grade reliability.

---

## Key Features

- **Media Optimization:** Zero-CLS image rendering pipeline leveraging `next/image` with dynamic format negotiation (WebP/AVIF), responsive source sets, and adaptive aspect ratios to maximize Largest Contentful Paint (LCP) efficiency.
- **Dynamic Gallery & Filtering:** Fluid layout supporting responsive mosaic grids and horizontal multi-axis sliders with category-based filtering (Portrait, Wedding, Commercial, Event, Landscape).
- **Pricing & Booking Experience:** Structured service tier presentation with transparent deliverable breakdowns, custom inquiry hooks, and structured deposit prompts with direct bank transfer integration.
- **Modern UI/UX:** Bespoke dark-mode design system with granular breakpoint support (Mobile, Laptop, Desktop), custom micro-interactions, responsive drawer navigation, and accessible accordion patterns.

---

## Tech Stack

- **Framework & Runtime:** [Next.js](https://nextjs.org/) (App Router, Server Components)
- **UI Library:** [React 19](https://react.dev/)
- **Type System:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling & Design Tokens:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Graphics:** [Lucide React](https://lucide.dev/) & Scalable Vector Graphics (SVG)
- **Data Fetching & State:** Native Fetch API with tag-based revalidation & resilient client-side caching

---

## Project Architecture

```text
frontend/
├── app/
│   ├── globals.css                # Global styles, Tailwind v4 directives, and theme tokens
│   ├── layout.tsx                 # Root layout shell, font definitions, and global metadata
│   ├── page.tsx                   # Root entry point with server-level redirect to /home
│   ├── home/
│   │   └── page.tsx               # Primary portfolio composite view
│   └── HomePage/
│       └── sections/              # Isolated, responsive presentation modules
│           ├── SiteHeader.tsx     # Navigation bar with responsive drawer menu
│           ├── HeroSection.tsx    # Editorial hero banner, marquee, and gallery grid
│           ├── AboutSection.tsx   # Artist biography, contact details, and CV download
│           ├── ServicesSection.tsx# Photography services and offering highlights
│           ├── PortfolioSection.tsx# Curated project gallery with horizontal slider
│           ├── FAQSection.tsx     # Accordion FAQ with two-column split layout
│           ├── TestimonialsSection.tsx # Client reviews carousel and trust metrics
│           └── ContactFooter.tsx  # Footer CTA, navigation sitemap, and legal links
├── public/                        # Static assets, fallback media, and branding marks
├── next.config.ts                 # Next.js configuration, routing rules, and headers
├── package.json                   # Dependency tree and lifecycle scripts
├── postcss.config.mjs             # PostCSS processing configuration
└── tsconfig.json                  # Strict TypeScript compiler options
```

---

## Getting Started & Local Setup

### Prerequisites

- **Node.js:** `v18.18.0` or higher (`v20.x` LTS recommended)
- **Package Manager:** `npm`, `pnpm`, or `yarn`
- **Backend Service:** (Optional) Running instance of the Spring Boot REST API

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/photography-portfolio-client.git
cd photography-portfolio-client/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root of the `frontend` directory:

```bash
cp .env.example .env.local
```

Define the backend service endpoint:

```env
# .env.example
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the client application.

### Step 5: Build for Production

Verify type consistency and generate an optimized production bundle:

```bash
npm run build
npm run start
```

---

## Deployment

The application is optimized for deployment on the [Vercel Platform](https://vercel.com/):

1. Push your latest commits to a remote Git provider (GitHub, GitLab, or Bitbucket).
2. Import the project into your Vercel Dashboard.
3. If using a monorepo setup, set the **Root Directory** to `frontend`.
4. Configure Environment Variables in the project settings:
   - `NEXT_PUBLIC_API_BASE_URL`: URL of your deployed production Spring Boot API.
5. Deploy. Vercel automatically manages edge caching, image optimization, and global asset distribution.

---

## Contact & Author

- **Author:** [Your Full Name]
- **Portfolio / Live Demo:** [https://your-portfolio-url.com](https://your-portfolio-url.com)
- **LinkedIn:** [https://linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
- **GitHub:** [@your-username](https://github.com/your-username)
