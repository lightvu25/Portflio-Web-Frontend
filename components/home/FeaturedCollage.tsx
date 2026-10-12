import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types/photo";

const tile =
  "group relative block overflow-hidden rounded-[14px] border border-dark-12 bg-dark-08";

function Tile({ photo, className, sizes, priority = false }: { photo?: Photo; className?: string; sizes: string; priority?: boolean }) {
  if (!photo) return null;
  return (
    <Link href={`/gallery/${photo.id}`} className={`${tile} ${className ?? ""}`}>
      <Image
        src={photo.imageUrl}
        alt={photo.altText ?? photo.title ?? "Ảnh"}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}

/**
 * Asymmetric editorial collage — one large feature image plus smaller
 * supporting tiles, per the reference design. Falls back to a tidy
 * stacked grid on mobile. Every tile links to its gallery detail page.
 */
export function FeaturedCollage({ photos }: { photos: Photo[] }) {
  const [feature, a, b, c, d] = photos;
  if (!feature) return null;

  return (
    <section aria-label="Featured photography" className="border-b border-dark-12">
      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-10 md:py-16">
        {/* Desktop asymmetric composition */}
        <div className="hidden grid-cols-12 grid-rows-2 gap-4 md:grid md:h-[560px]">
          <Tile photo={a} sizes="(min-width: 1400px) 381px, calc(33.33vw - 85px)" className="col-span-4 row-span-1" />
          <Tile photo={feature} sizes="(min-width: 1400px) 763px, calc(66.67vw - 171px)" priority className="col-span-8 row-span-2" />
          <Tile photo={b} sizes="(min-width: 1400px) 191px, calc(16.67vw - 43px)" className="col-span-2 row-span-1" />
          <Tile photo={c} sizes="(min-width: 1400px) 191px, calc(16.67vw - 43px)" className="col-span-2 row-span-1" />
        </div>

        {/* Mobile: feature + 2-col support row */}
        <div className="grid gap-4 md:hidden">
          <Tile photo={feature} sizes="calc(100vw - 40px)" priority className="aspect-[4/3]" />
          <div className="grid grid-cols-2 gap-4">
            {[a, b, c, d].filter(Boolean).slice(0, 4).map((p) => (
              <Tile key={p!.id} photo={p} sizes="calc(50vw - 28px)" className="aspect-square" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
