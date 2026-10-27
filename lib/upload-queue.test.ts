import { describe, expect, it } from "vitest";
import {
  formatUploadProgressText,
  MAX_CONCURRENT_UPLOADS,
  MAX_RETRIES_PER_FILE,
  runSequentialUploadBatch,
  runSingleRetry,
  type QueueUploadItem,
} from "./upload-queue";

function makeFakeFile(name: string, sizeBytes: number, type = "image/jpeg"): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], name, { type });
}

function makeQueueItem(
  index: number,
  file: File,
  overrides: Partial<QueueUploadItem> = {},
): QueueUploadItem {
  return {
    key: `item-${index}`,
    file,
    preview: `blob:preview-only-${index}`,
    title: file.name.replace(/\.[^.]+$/, ""),
    sortOrder: index,
    categoryIds: [1],
    crop: null,
    state: "pending",
    retryCount: 0,
    ...overrides,
  };
}

describe("upload-queue (Safe Image Upload Concurrency Limit = 2)", () => {
  it("1. uploads a single small image and preserves the exact original File instance", async () => {
    const originalFile = makeFakeFile("small-photo.jpg", 120_000);
    const items: QueueUploadItem[] = [makeQueueItem(1, originalFile)];
    const uploadedFiles: File[] = [];

    const summary = await runSequentialUploadBatch({
      getItems: () => items,
      onItemPatch: (key, patch) => {
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) items[idx] = { ...items[idx], ...patch };
      },
      performUpload: async (item) => {
        uploadedFiles.push(item.file);
        return { id: 101, imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/small.jpg" };
      },
      formatError: (err) => String(err),
    });

    expect(summary).toEqual({ successCount: 1, failCount: 0, aborted: false });
    expect(items[0].state).toBe("done");
    // Must pass the exact original File reference, never the preview blob URL
    expect(uploadedFiles).toHaveLength(1);
    expect(uploadedFiles[0]).toBe(originalFile);
    expect(uploadedFiles[0].size).toBe(120_000);
  });

  it("2. uploads a large high-resolution JPEG without altering the File before sending", async () => {
    const largeJpeg = makeFakeFile("camera-40mp.jpg", 8_500_000, "image/jpeg");
    const items: QueueUploadItem[] = [makeQueueItem(1, largeJpeg)];
    let receivedFile: File | null = null;

    const summary = await runSequentialUploadBatch({
      getItems: () => items,
      onItemPatch: (key, patch) => {
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) items[idx] = { ...items[idx], ...patch };
      },
      performUpload: async (item) => {
        receivedFile = item.file;
        return { id: 102, imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/large.jpg" };
      },
      formatError: (err) => String(err),
    });

    expect(summary).toEqual({ successCount: 1, failCount: 0, aborted: false });
    expect(receivedFile).toBe(largeJpeg);
    expect(receivedFile!.size).toBe(8_500_000);
    expect(receivedFile!.type).toBe("image/jpeg");
  });

  it("3 & 4. processes a 56-image batch with strict maxConcurrency = 2 and continues when 1 image fails in the middle", async () => {
    expect(MAX_CONCURRENT_UPLOADS).toBe(2);
    const TOTAL = 56;
    const FAIL_INDEX = 17; // 17th image fails
    const items: QueueUploadItem[] = Array.from({ length: TOTAL }, (_, idx) =>
      makeQueueItem(idx + 1, makeFakeFile(`photo-${idx + 1}.jpg`, 1024)),
    );

    let inFlight = 0;
    let maxObservedConcurrency = 0;
    const progressSnapshots: string[] = [];
    const startedIndices: number[] = [];

    const summary = await runSequentialUploadBatch({
      getItems: () => items,
      onItemPatch: (key, patch) => {
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) items[idx] = { ...items[idx], ...patch };
      },
      performUpload: async (item) => {
        inFlight++;
        maxObservedConcurrency = Math.max(maxObservedConcurrency, inFlight);
        startedIndices.push(item.sortOrder);

        // Verify at most 2 items are in "uploading" state at any time
        const uploadingNow = items.filter((i) => i.state === "uploading");
        expect(uploadingNow.length).toBeGreaterThanOrEqual(1);
        expect(uploadingNow.length).toBeLessThanOrEqual(MAX_CONCURRENT_UPLOADS);
        expect(uploadingNow.some((u) => u.key === item.key)).toBe(true);

        if (item.sortOrder === 2) {
          progressSnapshots.push(formatUploadProgressText(items));
        }

        await new Promise((r) => setTimeout(r, 2));
        inFlight--;

        if (item.sortOrder === FAIL_INDEX) {
          throw new Error("HTTP 502: Cloudinary temporary timeout");
        }
        return { id: item.sortOrder };
      },
      formatError: (err) => (err instanceof Error ? err.message : String(err)),
    });

    expect(maxObservedConcurrency).toBe(2);
    expect(startedIndices).toHaveLength(TOTAL);
    expect(summary).toEqual({
      successCount: TOTAL - 1,
      failCount: 1,
      aborted: false,
    });

    // When item #2 starts alongside item #1, both active filenames are shown
    expect(progressSnapshots[0]).toBe(
      "Đã tải lên 0 / 56 ảnh · Đang tải: photo-1.jpg, photo-2.jpg",
    );
    // Final progress string reflects 55 done, 1 error
    expect(formatUploadProgressText(items)).toBe("Đã tải lên 55 / 56 ảnh · 1 lỗi");

    const failedItem = items.find((i) => i.sortOrder === FAIL_INDEX)!;
    expect(failedItem.state).toBe("error");
    expect(failedItem.error).toContain("Cloudinary temporary timeout");
  });

  it("5. retries a single failed item without re-uploading completed items and enforces MAX_RETRIES_PER_FILE = 3", async () => {
    const file = makeFakeFile("retry-me.jpg", 2048);
    let item = makeQueueItem(17, file, {
      state: "error",
      error: "Network error",
      retryCount: 0,
    });

    const patchItem = (_key: string, patch: Partial<QueueUploadItem>) => {
      item = { ...item, ...patch };
    };

    // Attempt 1..3 fail
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_FILE; attempt++) {
      const res = await runSingleRetry({
        item,
        onItemPatch: patchItem,
        performUpload: async () => {
          throw new Error(`Fail #${attempt}`);
        },
        formatError: (e) => (e instanceof Error ? e.message : String(e)),
      });
      expect(res.ok).toBe(false);
      expect(res.reason).toBe("failed");
      expect(item.retryCount).toBe(attempt);
      expect(item.state).toBe("error");
    }

    // Attempt 4 is blocked by MAX_RETRIES_PER_FILE without invoking performUpload
    let calledOnFourth = false;
    const fourth = await runSingleRetry({
      item,
      onItemPatch: patchItem,
      performUpload: async () => {
        calledOnFourth = true;
        return { id: 999 };
      },
      formatError: (e) => String(e),
    });

    expect(fourth).toEqual({ ok: false, reason: "max-retries-exceeded" });
    expect(calledOnFourth).toBe(false);
    expect(item.error).toContain("vượt quá giới hạn thử lại");

    // Reset to 1 retry used and verify a successful retry marks it "done"
    item = { ...item, retryCount: 1 };
    const successRes = await runSingleRetry({
      item,
      onItemPatch: patchItem,
      performUpload: async (target) => {
        expect(target.file).toBe(file);
        return { id: 170 };
      },
      formatError: (e) => String(e),
    });

    expect(successRes).toEqual({ ok: true });
    expect(item.state).toBe("done");
    expect(item.retryCount).toBe(2);
  });

  it("6. stops the queue cleanly when aborted (e.g. component unmount)", async () => {
    const items: QueueUploadItem[] = Array.from({ length: 10 }, (_, idx) =>
      makeQueueItem(idx + 1, makeFakeFile(`img-${idx + 1}.jpg`, 512)),
    );
    const abortController = new AbortController();
    let callCount = 0;

    const summary = await runSequentialUploadBatch({
      getItems: () => items,
      onItemPatch: (key, patch) => {
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) items[idx] = { ...items[idx], ...patch };
      },
      performUpload: async (item) => {
        callCount++;
        await new Promise((r) => setTimeout(r, 2));
        if (item.sortOrder === 3) {
          abortController.abort();
        }
        return { id: item.sortOrder };
      },
      formatError: (e) => String(e),
      signal: abortController.signal,
    });

    expect(callCount).toBeLessThanOrEqual(4);
    expect(summary.aborted).toBe(true);
    expect(summary.successCount).toBe(2);
  });
});
