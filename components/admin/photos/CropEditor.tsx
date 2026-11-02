"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Btn, Modal, Spinner } from "@/components/admin/ui";
import {
  areaPercentagesToCropFraction,
  cropFractionToAreaPercentages,
  doesCropExceedMaxZoom,
  inferAspectPresetFromCrop,
  isValidCropFraction,
  loadImageDimensions,
  sanitizeCropFraction,
  type AspectPresetKey,
  type CropAreaPercentages,
  type CropFraction,
  type ResolvedAspect,
} from "@/lib/crop";

export type { CropFraction } from "@/lib/crop";

interface AspectOption {
  key: AspectPresetKey;
  label: string;
  ratio: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * Interactive image cropper modal powered by `react-easy-crop`.
 *
 * Separates:
 * - Original image (`src` — untouched full-resolution file/URL)
 * - Crop interaction state (`crop`, `zoom`, `aspect` inside the modal session)
 * - Persisted crop state (`CropFraction` `0..1` percentages via `initial` / `onApply`)
 */
export function CropEditor(props: {
  src: string;
  title: string;
  /** Previous crop fractions — restores the editor to the saved crop. */
  initial?: CropFraction | null;
  /** `null` = remove the crop entirely. May return a Promise while validating Canvas output. */
  onApply: (crop: CropFraction | null) => void | Promise<void>;
  onClose: () => void;
}) {
  // Key by `src` so switching images never inherits state from a previous image.
  return <CropEditorModal key={props.src} {...props} />;
}

function CropEditorModal({
  src,
  title,
  initial,
  onApply,
  onClose,
}: {
  src: string;
  title: string;
  initial?: CropFraction | null;
  onApply: (crop: CropFraction | null) => void | Promise<void>;
  onClose: () => void;
}) {
  const sanitizedInitial = useMemo<CropFraction | null>(() => {
    if (!initial || !isValidCropFraction(initial)) return null;
    return sanitizeCropFraction(initial);
  }, [initial]);

  const [mediaState, setMediaState] = useState<
    | { status: "loading" }
    | { status: "ready"; naturalWidth: number; naturalHeight: number }
    | { status: "error"; message: string }
  >({ status: "loading" });

  const [resetNonce, setResetNonce] = useState(0);
  const [useInitialRestore, setUseInitialRestore] = useState(true);

  // Preload original image intrinsic dimensions before mounting <Cropper>
  // so `aspect` is 100% resolved before `react-easy-crop`'s `setInitialCrop` runs.
  useEffect(() => {
    let cancelled = false;
    loadImageDimensions(src)
      .then(({ naturalWidth, naturalHeight }) => {
        if (!cancelled) {
          setMediaState({ status: "ready", naturalWidth, naturalHeight });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMediaState({
            status: "error",
            message:
              err instanceof Error
                ? err.message
                : "Không tải được ảnh nguồn để cắt.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const handleReset = useCallback(() => {
    setUseInitialRestore(false);
    setResetNonce((n) => n + 1);
  }, []);

  return (
    <Modal open onClose={onClose} title={title} wide>
      {mediaState.status === "ready" ? (
        <CropEditorSession
          key={resetNonce}
          src={src}
          naturalWidth={mediaState.naturalWidth}
          naturalHeight={mediaState.naturalHeight}
          initialCrop={useInitialRestore ? sanitizedInitial : null}
          canClearCrop={Boolean(sanitizedInitial)}
          onReset={handleReset}
          onApply={onApply}
          onClose={onClose}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tỉ lệ:
            </span>
            {["Gốc", "1:1", "4:3", "3:4"].map((label) => (
              <button
                key={label}
                type="button"
                disabled
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-400"
              >
                {label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              Kéo ảnh để căn chỉnh · cuộn/thanh trượt để zoom
            </span>
          </div>

          <div className="relative flex h-[420px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-4 text-center">
            {mediaState.status === "loading" ? (
              <>
                <Spinner />
                <span className="text-xs text-gray-300">Đang tải ảnh gốc…</span>
              </>
            ) : (
              <p className="text-sm text-red-300">{mediaState.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Zoom
            </span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={1}
              disabled
              className="flex-1 accent-green-600 opacity-50"
              aria-label="Phóng to"
            />
            <span className="w-10 text-right text-xs text-gray-400">100%</span>
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-1">
            <div className="flex gap-2">
              <Btn variant="ghost" disabled>
                Đặt lại
              </Btn>
              {sanitizedInitial && (
                <Btn variant="danger" onClick={() => void onApply(null)}>
                  Bỏ cắt
                </Btn>
              )}
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" onClick={onClose}>
                Hủy
              </Btn>
              <Btn disabled>Áp dụng</Btn>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function CropEditorSession({
  src,
  naturalWidth,
  naturalHeight,
  initialCrop,
  canClearCrop,
  onReset,
  onApply,
  onClose,
}: {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  initialCrop: CropFraction | null;
  canClearCrop: boolean;
  onReset: () => void;
  onApply: (crop: CropFraction | null) => void | Promise<void>;
  onClose: () => void;
}) {
  const naturalAspect = naturalWidth / naturalHeight;

  const initialResolvedAspect = useMemo<ResolvedAspect>(
    () => inferAspectPresetFromCrop(initialCrop, naturalWidth, naturalHeight),
    [initialCrop, naturalWidth, naturalHeight],
  );

  const [aspect, setAspect] = useState<ResolvedAspect>(initialResolvedAspect);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState<CropFraction | null>(initialCrop);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number } | null>(null);

  // Prevents `react-easy-crop`'s initial pre-restore `emitCropData()` call on mount
  // from overwriting `initialCrop` and guarantees 0-drift idempotency when the user
  // reopens the modal and clicks "Áp dụng" without making any adjustments.
  const hasInteractedRef = useRef(initialCrop == null);

  // Ensure the stage container has stable, non-zero pixel dimensions before mounting <Cropper>.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const updateSize = (width: number, height: number) => {
      if (width > 0 && height > 0) {
        setStageSize((prev) =>
          prev && Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5
            ? prev
            : { width, height },
        );
      }
    };

    const measureNow = () => {
      const rect = el.getBoundingClientRect();
      updateSize(rect.width || el.clientWidth, rect.height || el.clientHeight);
    };

    rafId = window.requestAnimationFrame(measureNow);

    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          updateSize(entry.contentRect.width, entry.contentRect.height);
        } else {
          measureNow();
        }
      });
      observer.observe(el);
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);

  const initialExceedsMaxZoom = useMemo(() => {
    if (!initialCrop || !stageSize) return false;
    return doesCropExceedMaxZoom(
      initialCrop,
      naturalWidth,
      naturalHeight,
      stageSize.width,
      stageSize.height,
      initialResolvedAspect.ratio,
      MAX_ZOOM,
    );
  }, [initialCrop, stageSize, naturalWidth, naturalHeight, initialResolvedAspect.ratio]);

  const initialPercentages = useMemo<CropAreaPercentages | undefined>(
    () => (initialCrop ? cropFractionToAreaPercentages(initialCrop) : undefined),
    [initialCrop],
  );

  const handleCropAreaUpdate = useCallback(
    (croppedAreaPercentages: CropAreaPercentages) => {
      // IMPORTANT: `croppedAreaPercentages` is the 1st argument (0..100%) from `react-easy-crop`.
      // Never read the 2nd argument (`croppedAreaPixels`).
      if (!hasInteractedRef.current && !initialExceedsMaxZoom) {
        return;
      }
      try {
        const nextFraction = areaPercentagesToCropFraction(croppedAreaPercentages);
        setResult(nextFraction);
      } catch {
        // Ignore transient invalid boxes if container is mid-unmount.
      }
    },
    [initialExceedsMaxZoom],
  );

  const markInteracted = useCallback(() => {
    hasInteractedRef.current = true;
    setApplyError(null);
  }, []);

  const options: AspectOption[] = [
    { key: "orig", label: "Gốc", ratio: naturalAspect },
    { key: "1:1", label: "1:1", ratio: 1 },
    { key: "4:3", label: "4:3", ratio: 4 / 3 },
    { key: "3:4", label: "3:4", ratio: 3 / 4 },
  ];

  const activeRatio = aspect.key === "orig" ? naturalAspect : aspect.ratio;

  const pickAspect = (opt: AspectOption) => {
    markInteracted();
    setAspect({ key: opt.key, ratio: opt.ratio });
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const submitCrop = async (nextCrop: CropFraction | null) => {
    if (applying) return;
    setApplying(true);
    setApplyError(null);
    try {
      await onApply(nextCrop);
    } catch (err: unknown) {
      setApplyError(
        err instanceof Error
          ? err.message
          : "Không tạo được ảnh sau khi cắt. Vui lòng thử lại.",
      );
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      {applyError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {applyError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tỉ lệ:
        </span>
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            disabled={applying}
            onClick={() => pickAspect(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              aspect.key === opt.key
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          Kéo ảnh để căn chỉnh · cuộn/thanh trượt để zoom
        </span>
      </div>

      {/* Crop frame — fixed height so zoom/drag never reflows the modal */}
      <div
        ref={stageRef}
        className="relative h-[420px] w-full touch-none overflow-hidden rounded-xl bg-gray-900"
      >
        {stageSize ? (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            aspect={activeRatio}
            initialCroppedAreaPercentages={initialPercentages}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onInteractionStart={markInteracted}
            onCropAreaChange={handleCropAreaUpdate}
            onCropComplete={handleCropAreaUpdate}
            cropShape="rect"
            showGrid
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Zoom
        </span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          disabled={applying || !stageSize}
          onChange={(e) => {
            markInteracted();
            setZoom(Number(e.target.value));
          }}
          className="flex-1 accent-green-600"
          aria-label="Phóng to"
        />
        <span className="w-10 text-right text-xs text-gray-500">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div className="flex flex-wrap justify-between gap-2 pt-1">
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onReset} disabled={applying}>
            Đặt lại
          </Btn>
          {canClearCrop && (
            <Btn
              variant="danger"
              disabled={applying}
              onClick={() => void submitCrop(null)}
            >
              Bỏ cắt
            </Btn>
          )}
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onClose} disabled={applying}>
            Hủy
          </Btn>
          <Btn
            onClick={() => result && void submitCrop(result)}
            disabled={!result || applying || !stageSize}
          >
            {applying ? "Đang áp dụng…" : "Áp dụng"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
