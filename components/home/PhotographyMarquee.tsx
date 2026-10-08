import { CategoryMarquee } from "@/components/shared/CategoryMarquee";

/** Clickable auto-scrolling photography category band for the homepage. */
export function PhotographyMarquee({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;
  return (
    <section aria-label="Danh mục chụp ảnh" className="border-b border-dark-12 bg-dark-06">
      <CategoryMarquee categories={categories} />
    </section>
  );
}
