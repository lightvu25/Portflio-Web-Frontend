/**
 * Bounded-concurrency (MAX_CONCURRENT_UPLOADS = 2) upload queue
 * for Admin photo uploads.
 *
 * Guarantees:
 * - At most 2 upload requests are created/in-flight at any moment (never creates
 *   all upload Promises upfront).
 * - Always passes the original `File` selected by the Admin (never the
 *   downscaled preview blob URL).
 * - Records per-file failures without aborting the rest of a batch.
 * - Limits manual retries per file (`MAX_RETRIES_PER_FILE = 3`) and never
 *   loops automatically.
 * - Marks an item `"done"` only after the backend confirms the upload and
 *   returns the persisted Photo entity.
 */

import type { CloudinaryUploadedAsset } from "@/lib/api/photos";

export const MAX_CONCURRENT_UPLOADS = 2;
export const MAX_RETRIES_PER_FILE = 3;

export type UploadState = "pending" | "uploading" | "saving" | "done" | "error";

export interface QueueUploadItem<TCrop = unknown> {
  key: string;
  /** Original untouched File chosen by the Admin — sent directly to Cloudinary. */
  file: File;
  /** Small canvas blob URL used ONLY for UI preview; never uploaded. */
  preview: string | null;
  title: string;
  sortOrder: number;
  categoryIds: number[];
  crop: TCrop | null;
  state: UploadState;
  /** Number of manual retries attempted for this item. */
  retryCount: number;
  /** Cached Cloudinary upload result when Phase B succeeded so retry only repeats Phase C (DB save). */
  uploadedAsset?: CloudinaryUploadedAsset;
  /** True when the file failed client-side format validation before any network call. */
  unrecoverableFormatError?: boolean;
  error?: string;
}

export interface BatchUploadSummary {
  successCount: number;
  failCount: number;
  aborted: boolean;
}

export function formatUploadProgressText(
  items: ReadonlyArray<Pick<QueueUploadItem, "state" | "file">>,
): string {
  const doneCount = items.filter((p) => p.state === "done").length;
  const errorCount = items.filter((p) => p.state === "error").length;
  const uploadingItems = items.filter(
    (p) => p.state === "uploading" || p.state === "saving",
  );

  let text = `Đã tải lên ${doneCount} / ${items.length} ảnh`;
  if (errorCount > 0) {
    text += ` · ${errorCount} lỗi`;
  }
  if (uploadingItems.length > 0) {
    text += ` · Đang tải: ${uploadingItems.map((u) => u.file.name).join(", ")}`;
  }
  return text;
}

export async function runSequentialUploadBatch<
  TItem extends QueueUploadItem<TCrop>,
  TCrop = unknown,
  TResult = unknown,
>({
  getItems,
  onItemPatch,
  performUpload,
  formatError,
  onAuthError,
  signal,
  concurrency = MAX_CONCURRENT_UPLOADS,
}: {
  /** Reads the latest queue snapshot so edits/removals while queued are respected. */
  getItems: () => ReadonlyArray<TItem>;
  onItemPatch: (key: string, patch: Partial<QueueUploadItem<TCrop>>) => void;
  /** Invoked lazily as worker slots become free — MUST receive `item.file` (original File). */
  performUpload: (item: TItem, signal?: AbortSignal) => Promise<TResult>;
  formatError: (err: unknown) => string;
  onAuthError?: (err: unknown) => void;
  signal?: AbortSignal;
  concurrency?: number;
}): Promise<BatchUploadSummary> {
  let successCount = 0;
  let failCount = 0;

  // Snapshot the keys to process in order, then look up the latest item state
  // right before its turn starts so user metadata edits or removals are honored.
  const initialKeys = getItems().map((item) => item.key);
  if (initialKeys.length === 0) {
    return { successCount: 0, failCount: 0, aborted: Boolean(signal?.aborted) };
  }

  const maxWorkers = Math.max(1, Math.min(concurrency, initialKeys.length));
  let cursor = 0;

  const runWorker = async () => {
    while (cursor < initialKeys.length) {
      if (signal?.aborted) {
        return;
      }

      const key = initialKeys[cursor++];
      const current = getItems().find((item) => item.key === key);
      if (!current || current.state === "done") {
        continue;
      }
      if (current.unrecoverableFormatError) {
        failCount++;
        continue;
      }

      onItemPatch(key, {
        state: current.uploadedAsset ? "saving" : "uploading",
        error: undefined,
      });

      try {
        const result = await performUpload(current, signal);
        if (signal?.aborted) {
          return;
        }
        if (result === null || result === undefined) {
          throw new Error("Máy chủ không trả về dữ liệu ảnh đã lưu.");
        }
        onItemPatch(key, { state: "done", error: undefined });
        successCount++;
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        onItemPatch(key, {
          state: "error",
          error: formatError(err),
        });
        onAuthError?.(err);
        failCount++;
      }
    }
  };

  await Promise.all(Array.from({ length: maxWorkers }, () => runWorker()));

  return { successCount, failCount, aborted: Boolean(signal?.aborted) };
}

export async function runSingleRetry<
  TItem extends QueueUploadItem<TCrop>,
  TCrop = unknown,
  TResult = unknown,
>({
  item,
  onItemPatch,
  performUpload,
  formatError,
  onAuthError,
  signal,
}: {
  item: TItem;
  onItemPatch: (key: string, patch: Partial<QueueUploadItem<TCrop>>) => void;
  performUpload: (item: TItem, signal?: AbortSignal) => Promise<TResult>;
  formatError: (err: unknown) => string;
  onAuthError?: (err: unknown) => void;
  signal?: AbortSignal;
}): Promise<{ ok: boolean; reason?: "max-retries-exceeded" | "unrecoverable" | "failed" | "aborted" }> {
  if (item.unrecoverableFormatError) {
    return { ok: false, reason: "unrecoverable" };
  }
  if (item.retryCount >= MAX_RETRIES_PER_FILE) {
    onItemPatch(item.key, {
      state: "error",
      error: `Đã vượt quá giới hạn thử lại (${MAX_RETRIES_PER_FILE} lần) — vui lòng xóa ảnh này và chọn lại.`,
    });
    return { ok: false, reason: "max-retries-exceeded" };
  }
  if (signal?.aborted) {
    return { ok: false, reason: "aborted" };
  }

  const nextRetryCount = item.retryCount + 1;
  onItemPatch(item.key, {
    state: item.uploadedAsset ? "saving" : "uploading",
    retryCount: nextRetryCount,
    error: undefined,
  });

  try {
    const result = await performUpload(item, signal);
    if (signal?.aborted) {
      return { ok: false, reason: "aborted" };
    }
    if (result === null || result === undefined) {
      throw new Error("Máy chủ không trả về dữ liệu ảnh đã lưu.");
    }
    onItemPatch(item.key, { state: "done", error: undefined });
    return { ok: true };
  } catch (err) {
    if (signal?.aborted) {
      return { ok: false, reason: "aborted" };
    }
    onItemPatch(item.key, {
      state: "error",
      error: formatError(err),
    });
    onAuthError?.(err);
    return { ok: false, reason: "failed" };
  }
}
