"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Btn, Modal } from "@/components/admin/ui";

export interface CropFraction {
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AspectOption {
  key: string;
  label: string;
  /** Resolved at runtime for the "original" option. */
  ratio: number | null;
}

/**
 * Facebook-style crop editor: zoom slider + drag-to-reposition inside a fixed
 * crop frame. Aspect presets cover the site's layouts; "Gốc" keeps the
 * uploaded ratio. The result is returned as 0..1 fractions — the backend
 * bakes a Cloudinary c_crop transform, so the original file is never touched.
 */
export function CropEditor({
  src,
  title,
  initial,
  onApply,
  onClose,
}: {
  src: string;
  title: string;
  /** Previous crop fractions — restores the editor to the saved crop. */
  initial?: CropFraction | null;
  /** null = remove the crop entirely. */
  onApply: (crop: CropFraction | null) => void;
  onClose: () => void;
}) {
  const [naturalAspect, setNaturalAspect] = useState<number>(4 / 3);
  const [aspect, setAspect] = useState<{ key: string; ratio: number | null }>({
    key: "orig",
    ratio: null,
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState<CropFraction | null>(initial ?? null);

  const onMediaLoaded = useCallback((mediaSize: { naturalWidth: number; naturalHeight: number }) => {
    if (mediaSize.naturalHeight > 0) {
      const ratio = mediaSize.naturalWidth / mediaSize.naturalHeight;
      setNaturalAspect(ratio);
      setAspect((a) => (a.key === "orig" ? { ...a, ratio } : a));
    }
  }, []);

  const onCropComplete = useCallback((_: Area, pct: Area) => {
    setResult({
      cropX: pct.x / 100,
      cropY: pct.y / 100,
      cropW: pct.width / 100,
      cropH: pct.height / 100,
    });
  }, []);

  const options: AspectOption[] = [
    { key: "orig", label: "Gốc", ratio: naturalAspect },
    { key: "1:1", label: "1:1", ratio: 1 },
    { key: "4:3", label: "4:3", ratio: 4 / 3 },
    { key: "3:4", label: "3:4", ratio: 3 / 4 },
  ];

  const activeRatio = aspect.key === "orig" ? naturalAspect : (aspect.ratio ?? naturalAspect);

  const pickAspect = (opt: AspectOption) => {
    setAspect({ key: opt.key, ratio: opt.ratio });
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const reset = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <Modal open onClose={onClose} title={title} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Tỉ lệ:</span>
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
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
          <span className="ml-auto text-xs text-gray-400">Kéo ảnh để căn chỉnh · cuộn/thanh trượt để zoom</span>
        </div>

        {/* Crop frame — fixed height so zoom/drag never reflows the modal */}
        <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-gray-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={activeRatio}
            initialCroppedAreaPercentages={
              initial
                ? { x: initial.cropX * 100, y: initial.cropY * 100, width: initial.cropW * 100, height: initial.cropH * 100 }
                : undefined
            }
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
            cropShape="rect"
            showGrid
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-green-600"
            aria-label="Phóng to"
          />
          <span className="w-10 text-right text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex flex-wrap justify-between gap-2 pt-1">
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={reset}>Đặt lại</Btn>
            {initial && (
              <Btn
                variant="danger"
                onClick={() => onApply(null)}
              >
                Bỏ cắt
              </Btn>
            )}
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={onClose}>Hủy</Btn>
            <Btn onClick={() => result && onApply(result)} disabled={!result}>Áp dụng</Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}
