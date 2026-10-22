"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { formatDate } from "@/lib/labels";
import type { Feedback } from "@/types/feedback";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Curated authentic feedbacks used when the backend has few or no published feedbacks,
 * ensuring the marquee always has an engaging rhythm of conversation cards and quotes.
 */
const DEFAULT_FEEDBACKS: Feedback[] = [
  {
    id: -1,
    customerName: "Minh Thư (Kỉ yếu THPT Chu Văn An)",
    content: "Ảnh xinh xỉu anh Bấu ơiii! Cả lớp ai cũng khen góc chụp tự nhiên, màu trong trẻo đúng kiểu thanh xuân luôn. Anh hỗ trợ tạo dáng siêu có tâm!",
    cloudinaryPublicId: null,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    sortOrder: 1,
    isPublished: true,
    createdAt: "2026-03-15T09:30:00Z",
    updatedAt: "2026-03-15T09:30:00Z",
  },
  {
    id: -2,
    customerName: "Hoàng Yến (Áo dài Concept)",
    content: "Lần đầu đi chụp ảnh một mình mà không bị ngượng chút nào vì anh Bấu bắt chuyện cực vui tính. Đèn flash giả nắng làm ảnh lung linh như phim Hàn Quốc vậy á!",
    cloudinaryPublicId: null,
    imageUrl: null,
    sortOrder: 2,
    isPublished: true,
    createdAt: "2026-03-22T14:15:00Z",
    updatedAt: "2026-03-22T14:15:00Z",
  },
  {
    id: -3,
    customerName: "Tập thể 12A3 (THPT Kim Liên)",
    content: "Cảm ơn anh Bấu buổi chụp kỷ yếu hôm nay nhiệt tình dã man! Mang theo cả súng bong bóng với đèn trợ sáng xịn sò. Nhận file gốc ngay trong đêm nhanh chóng mặt.",
    cloudinaryPublicId: null,
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    sortOrder: 3,
    isPublished: true,
    createdAt: "2026-04-02T16:00:00Z",
    updatedAt: "2026-04-02T16:00:00Z",
  },
  {
    id: -4,
    customerName: "Khánh Linh (Tốt nghiệp ĐH Ngoại Thương)",
    content: "Đúng chuẩn thợ đẹp trai chụp có tâm như lời đồn haha! 10 ảnh hậu kỳ chi tiết da dẻ mịn màng tự nhiên, không bị giả trân xíu nào. 100/10 điểm!",
    cloudinaryPublicId: null,
    imageUrl: null,
    sortOrder: 4,
    isPublished: true,
    createdAt: "2026-04-10T10:45:00Z",
    updatedAt: "2026-04-10T10:45:00Z",
  },
  {
    id: -5,
    customerName: "Phương Anh & Tuấn Kiệt (Couple Concept)",
    content: "Hai đứa mình đều ngại ống kính mà qua tay anh Bấu thành cặp đôi điện ảnh luôn. Cảm ơn anh đã lưu giữ lại kỉ niệm ngày tròn 3 năm yêu nhau cực kỳ ý nghĩa.",
    cloudinaryPublicId: null,
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
    sortOrder: 5,
    isPublished: true,
    createdAt: "2026-04-18T18:20:00Z",
    updatedAt: "2026-04-18T18:20:00Z",
  },
  {
    id: -6,
    customerName: "Thuỳ Dương (Kỉ yếu THCS)",
    content: "Anh Bấu chụp cho lớp cấp 2 tụi em vui nổ trời, hướng dẫn từng bạn tạo dáng ngầu đét. Giá gói nhóm lại còn siêu hạt dẻ nữa. Sau lên cấp 3 chắc chắn book tiếp!",
    cloudinaryPublicId: null,
    imageUrl: null,
    sortOrder: 6,
    isPublished: true,
    createdAt: "2026-04-25T11:00:00Z",
    updatedAt: "2026-04-25T11:00:00Z",
  },
  {
    id: -7,
    customerName: "Bảo Ngọc (Chụp máy Film & KTS)",
    content: "Mình mang thêm máy film nhờ anh chụp hộ, anh nhiệt tình test góc canh sáng chuẩn từng frame. Cả ảnh film lẫn file kỹ thuật số đều đẹp xuất sắc!",
    cloudinaryPublicId: null,
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    sortOrder: 7,
    isPublished: true,
    createdAt: "2026-05-05T15:30:00Z",
    updatedAt: "2026-05-05T15:30:00Z",
  },
];

function hasValidImageUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && /^https?:\/\/\S+/i.test(url.trim());
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.6 5C6 6.6 3.9 9.6 3.9 13.1c0 3.3 2 5.9 5 5.9 2.4 0 4.2-1.8 4.2-4.1 0-2.2-1.6-3.9-3.8-3.9-.4 0-.8.1-1 .1.3-2 1.9-4 3.9-5.1L9.6 5zm10.5 0c-3.6 1.6-5.7 4.6-5.7 8.1 0 3.3 2 5.9 5 5.9 2.4 0 4.2-1.8 4.2-4.1 0-2.2-1.6-3.9-3.8-3.9-.4 0-.8.1-1 .1.3-2 1.9-4 3.9-5.1L20.1 5z" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

/**
 * Individual Feedback Card — styled either as a Conversation Photo card
 * or an Editorial Quote card, positioned at alternating heights.
 */
function FeedbackCardItem({
  feedback,
  index,
  isCloned,
  onOpenZoom,
}: {
  feedback: Feedback;
  index: number;
  isCloned: boolean;
  onOpenZoom: (item: Feedback) => void;
}) {
  const isImageCard = hasValidImageUrl(feedback.imageUrl);
  const isEven = index % 2 === 0;

  // Staggered vertical rhythm ("xen kẽ ở hai cao độ trên–dưới")
  const altitudeClass = isEven
    ? "self-start -translate-y-2 md:-translate-y-4"
    : "self-end translate-y-4 md:translate-y-8";

  return (
    <article
      tabIndex={isCloned ? -1 : 0}
      aria-hidden={isCloned ? "true" : undefined}
      onClick={() => onOpenZoom(feedback)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenZoom(feedback);
        }
      }}
      className={`group relative flex shrink-0 select-none flex-col overflow-hidden rounded-[20px] bg-dark-08/90 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50 ${altitudeClass} ${
        isImageCard
          ? "w-[280px] sm:w-[320px] md:w-[340px]"
          : "w-[290px] sm:w-[340px] md:w-[360px]"
      } cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {isImageCard ? (
            <span className="flex items-center gap-1.5 rounded-full bg-brand-55/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-brand-90">
              <ChatBubbleIcon className="h-3 w-3 text-brand-55" />
              Tin nhắn phản hồi
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-grey-40">
              <QuoteIcon className="h-3 w-3 text-brand-55" />
              Đánh giá dịch vụ
            </span>
          )}
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-grey-50 opacity-60 transition group-hover:bg-brand-55/20 group-hover:text-brand-90 group-hover:opacity-100">
          <ExpandIcon className="h-3 w-3" />
        </span>
      </div>

      {/* Main Body */}
      {isImageCard ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-dark-12 sm:aspect-[16/11]">
          <Image
            src={feedback.imageUrl!.trim()}
            alt={`Cảm nhận từ ${feedback.customerName}`}
            fill
            quality={100}
            sizes="(min-width: 768px) 340px, 280px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-08 via-transparent to-transparent opacity-80" />
        </div>
      ) : null}

      {/* Text Content */}
      <div className="flex flex-1 flex-col p-5">
        {!isImageCard && (
          <div className="mb-2">
            <QuoteIcon className="h-6 w-6 text-brand-55/70" />
          </div>
        )}

        <blockquote className="line-clamp-4 flex-1 text-xs leading-6 text-grey-50 sm:text-sm sm:leading-7">
          “{feedback.content}”
        </blockquote>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between border-t border-dark-12/60 pt-3">
          <div className="min-w-0 pr-2">
            <p className="truncate font-semibold text-xs text-absolutewhite sm:text-sm">
              {feedback.customerName}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[11px] text-grey-40">
            {formatDate(feedback.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

/**
 * Fullscreen Lightbox Zoom Modal for viewing conversational feedback or quote in detail.
 */
function FeedbackLightboxModal({
  feedback,
  onClose,
}: {
  feedback: Feedback;
  onClose: () => void;
}) {
  const isImage = hasValidImageUrl(feedback.imageUrl);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] max-w-[90vw] flex-col items-center justify-center md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cảm nhận"
          className="absolute -top-12 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
        >
          ✕
        </button>

        <div className="w-full overflow-hidden rounded-[20px] bg-dark-08 shadow-2xl">
          {isImage && (
            <div className="relative aspect-[4/3] max-h-[60vh] w-full bg-dark-12 sm:aspect-[16/10]">
              <Image
                src={feedback.imageUrl!.trim()}
                alt={`Cảm nhận từ ${feedback.customerName}`}
                fill
                quality={100}
                sizes="(min-width: 768px) 700px, 90vw"
                className="object-contain"
                priority
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-dark-12 pb-4">
              <div>
                <p className="font-semibold text-base text-absolutewhite md:text-lg">
                  {feedback.customerName}
                </p>
                <p className="text-xs text-grey-40">
                  {formatDate(feedback.createdAt)} · Khách hàng Bấu Chụp Choẹt
                </p>
              </div>
              <span className="rounded-full bg-brand-55/20 px-3 py-1 font-medium text-xs text-brand-90">
                Đã xác thực
              </span>
            </div>

            {feedback.content && (
              <blockquote className="mt-4 text-sm leading-7 text-grey-50 md:text-base md:leading-8">
                “{feedback.content}”
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Feedback Marquee
 *
 * Implements a unified requestAnimationFrame scroll-loop container combined with
 * pointer-drag gestures (Desktop mouse + Mobile touch).
 *
 * Zero animation fight:
 * - When pointer goes down, rAF auto-scroll pauses immediately.
 * - During dragging, the user has full, uninterrupted control over `scrollLeft`.
 * - On release, position is preserved. After a gentle 1.5s delay, auto-scroll resumes
 *   smoothly from that exact spot without resetting or jumping.
 * - Alternating cards sit at two staggered heights ("xen kẽ ở hai cao độ trên-dưới").
 * - Pure `touch-action: pan-y` ensures native vertical page scrolling is never broken on mobile.
 */
export function FeedbackMarquee({
  testimonials = [],
}: {
  testimonials?: Feedback[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const singleSetRef = useRef<HTMLDivElement>(null);
  const marqueeId = useId();

  // Active items list: combine provided feedback with curated defaults if list is short
  const items = useMemo(
    () =>
      testimonials.length >= 6
        ? testimonials
        : [
            ...testimonials,
            ...DEFAULT_FEEDBACKS.slice(0, Math.max(6 - testimonials.length, 4)),
          ],
    [testimonials],
  );

  // Drag & Motion state refs
  const isPointerDownRef = useRef(false);
  const isInteractingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const singleWidthRef = useRef(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preventClickRef = useRef(false);
  const animationFrameId = useRef<number | null>(null);
  const hasInitializedScroll = useRef(false);

  // UI States
  const [isDraggingUI, setIsDraggingUI] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [zoomedFeedback, setZoomedFeedback] = useState<Feedback | null>(null);

  // Measure single track width & initialize middle scroll position
  useLayoutEffect(() => {
    const setEl = singleSetRef.current;
    const container = containerRef.current;
    if (!setEl || !container) return;

    const measure = () => {
      const width = setEl.offsetWidth;
      if (width > 0) {
        singleWidthRef.current = width;
        // Position container inside middle set (set index 1) once
        if (!hasInitializedScroll.current) {
          container.scrollLeft = width;
          hasInitializedScroll.current = true;
        }
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(setEl);
    return () => ro.disconnect();
  }, [items]);

  // Unified requestAnimationFrame auto-scroll loop
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaMs = Math.min(64, now - lastTime);
      lastTime = now;

      const shouldAutoScroll =
        !isPaused &&
        !isReducedMotion &&
        !isInteractingRef.current &&
        singleWidthRef.current > 0;

      if (shouldAutoScroll && containerRef.current) {
        const container = containerRef.current;
        const singleWidth = singleWidthRef.current;
        // 36 pixels per second (~0.6px per frame at 60fps) — smooth and legible
        const distance = (36 * deltaMs) / 1000;
        const nextScroll = container.scrollLeft + distance;

        // Seamless wrap: wrap seamlessly when crossing set 2 boundary
        if (nextScroll >= singleWidth * 2) {
          container.scrollLeft = nextScroll - singleWidth;
        } else {
          container.scrollLeft = nextScroll;
        }
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [isPaused, isReducedMotion]);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;

    isPointerDownRef.current = true;
    isInteractingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = container.scrollLeft;

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, []);

  // Pointer Move
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !containerRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    if (!hasDraggedRef.current && Math.abs(dx) > 5) {
      hasDraggedRef.current = true;
      setIsDraggingUI(true);
    }

    if (hasDraggedRef.current) {
      const singleWidth = singleWidthRef.current;
      let target = dragStartScrollLeftRef.current - dx;

      // Handle wrap during drag so the user can drag infinitely in either direction
      if (singleWidth > 0) {
        if (target >= singleWidth * 2) {
          target -= singleWidth;
          dragStartScrollLeftRef.current -= singleWidth;
        } else if (target < singleWidth) {
          target += singleWidth;
          dragStartScrollLeftRef.current += singleWidth;
        }
      }

      containerRef.current.scrollLeft = target;
    }
  }, []);

  // Pointer Up / Cancel
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDraggingUI(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (hasDraggedRef.current) {
      preventClickRef.current = true;
      setTimeout(() => {
        preventClickRef.current = false;
      }, 180);
    }

    // After a short pause (1500ms), resume auto-scroll gently without resetting position
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isHoveredRef.current && !isPointerDownRef.current) {
        isInteractingRef.current = false;
      }
    }, 1500);
  }, []);

  // Hover Handlers
  const handlePointerEnter = useCallback(() => {
    isHoveredRef.current = true;
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  }, []);

  const handlePointerLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (!isPointerDownRef.current) {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        if (!isHoveredRef.current && !isPointerDownRef.current) {
          isInteractingRef.current = false;
        }
      }, 1200);
    }
  }, []);

  // Handle Card Zoom Click
  const handleOpenZoom = useCallback((item: Feedback) => {
    if (preventClickRef.current || hasDraggedRef.current) return;
    setZoomedFeedback(item);
  }, []);

  return (
    <div className="relative w-full">
      {/* Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-5 md:px-10">
        <p className="text-xs text-grey-40 sm:text-sm">
          <span className="hidden sm:inline">Kéo hoặc vuốt để xem thêm · </span>
          Nhấp vào thẻ để xem chi tiết
        </p>
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? "Tiếp tục cuộn tự động" : "Tạm dừng cuộn tự động"}
          className="flex items-center gap-2 rounded-full border border-dark-12 bg-dark-08/90 px-3 py-1.5 text-xs font-medium text-grey-40 transition-colors hover:border-dark-20 hover:text-absolutewhite"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isPaused ? "bg-amber-400" : "animate-pulse bg-brand-55"
            }`}
          />
          {isPaused ? "Tiếp tục chạy" : "Tạm dừng"}
        </button>
      </div>

      {/* Main Drag-to-Scroll Container */}
      <div
        ref={containerRef}
        id={`feedback-marquee-${marqueeId}`}
        aria-label="Cảm nhận khách hàng cuộn ngang"
        role="region"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`relative flex h-[480px] w-full touch-pan-y items-center overflow-x-auto overflow-y-hidden py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isDraggingUI ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Render 3 copies of the feedback set for seamless infinite loop */}
        {[0, 1, 2].map((copyIndex) => (
          <div
            key={copyIndex}
            ref={copyIndex === 0 ? singleSetRef : undefined}
            data-copy-index={copyIndex}
            aria-hidden={copyIndex > 0 ? "true" : undefined}
            className="flex h-full shrink-0 items-center gap-6 pr-6"
          >
            {items.map((feedback, idx) => (
              <FeedbackCardItem
                key={`${copyIndex}-${feedback.id}-${idx}`}
                feedback={feedback}
                index={idx}
                isCloned={copyIndex > 0}
                onOpenZoom={handleOpenZoom}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Edge Gradient Fades for Smooth Appearance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-dark-06 via-dark-06/70 to-transparent sm:w-24 md:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-dark-06 via-dark-06/70 to-transparent sm:w-24 md:w-32"
      />

      {/* Lightbox Modal */}
      {zoomedFeedback && (
        <FeedbackLightboxModal
          feedback={zoomedFeedback}
          onClose={() => setZoomedFeedback(null)}
        />
      )}
    </div>
  );
}
