import { describe, expect, it } from "vitest";
import {
  areaPercentagesToCropFraction,
  buildCloudinaryCropPreviewUrl,
  cropFractionToAreaPercentages,
  cropFractionToIntrinsicPixels,
  doesCropExceedMaxZoom,
  extractSavedCrop,
  getOriginalPhotoUrl,
  inferAspectPresetFromCrop,
  isValidCropFraction,
  normalizeCloudinaryCropUrl,
  sanitizeCropFraction,
  stripCloudinaryCropTransform,
} from "./crop";

const IMG_2755_WIDTH = 3979;
const IMG_2755_HEIGHT = 5969;

describe("lib/crop — react-easy-crop state, aspect recovery & intrinsic pixel math", () => {
  it("converts croppedAreaPercentages (1st callback arg) accurately on IMG_2755 (3979x5969) without over-zooming", () => {
    // User selects "Gốc" on IMG_2755 (3979x5969), zooms to 1.6x, and pans slightly:
    // react-easy-crop emits croppedArea (1st arg, percentages):
    const croppedAreaPct = {
      x: 12.5,
      y: 18.75,
      width: 62.5,
      height: 62.5,
    };

    const fraction = areaPercentagesToCropFraction(croppedAreaPct);
    expect(fraction).toEqual({
      cropX: 0.125,
      cropY: 0.1875,
      cropW: 0.625,
      cropH: 0.625,
    });

    // Intrinsic pixel output matches exact region on 3979x5969 source:
    const pixels = cropFractionToIntrinsicPixels(fraction, IMG_2755_WIDTH, IMG_2755_HEIGHT);
    expect(pixels).toEqual({
      x: Math.round(0.125 * IMG_2755_WIDTH),
      y: Math.round(0.1875 * IMG_2755_HEIGHT),
      width: Math.round(0.625 * IMG_2755_WIDTH),
      height: Math.round(0.625 * IMG_2755_HEIGHT),
    });
  });

  it("is strictly idempotent across 20 save -> restore -> apply round-trips (zero drift)", () => {
    const initial = {
      cropX: 0.142857,
      cropY: 0.218345,
      cropW: 0.555556,
      cropH: 0.555556,
    };

    let current = initial;
    for (let i = 0; i < 20; i++) {
      const pct = cropFractionToAreaPercentages(current);
      current = areaPercentagesToCropFraction(pct);
    }

    expect(current).toEqual(initial);
  });

  it("recovers exact aspect presets (Gốc, 1:1, 4:3, 3:4) on portrait IMG_2755 (3979x5969)", () => {
    // 1. "Gốc" (zoomed 1.5x -> cropW = cropH = 0.666667)
    const origCrop = { cropX: 0.1, cropY: 0.15, cropW: 0.666667, cropH: 0.666667 };
    const origResolved = inferAspectPresetFromCrop(origCrop, IMG_2755_WIDTH, IMG_2755_HEIGHT);
    expect(origResolved.key).toBe("orig");
    expect(origResolved.ratio).toBeCloseTo(IMG_2755_WIDTH / IMG_2755_HEIGHT, 6);

    // 2. "1:1" square crop on portrait 2:3 image: full width (cropW=1), cropH = 3979/5969
    const squareCrop = {
      cropX: 0,
      cropY: 0.2,
      cropW: 1,
      cropH: round6(IMG_2755_WIDTH / IMG_2755_HEIGHT),
    };
    const squareResolved = inferAspectPresetFromCrop(squareCrop, IMG_2755_WIDTH, IMG_2755_HEIGHT);
    expect(squareResolved).toEqual({ key: "1:1", ratio: 1 });

    // 3. "4:3" landscape crop on portrait 2:3 image: cropW=0.8, cropH = (0.8 * 3979) / (4/3 * 5969)
    const fourThreeCrop = {
      cropX: 0.1,
      cropY: 0.3,
      cropW: 0.8,
      cropH: round6((0.8 * IMG_2755_WIDTH) / ((4 / 3) * IMG_2755_HEIGHT)),
    };
    const fourThreeResolved = inferAspectPresetFromCrop(
      fourThreeCrop,
      IMG_2755_WIDTH,
      IMG_2755_HEIGHT,
    );
    expect(fourThreeResolved.key).toBe("4:3");
    expect(fourThreeResolved.ratio).toBeCloseTo(4 / 3, 6);

    // 4. "3:4" portrait crop on portrait 2:3 image: cropW=0.9, cropH = (0.9 * 3979) / (0.75 * 5969)
    const threeFourCrop = {
      cropX: 0.05,
      cropY: 0.1,
      cropW: 0.9,
      cropH: round6((0.9 * IMG_2755_WIDTH) / (0.75 * IMG_2755_HEIGHT)),
    };
    const threeFourResolved = inferAspectPresetFromCrop(
      threeFourCrop,
      IMG_2755_WIDTH,
      IMG_2755_HEIGHT,
    );
    expect(threeFourResolved).toEqual({ key: "3:4", ratio: 3 / 4 });
  });

  it("recovers exact aspect presets on high-res landscape DSLR image (6000x4000)", () => {
    const W = 6000;
    const H = 4000;

    expect(inferAspectPresetFromCrop(null, W, H)).toEqual({ key: "orig", ratio: 1.5 });

    const square = { cropX: 0.2, cropY: 0, cropW: round6(4000 / 6000), cropH: 1 };
    expect(inferAspectPresetFromCrop(square, W, H)).toEqual({ key: "1:1", ratio: 1 });

    const portrait34 = { cropX: 0.25, cropY: 0, cropW: 0.5, cropH: 1 }; // (0.5*6000)/(1*4000) = 0.75
    expect(inferAspectPresetFromCrop(portrait34, W, H)).toEqual({ key: "3:4", ratio: 3 / 4 });
  });

  it("clamps sub-pixel DOM overshoots and rejects invalid dimensions or fractions", () => {
    const clamped = sanitizeCropFraction({
      cropX: -0.002,
      cropY: 0,
      cropW: 1.003,
      cropH: 1.001,
    });
    expect(clamped).toEqual({ cropX: 0, cropY: 0, cropW: 1, cropH: 1 });

    const fullPixels = cropFractionToIntrinsicPixels(clamped, IMG_2755_WIDTH, IMG_2755_HEIGHT);
    expect(fullPixels).toEqual({
      x: 0,
      y: 0,
      width: IMG_2755_WIDTH,
      height: IMG_2755_HEIGHT,
    });

    expect(isValidCropFraction({ cropX: 0, cropY: 0, cropW: 0, cropH: 0.5 })).toBe(false);
    expect(isValidCropFraction({ cropX: NaN, cropY: 0, cropW: 0.5, cropH: 0.5 })).toBe(false);
    expect(() =>
      cropFractionToIntrinsicPixels({ cropX: 0, cropY: 0, cropW: 1, cropH: 1 }, 0, 500),
    ).toThrow();
  });

  it("detects when a legacy corrupted crop (0.01x0.01) exceeds maxZoom=3 while allowing valid 1..3x crops", () => {
    const valid3x = { cropX: 0.2, cropY: 0.2, cropW: 0.333333, cropH: 0.333333 };
    expect(
      doesCropExceedMaxZoom(
        valid3x,
        IMG_2755_WIDTH,
        IMG_2755_HEIGHT,
        720,
        420,
        IMG_2755_WIDTH / IMG_2755_HEIGHT,
        3,
      ),
    ).toBe(false);

    const legacyCorrupted100x = { cropX: 0.99, cropY: 0.99, cropW: 0.01, cropH: 0.01 };
    expect(
      doesCropExceedMaxZoom(
        legacyCorrupted100x,
        IMG_2755_WIDTH,
        IMG_2755_HEIGHT,
        720,
        420,
        1,
        3,
      ),
    ).toBe(true);
  });

  it("normalizes Cloudinary c_crop URLs with g_north_west and recovers untouched original URLs", () => {
    const legacyUrl =
      "https://res.cloudinary.com/demo/image/upload/c_crop,x_0,y_0,w_0.5,h_0.5/v1/portfolio/sample.jpg";
    expect(normalizeCloudinaryCropUrl(legacyUrl)).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_crop,g_north_west,x_0,y_0,w_0.5,h_0.5/v1/portfolio/sample.jpg",
    );

    expect(stripCloudinaryCropTransform(legacyUrl)).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1/portfolio/sample.jpg",
    );

    expect(
      getOriginalPhotoUrl({
        originalImageUrl: null,
        imageUrl:
          "https://res.cloudinary.com/demo/image/upload/c_crop,g_north_west,x_0.1,y_0.2,w_0.6,h_0.6/w_600,c_limit,q_auto/v1/portfolio/sample.jpg",
      }),
    ).toBe("https://res.cloudinary.com/demo/image/upload/v1/portfolio/sample.jpg");

    const preview = buildCloudinaryCropPreviewUrl(
      "https://res.cloudinary.com/demo/image/upload/v1/portfolio/sample.jpg",
      { cropX: 0, cropY: 0.25, cropW: 1, cropH: 0.5 },
    );
    expect(preview).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_crop,g_north_west,x_0,y_0.25,w_1.0,h_0.5/w_600,c_limit,q_auto/v1/portfolio/sample.jpg",
    );

    expect(
      extractSavedCrop({ cropX: 0.1, cropY: 0.2, cropW: 0.5, cropH: 0.6 }),
    ).toEqual({ cropX: 0.1, cropY: 0.2, cropW: 0.5, cropH: 0.6 });
    expect(extractSavedCrop({ cropX: null, cropY: 0.2, cropW: 0.5, cropH: 0.6 })).toBeNull();
  });
});

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}
