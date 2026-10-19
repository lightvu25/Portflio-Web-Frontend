"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminCategories } from "@/lib/api/categories";
import { ApiError, describeApiError } from "@/lib/api/client";
import { bulkUpdatePhotoCategories, deletePhoto, getAdminPhotos, publishPhoto, reorderPhotos, unpublishPhoto, updatePhoto, uploadPhoto } from "@/lib/api/photos";
import { useAdmin } from "@/lib/auth/useAdmin";
import { categoryLabel, formatDate, isAdminCategory } from "@/lib/labels";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";
import { CropEditor, type CropFraction } from "@/components/admin/photos/CropEditor";
import { Badge, Btn, Card, EmptyState, inputCls, labelCls, Modal, Spinner } from "@/components/admin/ui";

type UploadState = "pending" | "uploading" | "done" | "error";

interface PendingFile {
  key: string;
  file: File;
  /** Small canvas-generated blob URL — null until ready or when undecodable. */
  preview: string | null;
  title: string;
  sortOrder: number;
  categoryIds: number[];
  /** Optional crop (0..1 fractions) applied by the backend after upload. */
  crop: CropFraction | null;
  state: UploadState;
  error?: string;
}

const uploadStateText: Record<UploadState, string> = {
  pending: "Chờ tải lên",
  uploading: "Đang tải lên…",
  done: "Đã tải lên",
  error: "Lỗi tải lên",
};

const PREVIEW_EDGE = 960;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/avif";

/**
 * Builds a small preview blob URL. Decoding a 40MP file into a <img> at
 * object-URL resolution is what made batch selection lag/OOM the tab —
 * instead we decode once, scale to ≤960px, encode as JPEG and release the
 * original bitmap immediately.
 */
async function makePreviewUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, PREVIEW_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unsupported");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("preview encode failed");
    return URL.createObjectURL(blob);
  } finally {
    bitmap.close();
  }
}

