/**
 * Shared image-cropping math, state conversion, URL helpers, and validated
 * Canvas output generation for the Admin photo cropper (`react-easy-crop`).
 *
 * Architectural separation:
 * 1. Original image: untouched `File` (pending upload) or `originalImageUrl` (saved photo).
 * 2. Crop interaction state: `{ crop, zoom, aspect }` inside `CropEditor` modal only.
 * 3. Persisted crop state: `CropFraction` (`0..1` fractions of intrinsic image size).
 * 4. Cropped output: Canvas preview `Blob` (pending card) or Cloudinary `c_crop,g_north_west` URL.
 */

import type { Photo } from "@/types/photo";

/** Saved crop expressed as `0..1` fractions of the original image's intrinsic dimensions. */
export interface CropFraction {
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
}

/** `0..100` percentage rectangle matching `react-easy-crop`'s `croppedArea` (1st callback arg). */
export interface CropAreaPercentages {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Validated integer pixel crop rectangle in `[0, naturalWidth] × [0, naturalHeight]`. */
export interface IntrinsicPixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AspectPresetKey = "orig" | "1:1" | "4:3" | "3:4";

export interface ResolvedAspect {
  key: AspectPresetKey | "custom";
  ratio: number;
}

/** Rounds a fraction to 6 decimal places (`0.006px` on a `6000px` DSLR photo) and normalizes `-0`. */
export function roundCropValue(value: number): number {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Checks whether an arbitrary value is a finite, non-empty crop fraction within tolerance. */
export function isValidCropFraction(crop: unknown): crop is CropFraction {
  if (!crop || typeof crop !== "object") return false;
  const c = crop as Record<string, unknown>;
  const { cropX, cropY, cropW, cropH } = c;
  if (
    typeof cropX !== "number" ||
    typeof cropY !== "number" ||
    typeof cropW !== "number" ||
    typeof cropH !== "number" ||
    !Number.isFinite(cropX) ||
    !Number.isFinite(cropY) ||
    !Number.isFinite(cropW) ||
    !Number.isFinite(cropH)
  ) {
    return false;
  }
  return (
    cropX >= -0.05 &&
    cropY >= -0.05 &&
    cropX < 1 &&
    cropY < 1 &&
    cropW > 0 &&
    cropH > 0 &&
    cropW <= 1.05 &&
    cropH <= 1.05 &&
    cropX + cropW <= 1.05 &&
    cropY + cropH <= 1.05
  );
}

/**
 * Clamps sub-pixel overshoots into `[0, 1]` and rounds cleanly to 6 decimal places.
 * Matches backend `GalleryService.applyCrop` bounds (`[0, 0.9999]` offset, `[0.0001, 1 - offset]` size).
 */
export function sanitizeCropFraction(crop: CropFraction): CropFraction {
  if (!isValidCropFraction(crop)) {
    throw new Error("Dữ liệu vùng cắt không hợp lệ.");
  }
  const cropX = roundCropValue(Math.min(0.9999, Math.max(0, crop.cropX)));
  const cropY = roundCropValue(Math.min(0.9999, Math.max(0, crop.cropY)));
  const maxW = roundCropValue(Math.max(0.0001, 1 - cropX));
  const maxH = roundCropValue(Math.max(0.0001, 1 - cropY));
  const cropW = Math.min(maxW, roundCropValue(Math.max(0.0001, crop.cropW)));
  const cropH = Math.min(maxH, roundCropValue(Math.max(0.0001, crop.cropH)));
  return { cropX, cropY, cropW, cropH };
}

/**
 * Converts `react-easy-crop`'s `croppedArea` (**1st parameter**, `0..100` percentages)
 * into a persisted `0..1` `CropFraction`.
 *
 * IMPORTANT: Never pass `croppedAreaPixels` (the 2nd parameter of `onCropComplete`) here.
 */
export function areaPercentagesToCropFraction(
  croppedAreaPercentages: CropAreaPercentages,
): CropFraction {
  const { x, y, width, height } = croppedAreaPercentages;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error("Tọa độ phần trăm vùng cắt không hợp lệ.");
  }
  return sanitizeCropFraction({
    cropX: x / 100,
    cropY: y / 100,
    cropW: width / 100,
    cropH: height / 100,
  });
}

/**
 * Converts a persisted `0..1` `CropFraction` back to `0..100` percentages for
 * `react-easy-crop`'s `initialCroppedAreaPercentages` prop.
 */
export function cropFractionToAreaPercentages(crop: CropFraction): CropAreaPercentages {
  const safe = sanitizeCropFraction(crop);
  return {
    x: roundCropValue(safe.cropX * 100),
    y: roundCropValue(safe.cropY * 100),
    width: roundCropValue(safe.cropW * 100),
    height: roundCropValue(safe.cropH * 100),
  };
}

/** Extracts a valid `CropFraction` from a `Photo` entity, or `null` when uncropped. */
export function extractSavedCrop(
  photo: Pick<Photo, "cropX" | "cropY" | "cropW" | "cropH">,
): CropFraction | null {
  if (
    photo.cropX == null ||
    photo.cropY == null ||
    photo.cropW == null ||
    photo.cropH == null
  ) {
    return null;
  }
  const candidate = {
    cropX: photo.cropX,
    cropY: photo.cropY,
    cropW: photo.cropW,
    cropH: photo.cropH,
  };
  return isValidCropFraction(candidate) ? sanitizeCropFraction(candidate) : null;
}

/**
 * Recovers the exact aspect ratio preset (`Gốc`, `1:1`, `4:3`, `3:4`, or `custom`)
 * from a saved `CropFraction` and the original image's intrinsic dimensions.
 *
 * Because `cropW` and `cropH` are fractions of `naturalWidth` and `naturalHeight`,
 * the cropped pixel aspect ratio is `(cropW * naturalWidth) / (cropH * naturalHeight)`.
 */
export function inferAspectPresetFromCrop(
  crop: CropFraction | null | undefined,
  naturalWidth: number,
  naturalHeight: number,
): ResolvedAspect {
  const naturalAspect =
    Number.isFinite(naturalWidth) &&
    Number.isFinite(naturalHeight) &&
    naturalWidth > 0 &&
    naturalHeight > 0
      ? naturalWidth / naturalHeight
      : 4 / 3;

  if (!crop || !isValidCropFraction(crop)) {
    return { key: "orig", ratio: naturalAspect };
  }

  const safe = sanitizeCropFraction(crop);
  const savedRatio = (safe.cropW * naturalWidth) / (safe.cropH * naturalHeight);
  if (!Number.isFinite(savedRatio) || savedRatio <= 0) {
    return { key: "orig", ratio: naturalAspect };
  }

  const presets: Array<{ key: AspectPresetKey; ratio: number }> = [
    { key: "orig", ratio: naturalAspect },
    { key: "1:1", ratio: 1 },
    { key: "4:3", ratio: 4 / 3 },
    { key: "3:4", ratio: 3 / 4 },
  ];

  let best = presets[0];
  let bestRelError = Math.abs(savedRatio - best.ratio) / best.ratio;

  for (let i = 1; i < presets.length; i++) {
    const candidate = presets[i];
    const relError = Math.abs(savedRatio - candidate.ratio) / candidate.ratio;
    // Keep "orig" when naturalAspect itself matches a preset (e.g. 3:4 phone photo) within 0.5%.
    if (best.key === "orig" && bestRelError <= 0.005 && Math.abs(relError - bestRelError) <= 0.005) {
      continue;
    }
    if (relError < bestRelError) {
      best = candidate;
      bestRelError = relError;
    }
  }

  if (bestRelError <= 0.02) {
    return { key: best.key, ratio: best.ratio };
  }

  return { key: "custom", ratio: savedRatio };
}

/**
 * Checks whether restoring `crop` inside a `containerWidth × containerHeight` stage
 * would require zooming beyond `maxZoom` (e.g. legacy corrupted `0.01 × 0.01` rows).
 */
export function doesCropExceedMaxZoom(
  crop: CropFraction,
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number,
  aspect: number,
  maxZoom = 3,
): boolean {
  if (
    naturalWidth <= 0 ||
    naturalHeight <= 0 ||
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    aspect <= 0
  ) {
    return false;
  }
  const safe = sanitizeCropFraction(crop);
  const containerAspect = containerWidth / containerHeight;
  const mediaAspect = naturalWidth / naturalHeight;
  const mediaWidth =
    containerAspect > mediaAspect ? containerHeight * mediaAspect : containerWidth;
  const mediaHeight =
    containerAspect > mediaAspect ? containerHeight : containerWidth / mediaAspect;
  const fittingWidth = Math.min(mediaWidth, containerWidth);
  const fittingHeight = Math.min(mediaHeight, containerHeight);
  const cropWidth =
    fittingWidth > fittingHeight * aspect ? fittingHeight * aspect : fittingWidth;

  const requiredZoom = cropWidth / mediaWidth / safe.cropW;
  return requiredZoom > maxZoom + 0.02;
}

/**
 * Converts a `CropFraction` (`0..1`) into validated integer pixel coordinates on
 * the original image's intrinsic `naturalWidth × naturalHeight` grid.
 */
export function cropFractionToIntrinsicPixels(
  crop: CropFraction,
  naturalWidth: number,
  naturalHeight: number,
): IntrinsicPixelCrop {
  if (
    !Number.isFinite(naturalWidth) ||
    !Number.isFinite(naturalHeight) ||
    naturalWidth < 1 ||
    naturalHeight < 1
  ) {
    throw new Error("Kích thước ảnh gốc (naturalWidth/naturalHeight) không hợp lệ.");
  }
  const safe = sanitizeCropFraction(crop);
  const maxW = Math.floor(naturalWidth);
  const maxH = Math.floor(naturalHeight);

  const x = Math.min(maxW - 1, Math.max(0, Math.round(safe.cropX * maxW)));
  const y = Math.min(maxH - 1, Math.max(0, Math.round(safe.cropY * maxH)));
  const width = Math.max(1, Math.min(maxW - x, Math.round(safe.cropW * maxW)));
  const height = Math.max(1, Math.min(maxH - y, Math.round(safe.cropH * maxH)));

  return { x, y, width, height };
}

// ---------- Cloudinary & Original URL Helpers ----------

function fmtOffset(v: number): string {
  const rounded = Math.round(v * 10000) / 10000;
  if (rounded === 0) return "0";
  return String(rounded);
}

function fmtDimension(v: number): string {
  const rounded = Math.round(v * 10000) / 10000;
  if (rounded >= 1) return "1.0";
  if (rounded <= 0) return "0.0001";
  return String(rounded);
}

/**
 * Ensures Cloudinary `c_crop` URLs explicitly include `g_north_west` so top-left
 * crops (`x_0,y_0`) never fall back to Cloudinary's default `g_center`.
 */
export function normalizeCloudinaryCropUrl(url: string): string {
  if (!url) return url;
  return url.replace("/upload/c_crop,x_", "/upload/c_crop,g_north_west,x_");
}

/** Strips any baked `c_crop` / thumbnail transform segments to recover the original upload URL. */
export function stripCloudinaryCropTransform(url: string): string {
  if (!url) return url;
  return url.replace(
    /\/upload\/c_crop,[^/]+\/(?:w_\d+,c_limit,q_auto\/)?/,
    "/upload/",
  );
}

/** Always returns the untouched original photo URL for `CropEditor` and re-cropping. */
export function getOriginalPhotoUrl(
  photo: Pick<Photo, "originalImageUrl" | "imageUrl">,
): string {
  if (photo.originalImageUrl && photo.originalImageUrl.trim().length > 0) {
    return stripCloudinaryCropTransform(photo.originalImageUrl);
  }
  return stripCloudinaryCropTransform(photo.imageUrl);
}

/**
 * Builds a Cloudinary `c_crop,g_north_west` preview URL from an untouched `originalUrl`.
 * Returns `null` if `originalUrl` is not a Cloudinary `/upload/` URL.
 */
export function buildCloudinaryCropPreviewUrl(
  originalUrl: string,
  crop: CropFraction,
  withThumbnailLimit = true,
): string | null {
  const marker = "/upload/";
  const idx = originalUrl.indexOf(marker);
  if (idx < 0) return null;
  const safe = sanitizeCropFraction(crop);
  const transform =
    `c_crop,g_north_west,x_${fmtOffset(safe.cropX)},y_${fmtOffset(safe.cropY)}` +
    `,w_${fmtDimension(safe.cropW)},h_${fmtDimension(safe.cropH)}` +
    (withThumbnailLimit ? "/w_600,c_limit,q_auto" : "");
  return (
    originalUrl.slice(0, idx) +
    marker +
    transform +
    "/" +
    originalUrl.slice(idx + marker.length)
  );
}

// ---------- Image Loading & Validated Canvas Cropped Output ----------

/**
 * Preloads an image URL to verify it decodes cleanly and obtain its exact
 * `naturalWidth` and `naturalHeight` before initializing `<Cropper>`.
 * Does not set `crossOrigin` so any CDN/browser cache entry works reliably.
 */
export function loadImageDimensions(
  src: string,
): Promise<{ naturalWidth: number; naturalHeight: number }> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Thiếu đường dẫn ảnh nguồn."));
      return;
    }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (img.naturalWidth >= 1 && img.naturalHeight >= 1) {
        resolve({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      } else {
        reject(new Error("Ảnh nguồn có kích thước không hợp lệ (0px)."));
      }
    };
    img.onerror = () => {
      reject(new Error("Không tải được ảnh nguồn để cắt."));
    };
    img.src = src;
  });
}

