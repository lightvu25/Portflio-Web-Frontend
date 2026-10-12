"use client";

/** Root error boundary — a failed render shows a retry instead of a blank page. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center gap-4 bg-dark-03 px-6 text-center">
      <p className="font-semibold text-lg text-absolutewhite">Đã xảy ra lỗi khi tải trang.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[10px] bg-purple-55 px-5 py-2.5 font-medium text-sm text-white transition-transform hover:scale-[1.03]"
      >
        Thử lại
      </button>
    </main>
  );
}
