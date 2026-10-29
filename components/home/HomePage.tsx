import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { DataFetchError } from "@/components/shared/DataFetchError";
import { CameraIntro } from "@/components/home/CameraIntro";
import { HomeSectionSnap } from "@/components/home/HomeSectionSnap";
import { StickyGridSection } from "@/components/home/StickyGridSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesPreviewSection } from "@/components/home/ServicesPreviewSection";
import { PortfolioPreviewSection } from "@/components/home/PortfolioPreviewSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ContactCtaSection } from "@/components/home/ContactCtaSection";
import {
  fetchFeedback,
  fetchFeedbackPhotos,
  fetchPhotos,
  fetchPricing,
  fetchScrollPhotos,
  fetchSite,
} from "@/lib/data";
import { isPublicPortfolioPhoto, isScrollPhoto } from "@/lib/labels";
import { resolveSiteStats } from "@/lib/site-stats";
import type { Photo } from "@/types/photo";

function mergeScrollPhotos(dedicatedScroll: Photo[], fromGalleryList: Photo[]): Photo[] {
  const seen = new Set<number>();
  const result: Photo[] = [];
  for (const p of [...dedicatedScroll, ...fromGalleryList]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      result.push(p);
    }
  }
  return result.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

/**
 * Homepage composition — CameraIntro → scroll-driven StickyGridSection hero →
 * about → services → portfolio → testimonials → CTA.
 */
export async function HomePage() {
  const [photos, scrollPhotos, pricing, feedback, feedbackPhotos, site] = await Promise.all([
    fetchPhotos(),
    fetchScrollPhotos(),
    fetchPricing(),
    fetchFeedback(),
    fetchFeedbackPhotos(),
    fetchSite(),
  ]);

  const list = photos.data;
  const portfolioPhotos = list.filter(isPublicPortfolioPhoto);
  // StickyGridSection exclusively displays photos assigned to the "Scroll" category.
  const stickyGrid = mergeScrollPhotos(scrollPhotos, list.filter(isScrollPhoto));
  const preview = portfolioPhotos.slice(0, 8);
  const stats = resolveSiteStats(site);
  const photographerName = site?.photographerName?.trim() || "Bấu Chụp Choẹt";

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <CameraIntro />
      <HomeSectionSnap />
      {stickyGrid.length > 0 ? (
        <StickyGridSection
          photos={stickyGrid}
          photographerName={photographerName}
          stats={stats}
        />
      ) : (
        <div data-snap-section="hero-fallback">
          <Reveal from="up">
            <section
              aria-label="Giới thiệu"
              className="bg-dark-03 px-5 py-16 md:px-10 md:py-24"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 48% 42% at 50% 50%, rgba(107, 142, 90, 0.14) 0%, rgba(163, 190, 149, 0.06) 36%, #ffffff 62%)",
              }}
            >
              <div
                className="relative mx-auto max-w-[960px] p-8 text-center text-white md:p-14"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(255, 252, 242, 0.05) 0px, rgba(255, 252, 242, 0.05) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(24, 38, 18, 0.055) 0px, rgba(24, 38, 18, 0.055) 1px, transparent 1px, transparent 3px), radial-gradient(ellipse closest-side at 50% 50%, rgba(78, 107, 64, 0.72) 0%, rgba(107, 142, 90, 0.54) 32%, rgba(126, 159, 109, 0.18) 58%, rgba(255, 255, 255, 0) 84%)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/95">
                  Xin chào cả nhà, tui tên là
                </p>
                <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight md:text-6xl">
                  {photographerName}
                </h1>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/25 bg-[#3E5832]/55 p-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold">{stats.clientsCount}+</p>
                    <p className="mt-1 text-sm text-white/95">khách đã chụp</p>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-[#3E5832]/55 p-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold">{stats.experienceYears}</p>
                    <p className="mt-1 text-sm text-white/95">năm kinh nghiệm</p>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-[#3E5832]/55 p-4 backdrop-blur-sm">
                    <p className="text-3xl font-bold">{stats.conceptsCount}+</p>
                    <p className="mt-1 text-sm text-white/95">concept đã chụp</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/pricing#booking"
                    className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#2F4525] shadow-md"
                  >
                    Đặt lịch ngay
                  </Link>
                  <Link
                    href="/gallery"
                    className="rounded-full border border-white/45 bg-[#3E5832]/55 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
                  >
                    Khám phá bộ sưu tập ↗
                  </Link>
                </div>
              </div>
              {!photos.ok && (
                <div className="mx-auto mt-8 max-w-[1400px]">
                  <DataFetchError />
                </div>
              )}
            </section>
          </Reveal>
        </div>
      )}
      <div data-snap-section="about">
        <Reveal from="up">
          <AboutSection site={site} />
        </Reveal>
      </div>
      <div data-snap-section="services">
        <Reveal from="up">
          <ServicesPreviewSection packages={pricing} photos={portfolioPhotos} />
        </Reveal>
      </div>
      {photos.ok && (
        <div data-snap-section="portfolio">
          <Reveal from="up">
            <PortfolioPreviewSection photos={preview} />
          </Reveal>
        </div>
      )}
      <div data-snap-section="testimonials" data-snap-preserve-form>
        <Reveal from="up">
          <TestimonialsSection testimonials={feedback} photos={feedbackPhotos} />
        </Reveal>
      </div>
      <div data-snap-section="contact-cta">
        <Reveal from="up">
          <ContactCtaSection site={site} />
        </Reveal>
      </div>
    </main>
  );
}
