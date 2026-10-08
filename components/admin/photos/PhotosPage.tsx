"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminCategories } from "@/lib/api/categories";
import { describeApiError } from "@/lib/api/client";
import { deletePhoto, getAdminPhotos, publishPhoto, reorderPhotos, unpublishPhoto, updatePhoto, uploadPhoto } from "@/lib/api/photos";
import { useAdmin } from "@/lib/auth/useAdmin";
import { formatDate } from "@/lib/labels";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";
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
  /** Position (in the list excluding the dragged card) where a drop will insert. */
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
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

  const toggleCat = (key: string, catId: number) =>
    setPending((prev) =>
      prev.map((p) =>
        p.key === key
          ? { ...p, categoryIds: p.categoryIds.includes(catId) ? p.categoryIds.filter((c) => c !== catId) : [...p.categoryIds, catId] }
          : p,
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
  /** Cards shown in the grid — the dragged card is hidden, replaced by the gap. */
  const displayPhotos = dragId == null ? sorted : sorted.filter((p) => p.id !== dragId);

  // ---------- Insertion-based drag-to-reorder ----------
  const startDrag = (e: React.DragEvent, photo: Photo) => {
    if (savingOrder) {
      e.preventDefault();
      return;
    }
    setDragId(photo.id);
    // The gap starts where the card was, so it looks like the card left a hole.
    setInsertIndex(sorted.findIndex((p) => p.id === photo.id));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(photo.id));
  };

  /** Pointer over card `i`: left half = insert before, right half = after. */
  const overCard = (e: React.DragEvent, i: number) => {
    if (dragId == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    setInsertIndex(e.clientX < rect.left + rect.width / 2 ? i : i + 1);
  };

  /** One persistence request — the final order, atomically. */
  const commitReorder = async () => {
    const id = dragId;
    const idx = insertIndex;
    setDragId(null);
    setInsertIndex(null);
    if (!token || id == null || idx == null) return;

    const ids = displayPhotos.map((p) => p.id);
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
                    // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                    <img src={p.preview} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      {p.state === "error" ? "Không xem trước được" : "Đang tạo xem trước…"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removePending(p.key)}
                    aria-label="Bỏ ảnh"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    ✕
                  </button>
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
                        {c.name}
                      </button>
                    ))}
                  </div>
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
          <Btn variant="ghost" onClick={() => token && load(token)}>Làm mới</Btn>
        </div>
        {orderError && (
          <p className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-sm text-red-600">{orderError}</p>
        )}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : sorted.length === 0 ? (
          <EmptyState title="Chưa có ảnh nào" hint="Chọn ảnh ở trên để tải lên." />
        ) : (
          <div
            className="grid grid-cols-2 items-stretch gap-4 md:grid-cols-3 xl:grid-cols-4"
            onDragOver={(e) => dragId != null && e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              commitReorder();
            }}
          >
            {displayPhotos.flatMap((p, i) => {
              const cells = [];
              if (insertIndex === i) {
                cells.push(
                  <div
                    key="insert-gap"
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center justify-center rounded-xl border-2 border-dashed border-green-400 bg-green-50 text-xs font-medium text-green-600"
                  >
                    Thả vào đây
                  </div>,
                );
              }
              cells.push(
              <article
                key={p.id}
                draggable={!savingOrder}
                onDragStart={(e) => startDrag(e, p)}
                onDragOver={(e) => overCard(e, i)}
                onDragEnd={() => {
                  setDragId(null);
                  setInsertIndex(null);
                }}
                className="flex cursor-grab flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md active:cursor-grabbing"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail URL */}
                  <img src={p.thumbnailUrl ?? p.imageUrl} alt={p.altText ?? p.title ?? "Ảnh"} className="h-full w-full object-cover" draggable={false} />
                  <div className="absolute left-2 top-2">
                    <Badge color={p.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}>
                      {p.status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}
                    </Badge>
                  </div>
                  {p.isFeatured && (
                    <div className="absolute right-2 top-2">
                      <Badge color="bg-green-100 text-green-700">Nổi bật</Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="h-5 truncate text-sm font-semibold text-gray-800">{p.title || "(không tiêu đề)"}</p>
                  <div className="mt-1 flex h-[22px] flex-nowrap gap-1 overflow-hidden">
                    {p.categories.map((c) => (
                      <span key={c.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {c.name}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Thứ tự: {p.sortOrder} · {formatDate(p.createdAt)}
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
              </article>,
              );
              if (insertIndex === displayPhotos.length && i === displayPhotos.length - 1) {
                cells.push(
                  <div
                    key="insert-gap"
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center justify-center rounded-xl border-2 border-dashed border-green-400 bg-green-50 text-xs font-medium text-green-600"
                  >
                    Thả vào đây
                  </div>,
                );
              }
              return cells;
            })}
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
    </div>
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

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updatePhoto(token, photo.id, { title, description, altText, sortOrder, isFeatured, categoryIds: catIds });
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
                onClick={() => setCatIds((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]))}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  catIds.includes(c.id) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>Hủy</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
