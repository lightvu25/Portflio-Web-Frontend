"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { createFeedback } from "@/lib/api/feedback";
import { formatDate } from "@/lib/labels";
import type { Feedback } from "@/types/feedback";

const input =
  "w-full rounded-[10px] bg-dark-08 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-purple-55/50";

/** Feedback page — published reviews from GET /api/feedback + real submission. */
export function FeedbackPage({ feedback }: { feedback: Feedback[] }) {
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

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal from="down">
          <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
            Cảm nhận
          </p>
          <h1 className="mt-3 font-semibold text-4xl font-semibold text-absolutewhite md:text-6xl">
            Khách hàng nói gì
          </h1>
          </Reveal>
        </div>
      </section>
      <section className="flex-1">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-12 md:px-10 lg:grid-cols-[1fr_420px]">
          {/* Published feedback */}
          <div className="space-y-5">
            {feedback.map((t, i) => (
              <Reveal key={t.id} delay={i * 90} from="left">
              <figure className="rounded-[14px] border border-dark-12 bg-dark-08 p-6">
                {t.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary feedback image
                  <img src={t.imageUrl} alt="" className="mb-4 max-h-64 w-auto rounded-[10px] object-cover" />
                )}
                <blockquote className="text-sm leading-7 text-grey-50">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-4 border-t border-dark-12 pt-4">
                  <p className="font-semibold text-sm font-semibold text-absolutewhite">{t.customerName}</p>
                  <p className="mt-1 text-xs text-grey-40">{formatDate(t.createdAt)}</p>
                </figcaption>
              </figure>
              </Reveal>
            ))}
            {feedback.length === 0 && (
              <p className="py-16 text-center text-sm text-grey-40">
                Chưa có cảm nhận nào được đăng.
              </p>
            )}
          </div>
          {/* Submission form */}
          <Reveal from="right" className="h-fit">
          <form className="rounded-[14px] bg-dark-08 p-6" onSubmit={submit}>
            <h2 className="font-semibold text-xl font-semibold text-absolutewhite">
              Gửi cảm nhận
            </h2>
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
                <p className="rounded-[10px] bg-green-900/30 px-4 py-3 text-xs text-green-300">
                  Đã gửi cảm nhận — cảm ơn bạn!
                </p>
              )}
              {state === "error" && (
                <p className="rounded-[10px] bg-red-900/30 px-4 py-3 text-xs text-red-300">
                  Gửi thất bại — vui lòng thử lại.
                </p>
              )}
              <button
                type="submit"
                disabled={state === "sending"}
                className="w-full rounded-[10px] bg-purple-55 py-3 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.01] disabled:opacity-50"
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
