import { Reveal } from "@/components/shared/Reveal";
import { DataFetchError } from "@/components/shared/DataFetchError";
import { CameraIntro } from "@/components/home/CameraIntro";
import { HeroSection } from "@/components/home/HeroSection";
import { PhotographyMarquee } from "@/components/home/PhotographyMarquee";
import { FeaturedCollage } from "@/components/home/FeaturedCollage";
import { StickyGridSection } from "@/components/home/StickyGridSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesPreviewSection } from "@/components/home/ServicesPreviewSection";
import { PortfolioPreviewSection } from "@/components/home/PortfolioPreviewSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ContactCtaSection } from "@/components/home/ContactCtaSection";
import {
  fetchCategories,
  fetchFeedback,
  fetchFeedbackPhotos,
  fetchPhotos,
  fetchPricing,
  fetchSite,
} from "@/lib/data";

/**
 * Homepage composition — header → hero → marquee → featured collage → about →
 * services → portfolio → testimonials → CTA → footer. All content comes from
 * the backend (published photos, categories, pricing packages, feedback, site settings).
 */
export async function HomePage() {
  const [photos, categories, pricing, feedback, feedbackPhotos, site] = await Promise.all([
    fetchPhotos(),
    fetchCategories(),
    fetchPricing(),
    fetchFeedback(),
    fetchFeedbackPhotos(),
    fetchSite(),
  ]);

  // Spread photos across sections so the same few images don't repeat.
  const list = photos.data;
  const collage = list.slice(0, 5);
  const stickyGrid = list.length >= 17 ? list.slice(5, 17) : list.slice(0, 12);
  const preview = list.length >= 17 ? list.slice(11, 23) : list.slice(5, 13);

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <CameraIntro />
      <div className="relative z-10 bg-dark-03">
        <HeroSection site={site} />
        <PhotographyMarquee availableCategories={categories.map((c) => c.name)} />
        {/* Photo-driven sections: on fetch failure show a single retry block
            instead of empty gaps; about/services still render their own content. */}
        {photos.ok ? (
          <Reveal from="up">
            <FeaturedCollage photos={collage} />
          </Reveal>
        ) : (
          <section aria-label="Lỗi tải ảnh" className="border-b border-dark-12">
            <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-10 md:py-16">
              <DataFetchError />
            </div>
          </section>
        )}
      </div>
      {photos.ok && <StickyGridSection photos={stickyGrid} />}
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
