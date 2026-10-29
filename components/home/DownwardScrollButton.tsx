"use client";

/**
 * Floating downward section navigation button on the Homepage (`/`).
 * Advances smoothly by 1 logical stage/section per click and fades out
 * automatically once the user reaches the bottom footer.
 */
export function DownwardScrollButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cuộn xuống phần tiếp theo"
      title="Cuộn xuống phần tiếp theo"
      data-downward-btn
      className={`fixed bottom-5 left-1/2 z-40 inline-flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-brand-55/40 bg-white/90 text-brand-90 shadow-[0_10px_28px_rgba(47,69,37,0.18)] backdrop-blur-md transition-[transform,opacity,background-color,color,box-shadow] duration-300 hover:scale-105 hover:bg-brand-55 hover:text-white hover:shadow-[0_14px_32px_rgba(107,142,90,0.32)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 focus-visible:ring-offset-2 sm:bottom-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="animate-scroll-cue"
      >
        <path
          d="M12 5v14M6 13l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
