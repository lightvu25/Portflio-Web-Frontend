import type { Feedback } from "@/types/feedback";

/** Testimonials — published feedback from GET /api/feedback. */
export function TestimonialsSection({ testimonials }: { testimonials: Feedback[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section aria-label="Cảm nhận khách hàng" className="border-b border-dark-12 bg-dark-06">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
        <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
          Cảm nhận
        </p>
        <h2 className="mt-3 font-semibold text-3xl font-semibold text-absolutewhite md:text-5xl">
          Khách hàng nói gì
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="flex flex-col rounded-[14px] border border-dark-12 bg-dark-08 p-6">
              <blockquote className="flex-1 text-sm leading-7 text-grey-50">
                “{t.content}”
              </blockquote>
              <figcaption className="mt-6 border-t border-dark-12 pt-4">
                <p className="font-semibold text-sm font-semibold text-absolutewhite">
                  {t.customerName}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
