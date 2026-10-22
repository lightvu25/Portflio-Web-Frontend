"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { createFeedback } from "@/lib/api/feedback";
import { formatDate } from "@/lib/labels";
import type { Feedback } from "@/types/feedback";

const input =
  "w-full rounded-[10px] bg-dark-08 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand-55/50";

/** Only render <Image /> when imageUrl is a non-empty valid http(s) URL. */
function hasValidImageUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && /^https?:\/\/\S+/i.test(url.trim());
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.6 5C6 6.6 3.9 9.6 3.9 13.1c0 3.3 2 5.9 5 5.9 2.4 0 4.2-1.8 4.2-4.1 0-2.2-1.6-3.9-3.8-3.9-.4 0-.8.1-1 .1.3-2 1.9-4 3.9-5.1L9.6 5zm10.5 0c-3.6 1.6-5.7 4.6-5.7 8.1 0 3.3 2 5.9 5 5.9 2.4 0 4.2-1.8 4.2-4.1 0-2.2-1.6-3.9-3.8-3.9-.4 0-.8.1-1 .1.3-2 1.9-4 3.9-5.1L20.1 5z" />
    </svg>
  );
}

function FeedbackCard({ t, featured = false }: { t: Feedback; featured?: boolean }) {
  const showImage = hasValidImageUrl(t.imageUrl);
  const caption = (
    <figcaption className="mt-5 flex items-center justify-between gap-4 border-t border-dark-12 pt-4">
      <p className="font-semibold text-sm text-absolutewhite">{t.customerName}</p>
      <p className="shrink-0 text-xs text-grey-40">{formatDate(t.createdAt)}</p>
    </figcaption>
  );

  if (featured) {
    return (
      <figure
        className={`grid overflow-hidden rounded-[14px] border border-dark-12 bg-dark-08 ${
          showImage ? "md:grid-cols-2" : ""
        }`}
      >
        {showImage && (
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px]">
            <Image
              src={t.imageUrl!.trim()}
              alt={`Ảnh buổi chụp — ${t.customerName}`}
              fill
              quality={100}
              sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col justify-center p-6 md:p-10">
          <QuoteMark className="h-8 w-8 text-brand-55/70" />
          <blockquote className="mt-4 text-base leading-8 text-grey-50 md:text-lg md:leading-9">
            “{t.content}”
          </blockquote>
          {caption}
        </div>
      </figure>
    );
  }

  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-[14px] border border-dark-12 bg-dark-08">
      {showImage && (
        <div className="relative aspect-[4/3]">
          <Image
            src={t.imageUrl!.trim()}
            alt={`Ảnh buổi chụp — ${t.customerName}`}
            fill
            quality={100}
            sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {!showImage && <QuoteMark className="h-6 w-6 text-brand-55/60" />}
        <blockquote className={`flex-1 text-sm leading-7 text-grey-50 ${showImage ? "" : "mt-3"}`}>
          “{t.content}”
        </blockquote>
        {caption}
      </div>
    </figure>
  );
}

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

  const [first, ...rest] = feedback;

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="border-b border-dark-12">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <Reveal from="down">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
              Cảm nhận
            </p>
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
      <section className="flex-1">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-12 md:px-10 lg:grid-cols-[1fr_420px]">
          {/* Published feedback */}
          <div className="grid content-start gap-5 sm:grid-cols-2">
            {first && (
              <Reveal from="left" className="sm:col-span-2">
                <FeedbackCard t={first} featured />
              </Reveal>
            )}
            {rest.map((t, i) => (
              <Reveal key={t.id} delay={i * 90} from="left">
                <FeedbackCard t={t} />
              </Reveal>
            ))}
            {feedback.length === 0 && (
              <p className="py-16 text-center text-sm text-grey-40 sm:col-span-2">
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
                <p className="rounded-[10px] border border-brand-80/40 bg-brand-99 px-4 py-3 text-xs font-medium text-brand-90">
                  Đã gửi cảm nhận — cảm ơn bạn!
                </p>
              )}
              {state === "error" && (
                <p className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  Gửi thất bại — vui lòng thử lại.
                </p>
              )}
              <button
                type="submit"
                disabled={state === "sending"}
                className="w-full rounded-[10px] bg-brand-55 py-3 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-all hover:scale-[1.01] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2 disabled:opacity-50"
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