/** Photos admin — multi-select upload → per-file metadata → visual grid. */
export function AdminPhotosPage() {
  const { token, ready, onApiError } = useAdmin();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  /** Slot in the list (excluding the dragged card) where a drop will insert. */
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  /** Absolute position of the thin insertion bar inside the grid. */
  const [indicator, setIndicator] = useState<{ left: number; top: number; height: number } | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  /** Category id filter for the grid (reorder is global — disabled while filtered). */
  const [catFilter, setCatFilter] = useState<number | null>(null);
  /** Multi-select for bulk category editing. */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkMsg, setBulkMsg] = useState<{ ok: boolean; text: string } | null>(null);
  /** Pending-file key whose crop editor is open. */
  const [cropKey, setCropKey] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // Mirror of `pending` for unmount cleanup.
  const pendingRef = useRef<PendingFile[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const load = async (t: string) => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getAdminPhotos(t), getAdminCategories(t)]);
      setPhotos(p);
      setCategories(c);
      setError(null);
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được danh sách ảnh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && token) queueMicrotask(() => load(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  // Revoke all object URLs when the page unmounts.
  useEffect(
    () => () => {
      pendingRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
    },
    [],
  );

  // ---------- Upload flow ----------
  const pickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const items: PendingFile[] = Array.from(files).map((file, i) => ({
      key: `${file.name}-${Date.now()}-${i}`,
      file,
      preview: null,
      title: file.name.replace(/\.[^.]+$/, ""),
      sortOrder: photos.length + pending.length + i + 1,
      categoryIds: [],
      crop: null,
      state: file.type.startsWith("image/") ? "pending" : "error",
      error: file.type.startsWith("image/") ? undefined : "Định dạng không được hỗ trợ — chỉ nhận JPEG/PNG/WebP/AVIF.",
    }));
    setPending((prev) => [...prev, ...items]);
    // Generate previews sequentially so big files decode one at a time.
    for (const item of items) {
      if (item.state === "error") continue;
      makePreviewUrl(item.file)
        .then((preview) => patchPending(item.key, { preview }))
        .catch(() =>
          patchPending(item.key, {
            state: "error",
            error: "Không đọc được định dạng ảnh này (HEIC/RAW?) — hãy xuất sang JPEG/PNG.",
          }),
        );
    }
  };

  const patchPending = (key: string, patch: Partial<PendingFile>) =>
    setPending((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  /**
   * Reserved-Admin exclusivity in the UI (the backend also enforces it):
   * picking Admin keeps ONLY Admin; picking another category while Admin is
   * selected drops Admin. Never produces a mixed selection.
   */
  const toggleCatExclusive = (current: number[], catId: number): number[] => {
    const adminId = categories.find(isAdminCategory)?.id;
    if (catId === adminId) return current.includes(catId) ? [] : [catId];
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current.filter((c) => c !== adminId), catId];
    return next;
  };

  const toggleCat = (key: string, catId: number) =>
    setPending((prev) =>
      prev.map((p) =>
        p.key === key ? { ...p, categoryIds: toggleCatExclusive(p.categoryIds, catId) } : p,
      ),
    );

  const removePending = (key: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.key !== key);
    });
  };

  const uploadOne = async (item: PendingFile) => {
    if (!token) return;
    patchPending(item.key, { state: "uploading", error: undefined });
    try {
      await uploadPhoto(token, item.file, {
        title: item.title,
        sortOrder: item.sortOrder,
        categoryIds: item.categoryIds,
        crop: item.crop ?? undefined,
      });
      patchPending(item.key, { state: "done" });
    } catch (err) {
      patchPending(item.key, { state: "error", error: describeApiError(err) });
      onApiError(err);
    }
  };

  /** Sequential upload — one large file at a time keeps the UI responsive. */
  const uploadAll = async () => {
    if (!token || uploading) return;
    setUploading(true);
    for (const item of pending) {
      if (item.state === "done") continue;
      await uploadOne(item);
    }
    setUploading(false);
    // Remove finished cards (revoking their preview URLs) once per batch.
    setPending((prev) => {
      prev.forEach((p) => p.state === "done" && p.preview && URL.revokeObjectURL(p.preview));
      return prev.filter((p) => p.state !== "done");
    });
    if (token) load(token);
  };

  const retryOne = (key: string) => {
    const item = pending.find((p) => p.key === key);
    if (item && item.state === "error") uploadOne(item);
  };

  // ---------- Photo actions ----------
  const act = async (fn: () => Promise<unknown>, errMsg: string) => {
    if (!token) return;
    try {
      await fn();
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert(errMsg);
    }
  };

  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  const visiblePhotos = catFilter == null ? sorted : sorted.filter((p) => p.categories.some((c) => c.id === catFilter));

  // ---------- Bulk selection ----------
  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAllVisible = () => setSelected(new Set(visiblePhotos.map((p) => p.id)));
  const clearSelection = () => setSelected(new Set());
  const selectedCount = selected.size;
  const adminCat = categories.find(isAdminCategory);
  /** Selected photos that currently sit in the reserved Admin category. */
  const selectedAdminPhotos = photos.filter(
    (p) => selected.has(p.id) && p.categories.some(isAdminCategory),
  );

  const applyBulk = async (add: number[], remove: number[]) => {
    if (!token || selectedCount === 0 || bulkBusy) return;
    const photoIds = [...selected];
    const verb = [
      add.length ? `gán ${add.length} danh mục` : "",
      remove.length ? `bỏ ${remove.length} danh mục` : "",
    ].filter(Boolean).join(" và ");
    if (!window.confirm(`${verb} cho ${photoIds.length} ảnh đã chọn?`)) return;
    setBulkBusy(true);
    setBulkMsg(null);
    try {
      await bulkUpdatePhotoCategories(token, {
        photoIds,
        addCategoryIds: add.length ? add : undefined,
        removeCategoryIds: remove.length ? remove : undefined,
      });
      setBulkMsg({ ok: true, text: `Đã cập nhật danh mục cho ${photoIds.length} ảnh.` });
      setBulkOpen(false);
      clearSelection();
      await load(token);
    } catch (err) {
      const text = err instanceof ApiError ? err.message : "Cập nhật danh mục thất bại.";
      setBulkMsg({ ok: false, text });
      onApiError(err);
    } finally {
      setBulkBusy(false);
    }
  };
  /** Cards without the dragged one — the insertion index addresses this list. */
  const others = dragId == null ? sorted : sorted.filter((p) => p.id !== dragId);
  const othersIndex = new Map(others.map((p, i) => [p.id, i]));

  // ---------- Insertion-based drag-to-reorder ----------
  // IMPORTANT: the dragged card must STAY in the DOM — removing it mid-drag
  // makes Chrome abort the drag session (the gap rendered but drop never fired).
  const startDrag = (e: React.DragEvent, photo: Photo) => {
    if (savingOrder) {
      e.preventDefault();
      return;
    }
    setDragId(photo.id);
    const card = (e.currentTarget as HTMLElement).closest("article");
    const cardRect = card?.getBoundingClientRect();
    if (card && cardRect) {
      // Use the whole card as the drag ghost, anchored where the handle was grabbed.
      e.dataTransfer.setDragImage(card, e.clientX - cardRect.left, e.clientY - cardRect.top);
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(photo.id));
    // Indicator starts at the card's own slot.
    setInsertIndex(othersIndex.get(photo.id) ?? 0);
    if (cardRect && gridRef.current) {
      const cr = gridRef.current.getBoundingClientRect();
      setIndicator({ left: cardRect.left - cr.left - 10, top: cardRect.top - cr.top, height: cardRect.height });
    }
  };

  const endDrag = () => {
    setDragId(null);
    setInsertIndex(null);
    setIndicator(null);
  };

  /** Pointer over card: left half = insert before it, right half = after it. */
  const overCard = (e: React.DragEvent, photo: Photo) => {
    if (dragId == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const j = othersIndex.get(photo.id);
    if (j == null) return; // hovering the dragged card's own slot — keep indicator
    const rect = e.currentTarget.getBoundingClientRect();
    const before = e.clientX < rect.left + rect.width / 2;
    setInsertIndex(before ? j : j + 1);
    if (gridRef.current) {
      const cr = gridRef.current.getBoundingClientRect();
      // Bar sits mid-gap between cards (gap-4 = 16px).
      const x = before ? rect.left - cr.left - 10 : rect.right - cr.left + 6;
      setIndicator({ left: x, top: rect.top - cr.top, height: rect.height });
    }
  };

  /** One persistence request — the final order, atomically. */
  const commitReorder = async () => {
    const id = dragId;
    const idx = insertIndex;
    endDrag();
    if (!token || id == null || idx == null) return;

    const ids = others.map((p) => p.id);
    ids.splice(Math.min(idx, ids.length), 0, id);
    if (ids.join() === sorted.map((p) => p.id).join()) return; // order unchanged

    const prev = photos; // last confirmed order — rollback target
    setPhotos(ids.map((pid, i) => ({ ...prev.find((x) => x.id === pid)!, sortOrder: i + 1 })));
    setSavingOrder(true);
    setOrderError(null);
    try {
      const saved = await reorderPhotos(token, ids.map((pid, i) => ({ id: pid, sortOrder: i + 1 })));
      setPhotos(saved); // confirmed order from the DB
    } catch (err) {
      setPhotos(prev);
      if (!onApiError(err)) setOrderError("Không thể lưu thứ tự ảnh. Vui lòng thử lại.");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Tải ảnh lên</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Chọn nhiều ảnh — nhập tiêu đề, danh mục, thứ tự rồi tải lên (mặc định là Bản nháp).
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={(e) => {
                pickFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Btn variant="ghost" onClick={() => fileInput.current?.click()}>
              Chọn ảnh
            </Btn>
            {pending.length > 0 && (
              <Btn onClick={uploadAll} disabled={uploading}>
                {uploading ? "Đang tải lên…" : `Tải lên ${pending.filter((p) => p.state !== "done").length} ảnh`}
              </Btn>
            )}
          </div>
        </div>

        {pending.length > 0 && (
          <>
          <p className="mt-4 text-sm text-gray-500">
            Đã tải lên {pending.filter((p) => p.state === "done").length} / {pending.length} ảnh
            {pending.some((p) => p.state === "error") &&
              ` · ${pending.filter((p) => p.state === "error").length} lỗi`}
            {pending.find((p) => p.state === "uploading") &&
              ` · Đang tải: ${pending.find((p) => p.state === "uploading")!.file.name}`}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pending.map((p) => (
              <div key={p.key} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200">
                  {p.preview ? (
                    p.crop ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                      <img
                        src={p.preview}
                        alt={p.title}
                        className="absolute"
                        style={{
                          left: `${(-p.crop.cropX / p.crop.cropW) * 100}%`,
                          top: `${(-p.crop.cropY / p.crop.cropH) * 100}%`,
                          width: `${100 / p.crop.cropW}%`,
                          height: `${100 / p.crop.cropH}%`,
                        }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                      <img src={p.preview} alt={p.title} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      {p.state === "error" ? "Không xem trước được" : "Đang tạo xem trước…"}
                    </div>
                  )}
                  {p.crop && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                      Đã cắt
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePending(p.key)}
                    aria-label="Bỏ ảnh"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    ✕
                  </button>
                  {p.preview && (
                    <button
                      type="button"
                      onClick={() => setCropKey(p.key)}
                      className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-black/75"
                    >
                      {p.crop ? "Sửa vùng cắt" : "Cắt ảnh"}
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  <input
                    className={inputCls}
                    value={p.title}
                    onChange={(e) => patchPending(p.key, { title: e.target.value })}
                    placeholder="Tiêu đề"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCat(p.key, c.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          p.categoryIds.includes(c.id)
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {categoryLabel(c)}
                      </button>
                    ))}
                  </div>
                  {adminCat && p.categoryIds.includes(adminCat.id) && (
                    <p className="text-[11px] text-amber-600">
                      Danh mục Admin chỉ dành cho ảnh giới thiệu — không gán cùng danh mục khác.
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Thứ tự</label>
                    <input
                      type="number"
                      min={0}
                      className={`${inputCls} w-24`}
                      value={p.sortOrder}
                      onChange={(e) => patchPending(p.key, { sortOrder: Number(e.target.value) })}
                    />
                    <span
                      className={`ml-auto text-xs font-medium ${
                        p.state === "done" ? "text-green-600" : p.state === "error" ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      {uploadStateText[p.state]}
                    </span>
                  </div>
                  {p.error && <p className="break-words text-xs text-red-500">{p.error}</p>}
                  {p.state === "error" && (
                    <button
                      type="button"
                      onClick={() => retryOne(p.key)}
                      className="text-xs font-semibold text-green-600 hover:text-green-700"
                    >
                      Thử lại
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </Card>

      {/* Grid */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Thư viện ảnh ({photos.length})
            <span className="ml-2 text-xs font-normal text-gray-400">
              {savingOrder ? "Đang lưu thứ tự…" : "Kéo thả để sắp xếp"}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <select
              className={`${inputCls} w-44`}
              value={catFilter ?? ""}
              onChange={(e) => setCatFilter(e.target.value === "" ? null : Number(e.target.value))}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            <Btn variant="ghost" onClick={() => token && load(token)}>Làm mới</Btn>
          </div>
        </div>

        {/* Bulk-selection toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
          <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={selectAllVisible}>
            Chọn tất cả
          </Btn>
          <Btn
            variant="ghost"
            className="px-2.5 py-1 text-xs"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            Bỏ chọn
          </Btn>
          <span className="text-xs text-gray-500">
            {selectedCount > 0 ? `Đã chọn ${selectedCount} ảnh` : "Chưa chọn ảnh nào"}
          </span>
          <Btn
            className="ml-auto px-3 py-1 text-xs"
            disabled={selectedCount === 0}
            onClick={() => setBulkOpen(true)}
          >
            Chỉnh danh mục ({selectedCount})
          </Btn>
        </div>
        {bulkMsg && (
          <p className={`mb-4 rounded-[10px] px-4 py-3 text-sm ${bulkMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {bulkMsg.text}
          </p>
        )}
        {orderError && (
          <p className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-sm text-red-600">{orderError}</p>
        )}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : visiblePhotos.length === 0 ? (
          <EmptyState title="Chưa có ảnh nào" hint="Chọn ảnh ở trên để tải lên." />
        ) : (
          <div
            ref={gridRef}
            className="relative grid grid-cols-2 items-stretch gap-4 md:grid-cols-3 xl:grid-cols-4"
            onDragOver={(e) => dragId != null && e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              commitReorder();
            }}
          >
            {/* Thin insertion bar — positioned between cards, never changes layout */}
            {dragId != null && indicator && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-10 w-1 rounded-full bg-green-500"
                style={{ left: indicator.left, top: indicator.top, height: indicator.height }}
              />
            )}
            {visiblePhotos.map((p) => (
              <article
                key={p.id}
                onDragOver={(e) => overCard(e, p)}
                className={`flex flex-col overflow-hidden rounded-xl border bg-white transition ${
                  dragId === p.id
                    ? "border-dashed border-green-400 opacity-40"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail URL */}
                  <img src={p.thumbnailUrl ?? p.imageUrl} alt={p.altText ?? p.title ?? "Ảnh"} className="h-full w-full object-cover" draggable={false} />
                  <div className="absolute left-2 top-2">
                    <Badge color={p.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                      {p.status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={selected.has(p.id)}
                    aria-label={selected.has(p.id) ? "Bỏ chọn ảnh" : "Chọn ảnh"}
                    onClick={() => toggleSelect(p.id)}
                    className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                      selected.has(p.id)
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-300 bg-white/80 text-transparent hover:border-green-500"
                    }`}
                  >
                    ✓
                  </button>
                  {p.isFeatured && (
                    <div className="absolute right-2 top-9">
                      <Badge color="bg-green-100 text-green-700">Nổi bật</Badge>
                    </div>
                  )}
                  {selected.has(p.id) && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-green-500" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="h-5 truncate text-sm font-semibold text-gray-800">{p.title || "(không tiêu đề)"}</p>
                  <div className="mt-1 flex h-[22px] flex-nowrap gap-1 overflow-hidden">
                    {p.categories.map((c) => (
                      <span key={c.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {categoryLabel(c)}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 flex items-center text-[11px] text-gray-400">
                    Thứ tự: {p.sortOrder} · {formatDate(p.createdAt)}
                    {/* Drag handle — the ONLY element that starts a drag */}
                    <span
                      draggable={!savingOrder && catFilter == null}
                      onDragStart={(e) => startDrag(e, p)}
                      onDragEnd={endDrag}
                      title="Kéo để sắp xếp"
                      className="ml-auto inline-flex cursor-grab items-center justify-center rounded-md px-1.5 py-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
                    >
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
                        {[0, 5, 10].map((y) =>
                          [3, 7].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y + 2} r="1.4" />),
                        )}
                      </svg>
                    </span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => setEditing(p)}>
                      Sửa
                    </Btn>
                    {p.status === "DRAFT" ? (
                      <Btn variant="success" className="px-2.5 py-1 text-xs" onClick={() => act(() => publishPhoto(token!, p.id), "Xuất bản thất bại")}>
                        Xuất bản
                      </Btn>
                    ) : (
                      <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => act(() => unpublishPhoto(token!, p.id), "Ẩn ảnh thất bại")}>
                        Ẩn
                      </Btn>
                    )}
                    <Btn
                      variant="danger"
                      className="px-2.5 py-1 text-xs"
                      onClick={() => {
                        if (window.confirm(`Xóa ảnh "${p.title ?? p.id}"? Hành động này không thể hoàn tác.`))
                          act(() => deletePhoto(token!, p.id), "Xóa ảnh thất bại");
                      }}
                    >
                      Xóa
                    </Btn>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {editing && (
        <EditPhotoModal
          key={editing.id}
          photo={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            if (token) load(token);
          }}
          onError={onApiError}
          token={token}
        />
      )}

      {cropKey && (() => {
        const item = pending.find((p) => p.key === cropKey);
        if (!item?.preview) return null;
        return (
          <CropEditor
            src={item.preview}
            title={`Cắt ảnh: ${item.title || item.file.name}`}
            initial={item.crop}
            onClose={() => setCropKey(null)}
            onApply={(crop) => {
              patchPending(cropKey, { crop });
              setCropKey(null);
            }}
          />
        );
      })()}

      {bulkOpen && (
        <BulkCategoryModal
          categories={categories}
          selectedCount={selectedCount}
          adminPhotoCount={selectedAdminPhotos.length}
          busy={bulkBusy}
          onClose={() => setBulkOpen(false)}
          onApply={applyBulk}
        />
      )}
    </div>
  );
}

function BulkCategoryModal({
  categories,
  selectedCount,
  adminPhotoCount,
  busy,
  onClose,
  onApply,
}: {
  categories: Category[];
  selectedCount: number;
  adminPhotoCount: number;
  busy: boolean;
  onClose: () => void;
  onApply: (add: number[], remove: number[]) => void;
}) {
  const [add, setAdd] = useState<Set<number>>(new Set());
  const [remove, setRemove] = useState<Set<number>>(new Set());
  const adminCat = categories.find(isAdminCategory);
  const addingAdmin = adminCat != null && add.has(adminCat.id);

  const toggle = (set: Set<number>, id: number, apply: (s: Set<number>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    apply(next);
  };

  const chips = (current: Set<number>, apply: (s: Set<number>) => void) =>
    categories.map((c) => (
      <button
        key={c.id}
        type="button"
        onClick={() => toggle(current, c.id, apply)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          current.has(c.id) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {categoryLabel(c)}
      </button>
    ));

  return (
    <Modal open onClose={onClose} title={`Chỉnh danh mục cho ${selectedCount} ảnh`}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Gán thêm</label>
          <div className="flex flex-wrap gap-1.5">{chips(add, setAdd)}</div>
        </div>
        <div>
          <label className={labelCls}>Bỏ khỏi</label>
          <div className="flex flex-wrap gap-1.5">{chips(remove, setRemove)}</div>
        </div>
        {addingAdmin && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Danh mục Admin chỉ dành cho ảnh giới thiệu: mỗi ảnh được gán Admin sẽ BỊ GỠ tất cả danh mục khác và biến mất khỏi trang công khai.
          </p>
        )}
        {!addingAdmin && adminPhotoCount > 0 && add.size > 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {adminPhotoCount} ảnh đã chọn đang thuộc danh mục Admin — không thể gán danh mục khác cho chúng.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Hủy</Btn>
          <Btn
            onClick={() => onApply([...add], [...remove])}
            disabled={busy || (add.size === 0 && remove.size === 0)}
          >
            {busy ? "Đang áp dụng…" : "Áp dụng"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

function EditPhotoModal({
  photo,
  categories,
  onClose,
  onSaved,
  onError,
  token,
}: {
  photo: Photo;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onError: (err: unknown) => boolean;
  token: string | null;
}) {
  const [title, setTitle] = useState(photo.title ?? "");
  const [description, setDescription] = useState(photo.description ?? "");
  const [altText, setAltText] = useState(photo.altText ?? "");
  const [sortOrder, setSortOrder] = useState(photo.sortOrder);
  const [isFeatured, setIsFeatured] = useState(photo.isFeatured);
  const [catIds, setCatIds] = useState<number[]>(photo.categories.map((c) => c.id));
  const [saving, setSaving] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  /** Pending crop change: "set" applies fractions, "cleared" removes the crop. */
  const [cropAction, setCropAction] = useState<
    { kind: "unchanged" } | { kind: "set"; crop: CropFraction } | { kind: "cleared" }
  >({ kind: "unchanged" });
  const adminCat = categories.find(isAdminCategory);
  const savedCrop: CropFraction | null =
    photo.cropX != null && photo.cropY != null && photo.cropW != null && photo.cropH != null
      ? { cropX: photo.cropX, cropY: photo.cropY, cropW: photo.cropW, cropH: photo.cropH }
      : null;

  const toggleCat = (catId: number) => {
    if (catId === adminCat?.id) {
      setCatIds((prev) => (prev.includes(catId) ? [] : [catId]));
      return;
    }
    setCatIds((prev) =>
      prev.includes(catId)
        ? prev.filter((x) => x !== catId)
        : [...prev.filter((x) => x !== adminCat?.id), catId],
    );
  };

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updatePhoto(token, photo.id, {
        title, description, altText, sortOrder, isFeatured, categoryIds: catIds,
        ...(cropAction.kind === "cleared"
          ? { clearCrop: true }
          : cropAction.kind === "set"
            ? { ...cropAction.crop }
            : {}),
      });
      onSaved();
    } catch (err) {
      if (!onError(err)) alert("Lưu ảnh thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!photo} onClose={onClose} title={`Chỉnh sửa: ${photo.title ?? `#${photo.id}`}`}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Tiêu đề</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Mô tả</label>
          <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Alt text</label>
          <input className={inputCls} value={altText} onChange={(e) => setAltText(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Thứ tự hiển thị</label>
            <input type="number" className={inputCls} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-green-600" />
              Ảnh nổi bật
            </label>
          </div>
        </div>
        <div>
          <label className={labelCls}>Danh mục</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCat(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  catIds.includes(c.id) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {categoryLabel(c)}
              </button>
            ))}
          </div>
          {adminCat && catIds.includes(adminCat.id) && (
            <p className="mt-1.5 text-[11px] text-amber-600">
              Danh mục Admin chỉ dành cho ảnh giới thiệu — không gán cùng danh mục khác.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5">
          <span className="text-xs text-gray-500">
            Vùng cắt:{" "}
            {cropAction.kind === "cleared"
              ? "sẽ bỏ cắt"
              : cropAction.kind === "set"
                ? "đã chỉnh (chưa lưu)"
                : savedCrop
                  ? "đã cắt"
                  : "ảnh gốc"}
          </span>
          <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => setCropOpen(true)}>
            Cắt ảnh
          </Btn>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Hủy</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</Btn>
        </div>
      </div>
      {cropOpen && (
        <CropEditor
          src={photo.originalImageUrl ?? photo.imageUrl}
          title={`Cắt ảnh: ${photo.title ?? `#${photo.id}`}`}
          initial={cropAction.kind === "set" ? cropAction.crop : savedCrop}
          onClose={() => setCropOpen(false)}
          onApply={(crop) => {
            setCropAction(crop ? { kind: "set", crop } : { kind: "cleared" });
            setCropOpen(false);
          }}
        />
      )}
    </Modal>
  );
}
