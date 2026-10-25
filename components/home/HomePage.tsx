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
          className="border-b border-dark-12 bg-[#F5F3EC] px-5 py-16 md:px-10 md:py-24"
        >
          <div className="mx-auto max-w-[920px] rounded-[28px] bg-[linear-gradient(135deg,#4E6B40_0%,#6B8E5A_55%,#7E9F6D_100%)] p-8 text-center text-white shadow-xl md:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5F3EC]/90">
              Xin chào cả nhà, tui tên là
            </p>
            <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight md:text-6xl">
              {photographerName}
            </h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-3xl font-bold">{stats.clientsCount}+</p>
                <p className="mt-1 text-sm text-[#F5F3EC]/90">khách đã chụp</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-3xl font-bold">{stats.experienceYears}</p>
                <p className="mt-1 text-sm text-[#F5F3EC]/90">năm kinh nghiệm</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-3xl font-bold">{stats.conceptsCount}+</p>
                <p className="mt-1 text-sm text-[#F5F3EC]/90">concept đã chụp</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/booking"
                className="rounded-full bg-[#F5F3EC] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#2F4525]"
              >
                Đặt lịch ngay
              </Link>
              <Link
                href="/gallery"
                className="rounded-full border border-white/35 bg-white/15 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white"
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
