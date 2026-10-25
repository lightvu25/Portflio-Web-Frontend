import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { DataFetchError } from "@/components/shared/DataFetchError";
import { CameraIntro } from "@/components/home/CameraIntro";
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
  fetchSite,
} from "@/lib/data";
import { resolveSiteStats } from "@/lib/site-stats";

/**
 * Homepage composition — CameraIntro → scroll-driven StickyGridSection hero →
 * about → services → portfolio → testimonials → CTA.
 */
export async function HomePage() {
  const [photos, pricing, feedback, feedbackPhotos, site] = await Promise.all([
    fetchPhotos(),
    fetchPricing(),
    fetchFeedback(),
    fetchFeedbackPhotos(),
    fetchSite(),
  ]);

  const list = photos.data;
  const stickyGrid = list.slice(0, 12);
  const preview = list.length > 12 ? list.slice(12, 20) : list.slice(0, 8);
  const stats = resolveSiteStats(site);
  const photographerName = site?.photographerName?.trim() || "Bấu Chụp Choẹt";

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <CameraIntro />
      {photos.ok && stickyGrid.length > 0 ? (
        <StickyGridSection
          photos={stickyGrid}
          photographerName={photographerName}
          stats={stats}
        />
      ) : (
        <section
          aria-label="Giới thiệu"
          className="bg-dark-03 px-5 py-16 md:px-10 md:py-24"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 68% 58% at 50% 50%, rgba(107, 142, 90, 0.28) 0%, rgba(163, 190, 149, 0.14) 46%, #ffffff 78%)",
          }}
        >
          <div
            className="mx-auto max-w-[1160px] p-8 text-center text-white md:p-16"
            style={{
              background:
                "radial-gradient(ellipse closest-side at 50% 50%, rgba(78, 107, 64, 0.96) 0%, rgba(107, 142, 90, 0.88) 38%, rgba(126, 159, 109, 0.42) 68%, rgba(255, 255, 255, 0) 100%)",
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
                href="/booking"
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
      )}
      <Reveal from="up">
        <AboutSection site={site} />
      </Reveal>
      <Reveal from="up">
        <ServicesPreviewSection packages={pricing} photos={list} />
      </Reveal>
      {photos.ok && (
        <Reveal from="up">
          <PortfolioPreviewSection photos={preview} />
        </Reveal>
      )}
      <Reveal from="up">
        <TestimonialsSection testimonials={feedback} photos={feedbackPhotos} />
      </Reveal>
      <Reveal from="up">
        <ContactCtaSection site={site} />
      </Reveal>
    </main>
  );
}
