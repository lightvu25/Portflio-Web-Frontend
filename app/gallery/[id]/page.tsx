import { notFound } from "next/navigation";
import { PhotoDetail } from "@/components/gallery/PhotoDetail";
import { DataFetchError } from "@/components/shared/DataFetchError";
import { fetchPhotos, fetchPricing } from "@/lib/data";
import { isPublicPortfolioPhoto } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [photos, packages] = await Promise.all([fetchPhotos(), fetchPricing()]);

  // Backend unreachable ≠ photo missing — show a retry state, not a 404.
  if (!photos.ok) {
    return (
      <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
        <section className="border-b border-dark-12">
          <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
            <DataFetchError message="Không thể tải ảnh — máy chủ không phản hồi." />
          </div>
        </section>
      </main>
    );
  }

  const portfolioPhotos = photos.data.filter(isPublicPortfolioPhoto);
  const index = portfolioPhotos.findIndex((p) => String(p.id) === id);
  if (index === -1) notFound();

  const photo = portfolioPhotos[index];
  const prev = portfolioPhotos[(index - 1 + portfolioPhotos.length) % portfolioPhotos.length];
  const next = portfolioPhotos[(index + 1) % portfolioPhotos.length];

  // Pick a related package: smallest solo package for portrait-like shots —
  // the backend has no photo→package link, so show the first active package.
  const pkg = packages[0] ?? null;

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <PhotoDetail photo={photo} prevId={String(prev.id)} nextId={String(next.id)} pkg={pkg} />
    </main>
  );
}
