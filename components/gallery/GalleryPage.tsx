import { Reveal } from "@/components/shared/Reveal";
import { DataFetchError } from "@/components/shared/DataFetchError";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";

export function GalleryPage({
  photos,
  loadError = false,
  categories,
  initialCategory,
}: {
  photos: Photo[];
  loadError?: boolean;
  categories: Category[];
  initialCategory?: string;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal from="up">
            <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Bộ sưu tập
            </p>
            <h1 className="mt-3 font-semibold text-4xl font-semibold text-absolutewhite md:text-6xl">
              Tác phẩm
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-grey-50">
              Những bức ảnh đã đăng của Bấu Chụp Choẹt — lọc theo danh mục bên dưới.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="flex-1">
        <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-10 md:py-14">
          {loadError ? (
            <DataFetchError />
          ) : (
            <GalleryGrid photos={photos} categories={categories} initialCategory={initialCategory} />
          )}
        </div>
      </section>
    </main>
  );
}
