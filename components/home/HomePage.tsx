import { Reveal } from "@/components/shared/Reveal";
import { HeroSection } from "@/components/home/HeroSection";
import { PhotographyMarquee } from "@/components/home/PhotographyMarquee";
import { FeaturedCollage } from "@/components/home/FeaturedCollage";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesPreviewSection } from "@/components/home/ServicesPreviewSection";
import { PortfolioPreviewSection } from "@/components/home/PortfolioPreviewSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ContactCtaSection } from "@/components/home/ContactCtaSection";
import { fetchCategories, fetchFeedback, fetchPhotos, fetchSite } from "@/lib/data";

/**
 * Homepage composition — header → hero → marquee → featured collage → about →
 * services → portfolio → testimonials → CTA → footer. All content comes from
 * the backend (published photos, categories, feedback, site settings).
 */
export async function HomePage() {
  const [photos, categories, feedback, site] = await Promise.all([
    fetchPhotos(),
    fetchCategories(),
    fetchFeedback(),
    fetchSite(),
  ]);

  // Spread photos across sections so the same few images don't repeat.
  const collage = photos.slice(0, 5);
  const about = photos.slice(4, 5);
  const preview = photos.slice(5, 13);

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <Reveal>
        <HeroSection site={site} />
      </Reveal>
      <PhotographyMarquee categories={categories.map((c) => c.name)} />
      <Reveal from="up">
        <FeaturedCollage photos={collage} />
      </Reveal>
      <Reveal from="left">
        <AboutSection photos={about} site={site} />
      </Reveal>
      <Reveal from="up">
        <ServicesPreviewSection categories={categories} photos={photos} />
      </Reveal>
      <Reveal from="up">
        <PortfolioPreviewSection photos={preview} />
      </Reveal>
      <Reveal from="up">
        <TestimonialsSection testimonials={feedback} />
      </Reveal>
      <Reveal from="down">
        <ContactCtaSection site={site} />
      </Reveal>
    </main>
  );
}
