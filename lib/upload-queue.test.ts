import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CloudinaryDirectUploadError,
  uploadPhoto,
  type CloudinaryUploadedAsset,
} from "./api/photos";
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("7. executes 3-phase Signed Direct Upload (signature -> Cloudinary direct -> backend metadata save) and transitions uploading -> saving -> done", async () => {
    const originalFile = makeFakeFile("wedding-raw.jpg", 4_200_000, "image/jpeg");
    const items: QueueUploadItem[] = [makeQueueItem(1, originalFile, { categoryIds: [2, 5] })];
    const observedStates: string[] = [];

    const fetchCalls: { url: string; headers?: Record<string, string>; body: unknown }[] = [];
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);
      fetchCalls.push({
        url,
        headers: init?.headers as Record<string, string> | undefined,
        body: init?.body,
      });

      if (url.endsWith("/api/admin/photos/upload-signature")) {
        return new Response(
          JSON.stringify({
            signature: "signed-req-token",
            timestamp: 1730150000,
            apiKey: "99887766",
            cloudName: "bau-cloud",
            folder: "haibau/photos",
            publicId: "uuid-direct-1",
            uploadUrl: "https://api.cloudinary.com/v1_1/bau-cloud/image/upload",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url === "https://api.cloudinary.com/v1_1/bau-cloud/image/upload") {
        const fd = init?.body as FormData;
        expect(fd.get("file")).toBe(originalFile);
        expect(fd.get("api_key")).toBe("99887766");
        expect(fd.get("folder")).toBe("haibau/photos");
        expect(fd.get("public_id")).toBe("uuid-direct-1");
        expect(fd.get("signature")).toBe("signed-req-token");
        // Backend JWT must NEVER be sent to Cloudinary
        expect(init?.headers).toBeUndefined();

        return new Response(
          JSON.stringify({
            public_id: "haibau/photos/uuid-direct-1",
            version: 1730150005,
            signature: "cloudinary-response-sig-xyz",
            secure_url:
              "https://res.cloudinary.com/bau-cloud/image/upload/v1730150005/haibau/photos/uuid-direct-1.jpg",
            resource_type: "image",
            format: "jpg",
            bytes: 4_200_000,
            width: 6000,
            height: 4000,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/admin/photos")) {
        // Must already be in "saving" state before backend completion finishes
        expect(items[0].state).toBe("saving");
        expect(items[0].uploadedAsset?.publicId).toBe("haibau/photos/uuid-direct-1");
        const parsed = JSON.parse(String(init?.body));
        expect(parsed.publicId).toBe("haibau/photos/uuid-direct-1");
        expect(parsed.signature).toBe("cloudinary-response-sig-xyz");
        expect(parsed.categoryIds).toEqual([2, 5]);

        return new Response(
          JSON.stringify({
            id: 501,
            cloudinaryPublicId: "haibau/photos/uuid-direct-1",
            imageUrl:
              "https://res.cloudinary.com/bau-cloud/image/upload/v1730150005/haibau/photos/uuid-direct-1.jpg",
            status: "DRAFT",
            categories: [],
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    const summary = await runSequentialUploadBatch({
      getItems: () => items,
      onItemPatch: (key, patch) => {
        const idx = items.findIndex((i) => i.key === key);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...patch };
          if (patch.state) observedStates.push(patch.state);
        }
      },
      performUpload: (item, signal) =>
        uploadPhoto("admin-jwt", item.file, {
          title: item.title,
          sortOrder: item.sortOrder,
          categoryIds: item.categoryIds,
          uploadedAsset: item.uploadedAsset,
          onUploadedToCloudinary: (asset) => {
            items[0] = { ...items[0], uploadedAsset: asset, state: "saving" };
            observedStates.push("saving");
          },
          signal,
        }),
      formatError: (e) => (e instanceof Error ? e.message : String(e)),
    });

    expect(summary).toEqual({ successCount: 1, failCount: 0, aborted: false });
    expect(observedStates).toEqual(["uploading", "saving", "done"]);
    expect(fetchCalls).toHaveLength(3);
  });

  it("8. caches uploadedAsset when Cloudinary succeeds but DB metadata save fails, and skips re-uploading to Cloudinary on retry", async () => {
    const file = makeFakeFile("portrait.jpg", 2_000_000, "image/jpeg");
    let item = makeQueueItem(1, file, { categoryIds: [3] });
    let cloudinaryUploadCalls = 0;
    let backendSaveAttempts = 0;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/api/admin/photos/upload-signature")) {
        return new Response(
          JSON.stringify({
            signature: "sig-1",
            timestamp: 1730150000,
            apiKey: "112233",
            cloudName: "bau-cloud",
            folder: "haibau/photos",
            publicId: "uuid-cached",
            uploadUrl: "https://api.cloudinary.com/v1_1/bau-cloud/image/upload",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url === "https://api.cloudinary.com/v1_1/bau-cloud/image/upload") {
        cloudinaryUploadCalls++;
        return new Response(
          JSON.stringify({
            public_id: "haibau/photos/uuid-cached",
            version: 1730150099,
            signature: "resp-sig-cached",
            secure_url:
              "https://res.cloudinary.com/bau-cloud/image/upload/v1730150099/haibau/photos/uuid-cached.jpg",
            resource_type: "image",
            format: "jpg",
            bytes: 2_000_000,
            width: 3000,
            height: 2000,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.endsWith("/api/admin/photos")) {
        backendSaveAttempts++;
        if (backendSaveAttempts === 1) {
          return new Response(
            JSON.stringify({ status: 503, error: "DB_UNAVAILABLE", message: "Database timeout" }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({
            id: 777,
            cloudinaryPublicId: "haibau/photos/uuid-cached",
            imageUrl:
              "https://res.cloudinary.com/bau-cloud/image/upload/v1730150099/haibau/photos/uuid-cached.jpg",
            status: "DRAFT",
            categories: [],
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const patchItem = (_key: string, patch: Partial<QueueUploadItem>) => {
      item = { ...item, ...patch };
    };

    // First attempt: Cloudinary succeeds, Backend DB save fails with 503
    await runSequentialUploadBatch({
      getItems: () => [item],
      onItemPatch: patchItem,
      performUpload: (target, signal) =>
        uploadPhoto("admin-jwt", target.file, {
          title: target.title,
          categoryIds: target.categoryIds,
          uploadedAsset: target.uploadedAsset,
          onUploadedToCloudinary: (asset: CloudinaryUploadedAsset) =>
            patchItem(target.key, { uploadedAsset: asset, state: "saving" }),
          signal,
        }),
      formatError: (e) => (e instanceof Error ? e.message : String(e)),
    });

    expect(cloudinaryUploadCalls).toBe(1);
    expect(backendSaveAttempts).toBe(1);
    expect(item.state).toBe("error");
    expect(item.uploadedAsset?.publicId).toBe("haibau/photos/uuid-cached");

    // Retry: Must NOT call Cloudinary again; only retries POST /api/admin/photos
    const retryRes = await runSingleRetry({
      item,
      onItemPatch: patchItem,
      performUpload: (target, signal) =>
        uploadPhoto("admin-jwt", target.file, {
          title: target.title,
          categoryIds: target.categoryIds,
          uploadedAsset: target.uploadedAsset,
          onUploadedToCloudinary: (asset: CloudinaryUploadedAsset) =>
            patchItem(target.key, { uploadedAsset: asset, state: "saving" }),
          signal,
        }),
      formatError: (e) => (e instanceof Error ? e.message : String(e)),
    });

    expect(retryRes).toEqual({ ok: true });
    expect(cloudinaryUploadCalls).toBe(1); // Still 1! No duplicate Cloudinary upload
    expect(backendSaveAttempts).toBe(2);
    expect(item.state).toBe("done");
  });

  it("9. surfaces clear Vietnamese error when Cloudinary rejects an oversized file and does not call backend save", async () => {
    const file = makeFakeFile("oversized.jpg", 25_000_000, "image/jpeg");
    let backendSaveCalled = false;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/api/admin/photos/upload-signature")) {
        return new Response(
          JSON.stringify({
            signature: "sig-over",
            timestamp: 1730150000,
            apiKey: "112233",
            cloudName: "bau-cloud",
            folder: "haibau/photos",
            publicId: "uuid-over",
            uploadUrl: "https://api.cloudinary.com/v1_1/bau-cloud/image/upload",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url === "https://api.cloudinary.com/v1_1/bau-cloud/image/upload") {
        return new Response(
          JSON.stringify({
            error: { message: "File size too large. Got 25000000. Maximum is 10485760." },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.endsWith("/api/admin/photos")) {
        backendSaveCalled = true;
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    await expect(uploadPhoto("admin-jwt", file)).rejects.toThrow(CloudinaryDirectUploadError);
    expect(backendSaveCalled).toBe(false);
  });
});