function loadCanvasSourceImage(
  src: string,
  useAnonymousCors: boolean,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    if (useAnonymousCors) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      if (img.naturalWidth >= 1 && img.naturalHeight >= 1) {
        resolve(img);
      } else {
        reject(new Error("Ảnh gốc có kích thước không hợp lệ."));
      }
    };
    img.onerror = () => {
      reject(new Error("Không đọc được dữ liệu ảnh gốc để tạo vùng cắt."));
    };
    img.src = src;
  });
}

function resolveOutputMimeType(requested?: string): string {
  if (requested === "image/png" || requested === "image/webp") {
    return requested;
  }
  return "image/jpeg";
}

function encodeCanvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob && blob.size > 0) {
          resolve(blob);
          return;
        }
        // Fallback to PNG if the browser could not encode the requested format.
        if (mimeType !== "image/png") {
          canvas.toBlob((fallbackBlob) => {
            if (fallbackBlob && fallbackBlob.size > 0) {
              resolve(fallbackBlob);
            } else {
              reject(new Error("Canvas xuất ra ảnh rỗng (0 byte)."));
            }
          }, "image/png");
          return;
        }
        reject(new Error("Canvas xuất ra ảnh rỗng (0 byte)."));
      },
      mimeType,
      quality,
    );
  });
}

