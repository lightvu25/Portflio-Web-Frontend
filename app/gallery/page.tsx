import { GalleryPage } from "@/components/gallery/GalleryPage";
import { fetchCategories, fetchPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [photos, categories] = await Promise.all([fetchPhotos(), fetchCategories()]);
  return <GalleryPage photos={photos} categories={categories} initialCategory={category} />;
}
