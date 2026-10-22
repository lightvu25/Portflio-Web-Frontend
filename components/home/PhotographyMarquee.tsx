import { CategoryMarquee } from "@/components/shared/CategoryMarquee";
import type { Category } from "@/types/category";

/** Clickable auto-scrolling photography category band for the homepage. */
export function PhotographyMarquee({
  categories,
  availableCategories,
}: {
  categories?: readonly string[];
  availableCategories?: ReadonlyArray<Category | string>;
}) {
  return (
    <CategoryMarquee
      categories={categories}
      availableCategories={availableCategories}
    />
  );
}
