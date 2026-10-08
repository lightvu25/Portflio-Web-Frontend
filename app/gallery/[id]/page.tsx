import { notFound } from "next/navigation";
import { PhotoDetail } from "@/components/gallery/PhotoDetail";
import { fetchPhotos, fetchPricing } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [photos, packages] = await Promise.all([fetchPhotos(), fetchPricing()]);

  const index = photos.findIndex((p) => String(p.id) === id);
  if (index === -1) notFound();

  const photo = photos[index];
  const prev = photos[(index - 1 + photos.length) % photos.length];
  const next = photos[(index + 1) % photos.length];

  // Pick a related package: smallest solo package for portrait-like shots —
  // the backend has no photo→package link, so show the first active package.
  const pkg = packages[0] ?? null;

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <PhotoDetail photo={photo} prevId={String(prev.id)} nextId={String(next.id)} pkg={pkg} />
    </main>
  );
}
