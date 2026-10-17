"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * Inline alert shown where backend-driven content failed to load — distinct
 * from a legitimately empty result, which renders its own empty state.
 * "Thử lại" re-runs the page's server-side fetch via router.refresh()
 * without a full reload. This also covers Render cold starts: the failed
 * request already woke the backend, so a retry usually succeeds.
 */
export function DataFetchError({
  message = "Không thể tải ảnh từ máy chủ.",
}: {
  message?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-[14px] border border-dark-12 bg-dark-08 px-6 py-12 text-center"
    >
      <p className="font-semibold text-lg text-absolutewhite">{message}</p>
      <p className="max-w-md text-sm leading-7 text-grey-50">
        Kết nối bị gián đoạn hoặc máy chủ đang khởi động — vui lòng thử lại sau giây lát.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="rounded-[10px] bg-purple-55 px-6 py-2.5 font-medium text-sm text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Đang tải…" : "Thử lại"}
      </button>
    </div>
  );
}
