import type { Feedback } from "@/types/feedback";
import type { Photo } from "@/types/photo";
import { FeedbackMarquee } from "@/components/shared/FeedbackMarquee";

/**
 * Testimonials — feedback screenshots (Feedback-category photos) and published
 * feedback quotes, shown as separate cards in an alternating top/bottom marquee.
 */
export function TestimonialsSection({
  testimonials,
  photos,
}: {
  testimonials: Feedback[];
  photos: Photo[];
}) {
  if (testimonials.length === 0 && photos.length === 0) return null;
  return (
    <section aria-label="Cảm nhận khách hàng" className="overflow-hidden border-b border-dark-12 bg-dark-06">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 pb-4 md:px-10 md:pt-20">
        <p className="font-medium text-sm uppercase tracking-[0.18em] text-grey-40">Cảm nhận</p>
        <h2 className="mt-3 font-semibold text-3xl text-absolutewhite md:text-5xl">
          Khách hàng nói gì về Bấu?
        </h2>
      </div>
      <div className="w-full pb-10 md:pb-16">
        <FeedbackMarquee texts={testimonials} photos={photos} />
      </div>
    </section>
  );
}
