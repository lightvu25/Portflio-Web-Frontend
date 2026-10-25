"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackMarquee } from "@/components/shared/FeedbackMarquee";
import { createFeedback } from "@/lib/api/feedback";
import type { Feedback } from "@/types/feedback";
import type { Photo } from "@/types/photo";

const inputCls =
  "w-full rounded-[10px] bg-dark-03 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 ring-1 ring-dark-12 focus:outline-none focus:ring-2 focus:ring-brand-55/60";

/**
 * Testimonials section on the homepage — displays the auto-scrolling
 * FeedbackMarquee (feedback screenshots + published quotes) followed directly
 * by the customer feedback submission form.
 */
export function TestimonialsSection({
  testimonials,
  photos,
}: {
  testimonials: Feedback[];
  photos: Photo[];
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea to fit multi-line feedback smoothly.
  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [content]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setState("sending");
    try {
      await createFeedback({
        customerName: name.trim(),
        content: content.trim(),
      });
      setState("sent");
      setName("");
      setContent("");
    } catch {
      setState("error");
    }
  };

  const hasMarqueeItems = testimonials.length > 0 || photos.length > 0;

  return (
    <section
      id="feedback"
      aria-label="Cảm nhận khách hàng"
      className="overflow-hidden border-b border-dark-12 bg-dark-06"
    >
      <div className="mx-auto max-w-[1400px] px-5 pt-14 pb-4 md:px-10 md:pt-20">
        <p className="font-medium text-sm uppercase tracking-[0.18em] text-grey-40">
          Cảm nhận
        </p>
        <h2 className="mt-3 font-semibold text-3xl text-absolutewhite md:text-5xl">
          Khách hàng nói gì về Bấu?
        </h2>
      </div>

      {hasMarqueeItems ? (
        <div className="w-full pb-8 md:pb-12">
          <FeedbackMarquee texts={testimonials} photos={photos} />
        </div>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-grey-40">
          Hãy là người đầu tiên chia sẻ cảm nhận sau buổi chụp cùng Bấu nhé!
        </p>
      )}

      {/* Embedded Feedback Submission Form right below the auto-scroll marquee */}
      <div className="mx-auto max-w-[600px] px-5 pb-14 md:px-10 md:pb-20">
        <form
          onSubmit={submit}
          className="rounded-[16px] border border-dark-12 bg-dark-08 p-6 shadow-sm md:p-8"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h3 className="font-semibold text-xl text-absolutewhite">
              Gửi cảm nhận của bạn
            </h3>
            <p className="text-xs text-grey-40">
              Hiển thị sau khi được duyệt
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              aria-label="Tên của bạn"
              className={inputCls}
            />
            <textarea
              ref={contentRef}
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cảm nhận của bạn về buổi chụp cùng Bấu..."
              aria-label="Cảm nhận của bạn"
              className={`${inputCls} resize-none overflow-hidden`}
            />
            {state === "sent" && (
              <p className="rounded-[10px] bg-brand-99 px-4 py-3 text-xs font-medium text-brand-90">
                Đã gửi cảm nhận — cảm ơn bạn rất nhiều!
              </p>
            )}
            {state === "error" && (
              <p className="rounded-[10px] bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                Gửi thất bại — vui lòng thử lại.
              </p>
            )}
            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-[10px] bg-brand-55 py-3 font-medium text-sm text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-[1.01] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {state === "sending" ? "Đang gửi…" : "Gửi cảm nhận"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