async function verifyBlobDecodable(blob: Blob): Promise<void> {
  if (blob.size <= 0) {
    throw new Error("Ảnh sau khi cắt bị rỗng.");
  }
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    try {
      if (bitmap.width < 1 || bitmap.height < 1) {
        throw new Error("Ảnh sau khi cắt có kích thước không hợp lệ.");
      }
    } finally {
      bitmap.close();
    }
    return;
  }
  const tempUrl = URL.createObjectURL(blob);
  try {
    await loadImageDimensions(tempUrl);
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}

/**
 * Generates a cropped `Blob` from the **untouched original** `Blob`/`File` or URL
 * using HTML5 Canvas in intrinsic pixel coordinates (`naturalWidth × naturalHeight`),
 * validating source dimensions, canvas dimensions, non-empty output, and decodability.
 */
export async function createCroppedPreviewBlob(
  source: Blob | string,
  crop: CropFraction,
  options: {
    maxEdge?: number;
    mimeType?: string;
    quality?: number;
  } = {},
): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Canvas chỉ khả dụng trên trình duyệt.");
  }

  let tempSourceUrl: string | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    const srcUrl =
      typeof source === "string"
        ? source
        : ((tempSourceUrl = URL.createObjectURL(source)), tempSourceUrl);

    const isCrossOriginHttp =
      typeof source === "string" &&
      /^https?:\/\//i.test(source) &&
      (typeof window === "undefined" || !source.startsWith(window.location.origin));

    const img = await loadCanvasSourceImage(srcUrl, isCrossOriginHttp);
    const pixelCrop = cropFractionToIntrinsicPixels(
      crop,
      img.naturalWidth,
      img.naturalHeight,
    );

    const scale =
      options.maxEdge && options.maxEdge > 0
        ? Math.min(1, options.maxEdge / Math.max(pixelCrop.width, pixelCrop.height))
        : 1;

    const canvasWidth = Math.max(1, Math.round(pixelCrop.width * scale));
    const canvasHeight = Math.max(1, Math.round(pixelCrop.height * scale));
    if (
      !Number.isFinite(canvasWidth) ||
      !Number.isFinite(canvasHeight) ||
      canvasWidth < 1 ||
      canvasHeight < 1
    ) {
      throw new Error("Kích thước Canvas xuất ảnh không hợp lệ.");
    }

    canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Trình duyệt không hỗ trợ Canvas 2D.");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvasWidth,
      canvasHeight,
    );

    const inferredMime =
      options.mimeType ?? (typeof source !== "string" ? source.type : undefined);
    const outputMime = resolveOutputMimeType(inferredMime);
    const quality = options.quality ?? 0.92;

    const outputBlob = await encodeCanvasToBlob(canvas, outputMime, quality);
    await verifyBlobDecodable(outputBlob);
    return outputBlob;
  } finally {
    if (tempSourceUrl) {
      URL.revokeObjectURL(tempSourceUrl);
    }
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
}
