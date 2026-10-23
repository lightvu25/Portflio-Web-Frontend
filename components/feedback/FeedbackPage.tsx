"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { FeedbackMarquee } from "@/components/shared/FeedbackMarquee";
import { createFeedback } from "@/lib/api/feedback";
import type { Feedback } from "@/types/feedback";
import type { Photo } from "@/types/photo";

const input =
  "w-full rounded-[10px] bg-dark-06 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand-55/50";

/**
 * Feedback page — same marquee as the homepage (feedback screenshots from the
 * Feedback category + published quotes) plus the real submission form.
 */
export function FeedbackPage({ feedback, photos }: { feedback: Feedback[]; photos: Photo[] }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea to fit long text — no manual resize handle.
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
      await createFeedback({ customerName: name.trim(), content: content.trim() });
      setState("sent");
      setName("");
      setContent("");
    } catch {
      setState("error");
    }
  };

  const empty = feedback.length === 0 && photos.length === 0;

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal from="down">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-grey-40">Cảm nhận</p>
            <h1 className="mt-3 text-4xl font-semibold text-absolutewhite md:text-6xl">
              Khách hàng nói gì về Bấu?
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-grey-50 md:text-base md:leading-8">
              Những lời cảm nhận thật sự mà khách hàng gửi về cho Bấu sau mỗi buổi
              chụp — về sự thoải mái, những góc hình đẹp và cả niềm vui trong suốt
              buổi chụp.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="overflow-hidden border-b border-dark-12 bg-dark-06">
        {empty ? (
          <p className="py-16 text-center text-sm text-grey-40">Chưa có cảm nhận nào được đăng.</p>
        ) : (
          <div className="py-6 md:py-10">
            <FeedbackMarquee texts={feedback} photos={photos} />
          </div>
        )}
      </section>

      <section className="flex-1">
        <div className="mx-auto max-w-[560px] px-5 py-14 md:px-10">
          <Reveal from="up" className="h-fit">
            <form className="rounded-[14px] bg-dark-08 p-6" onSubmit={submit}>
              <h2 className="font-semibold text-xl text-absolutewhite">Gửi cảm nhận</h2>
              <p className="mt-2 text-xs leading-5 text-grey-40">
                Cảm nhận sẽ được hiển thị sau khi duyệt.
              </p>
              <div className="mt-5 space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên của bạn"
                  aria-label="Tên của bạn"
                  className={input}
                />
                <textarea
                  ref={contentRef}
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cảm nhận của bạn về buổi chụp"
                  aria-label="Cảm nhận của bạn"
                  className={`${input} resize-none overflow-hidden`}
                />
                {state === "sent" && (
                  <p className="rounded-[10px] bg-brand-99 px-4 py-3 text-xs font-medium text-brand-90">
                    Đã gửi cảm nhận — cảm ơn bạn!
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
                  className="w-full rounded-[10px] bg-brand-55 py-3 font-medium text-sm text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-all hover:scale-[1.01] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  {state === "sending" ? "Đang gửi…" : "Gửi cảm nhận"}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
