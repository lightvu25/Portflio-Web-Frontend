"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAdminCategories } from "@/lib/api/categories";
import { ApiError, describeApiError } from "@/lib/api/client";
import {
  bulkUpdatePhotoCategories,
  deletePhoto,
  getAdminPhotos,
  publishPhoto,
  reorderPhotos,
  unpublishPhoto,
  updatePhoto,
  uploadPhoto,
} from "@/lib/api/photos";
import { useAdmin } from "@/lib/auth/useAdmin";
import {
  categoryLabel,
  formatDate,
  isAdminCategory,
  isPackageCategory,
} from "@/lib/labels";
import type { Category } from "@/types/category";
import type { Photo, PhotoStatus } from "@/types/photo";
import { CropEditor, type CropFraction } from "@/components/admin/photos/CropEditor";
import { Badge, Btn, Card, inputCls, labelCls, Modal, Spinner } from "@/components/admin/ui";

type UploadState = "pending" | "uploading" | "done" | "error";

/**
 * Category filter view:
 * - `number`: specific Category ID
 * - `"UNCATEGORIZED"`: photos with `categories.length === 0`
 * - `"ALL"`: all photos across all categories
 */
type CategoryView = number | "UNCATEGORIZED" | "ALL";

type StatusFilter = "ALL" | PhotoStatus;

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

function categoryTypeBadge(c: Category): { label: string; cls: string } {
  if (isAdminCategory(c)) {
    return { label: "Nội bộ", cls: "bg-amber-100 text-amber-800" };
  }
  if (c.type === "FEEDBACK") {
    return { label: "Cảm nhận", cls: "bg-purple-100 text-purple-700" };
  }
  if (isPackageCategory(c)) {
    return { label: "Gói chụp", cls: "bg-blue-100 text-blue-700" };
  }
  return { label: "Bộ sưu tập", cls: "bg-[#EBF1E7] text-[#4E6B40]" };
}

function resolveAdminPreviewUrl(p: Photo): string {
  const raw = p.thumbnailUrl ?? p.imageUrl;
  return raw.replace("/w_400,c_fill,", "/w_600,c_limit,");
}

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
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) throw new Error("preview encode failed");
    return URL.createObjectURL(blob);
  } finally {
    bitmap.close();
  }
}

/** Photos admin — organized by Category with contextual multi-upload, search, bulk actions, and reorder. */
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
  const [indicator, setIndicator] = useState<{ left: number; top: number; height: number } | null>(
    null,
  );
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  /** Active Category tab — defaults to first available Category once loaded. */
  const [activeCategory, setActiveCategory] = useState<CategoryView | null>(null);
  /** Search query and status filter within the selected Category. */
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  /** Multi-select for bulk category editing. */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<Photo | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  /** Pending-file key whose crop editor is open. */
  const [cropKey, setCropKey] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
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
      setActiveCategory((prev) => {
        if (typeof prev === "number" && c.some((cat) => cat.id === prev)) return prev;
        if (prev === "UNCATEGORIZED" || prev === "ALL") return prev;
        return c[0]?.id ?? "ALL";
      });
      setError(null);
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được danh sách ảnh và danh mục.");
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

  const selectedCategoryObj = useMemo(
    () =>
      typeof activeCategory === "number"
        ? (categories.find((c) => c.id === activeCategory) ?? null)
        : null,
    [activeCategory, categories],
  );

  // Per-category photo counts (total & published) derived accurately from loaded data.
  const categoryStats = useMemo(() => {
    const map = new Map<number, { total: number; published: number; draft: number }>();
    for (const c of categories) {
      map.set(c.id, { total: 0, published: 0, draft: 0 });
    }
    let uncategorizedTotal = 0;
    for (const p of photos) {
      if (!p.categories || p.categories.length === 0) {
        uncategorizedTotal++;
        continue;
      }
      for (const c of p.categories) {
        const entry = map.get(c.id);
        if (entry) {
          entry.total++;
          if (p.status === "PUBLISHED") entry.published++;
          else entry.draft++;
        }
      }
    }
    return { byCategoryId: map, uncategorizedTotal };
  }, [categories, photos]);

  const handleSelectCategory = (nextView: CategoryView) => {
    setActiveCategory(nextView);
    setSelected(new Set());
    setNotice(null);
    setOrderError(null);
  };

  // ---------- Upload flow ----------
  const pickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const defaultCategoryIds = typeof activeCategory === "number" ? [activeCategory] : [];
    const items: PendingFile[] = Array.from(files).map((file, i) => ({
      key: `${file.name}-${Date.now()}-${i}`,
      file,
      preview: null,
      title: file.name.replace(/\.[^.]+$/, ""),
      sortOrder: photos.length + pending.length + i + 1,
      categoryIds: defaultCategoryIds,
      crop: null,
      state: file.type.startsWith("image/") ? "pending" : "error",
      error: file.type.startsWith("image/")
        ? undefined
        : "Định dạng không được hỗ trợ — chỉ nhận JPEG/PNG/WebP/AVIF.",
    }));
    setPending((prev) => [...prev, ...items]);
    queueMicrotask(() => {
      uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
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

  const assignCurrentCategoryToAllPending = () => {
    if (typeof activeCategory !== "number") return;
    setPending((prev) =>
      prev.map((p) =>
        p.state === "done"
          ? p
          : {
              ...p,
              categoryIds: p.categoryIds.includes(activeCategory)
                ? p.categoryIds
                : toggleCatExclusive(p.categoryIds, activeCategory),
            },
      ),
    );
  };

  const removePending = (key: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.key !== key);
    });
  };

  const uploadOne = async (item: PendingFile): Promise<boolean> => {
    if (!token) return false;
    patchPending(item.key, { state: "uploading", error: undefined });
    try {
      await uploadPhoto(token, item.file, {
        title: item.title,
        sortOrder: item.sortOrder,
        categoryIds: item.categoryIds,
        crop: item.crop ?? undefined,
      });
      patchPending(item.key, { state: "done" });
      return true;
    } catch (err) {
      patchPending(item.key, { state: "error", error: describeApiError(err) });
      onApiError(err);
      return false;
    }
  };

  /** Sequential upload — one large file at a time keeps the UI responsive. */
  const uploadAll = async () => {
    if (!token || uploading) return;
    setUploading(true);
    setNotice(null);
    let successCount = 0;
    let failCount = 0;
    for (const item of pending) {
      if (item.state === "done") continue;
      const ok = await uploadOne(item);
      if (ok) successCount++;
      else failCount++;
    }
    setUploading(false);
    // Remove finished cards (revoking their preview URLs) once per batch.
    setPending((prev) => {
      prev.forEach((p) => p.state === "done" && p.preview && URL.revokeObjectURL(p.preview));
      return prev.filter((p) => p.state !== "done");
    });
    if (successCount > 0) {
      const targetName = selectedCategoryObj
        ? `danh mục "${categoryLabel(selectedCategoryObj)}"`
        : "thư viện";
      setNotice({
        ok: failCount === 0,
        text:
          failCount === 0
            ? `Đã tải lên thành công ${successCount} ảnh vào ${targetName}.`
            : `Đã tải lên ${successCount} ảnh, ${failCount} ảnh lỗi — vui lòng kiểm tra lại.`,
      });
    }
    if (token) await load(token);
  };

  const retryOne = async (key: string) => {
    const item = pending.find((p) => p.key === key);
    if (item && item.state === "error") {
      const ok = await uploadOne(item);
      if (ok && token) {
        removePending(key);
        setNotice({ ok: true, text: `Đã tải lên ảnh "${item.title}".` });
        await load(token);
      }
    }
  };

  // ---------- Photo actions ----------
  const act = async (fn: () => Promise<unknown>, successMsg: string, errMsg: string) => {
    if (!token) return;
    try {
      await fn();
      setNotice({ ok: true, text: successMsg });
      await load(token);
    } catch (err) {
      if (!onApiError(err)) {
        setNotice({ ok: false, text: `${errMsg} — ${describeApiError(err)}` });
      }
    }
  };

  const sorted = useMemo(
    () => [...photos].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [photos],
  );

  // Filter by selected Category first
  const categoryFilteredPhotos = useMemo(() => {
    if (activeCategory === "ALL" || activeCategory == null) return sorted;
    if (activeCategory === "UNCATEGORIZED") {
      return sorted.filter((p) => p.categories.length === 0);
    }
    return sorted.filter((p) => p.categories.some((c) => c.id === activeCategory));
  }, [sorted, activeCategory]);

  // Apply status filter and search query within the active Category
  const visiblePhotos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return categoryFilteredPhotos.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (!q) return true;
      const inTitle = (p.title ?? "").toLowerCase().includes(q);
      const inDesc = (p.description ?? "").toLowerCase().includes(q);
      const inAlt = (p.altText ?? "").toLowerCase().includes(q);
      const inId = `#${p.id}`.includes(q);
      return inTitle || inDesc || inAlt || inId;
    });
  }, [categoryFilteredPhotos, statusFilter, searchQuery]);

  // ---------- Bulk selection ----------
  const lastClickedIdRef = useRef<number | null>(null);
  const [bulkStatusText, setBulkStatusText] = useState<string | null>(null);

  const toggleSelect = (id: number, shiftKey = false) => {
    setSelectMode(true);
    setSelected((prev) => {
      const next = new Set(prev);
      const shouldSelect = !next.has(id);
      if (shiftKey && lastClickedIdRef.current != null) {
        const ids = visiblePhotos.map((p) => p.id);
        const a = ids.indexOf(lastClickedIdRef.current);
        const b = ids.indexOf(id);
        if (a !== -1 && b !== -1) {
          const [start, end] = a < b ? [a, b] : [b, a];
          for (let i = start; i <= end; i++) {
            if (shouldSelect) next.add(ids[i]);
            else next.delete(ids[i]);
          }
          lastClickedIdRef.current = id;
          return next;
        }
      }
      if (shouldSelect) next.add(id);
      else next.delete(id);
      lastClickedIdRef.current = id;
      return next;
    });
  };
  const selectAllVisible = () => {
    setSelectMode(true);
    setSelected(new Set(visiblePhotos.map((p) => p.id)));
  };
  const clearSelection = () => {
    setSelected(new Set());
    lastClickedIdRef.current = null;
  };
  const selectedCount = selected.size;
  const selectedPhotosList = useMemo(
    () => photos.filter((p) => selected.has(p.id)),
    [photos, selected],
  );
  const selectedDraftIds = useMemo(
    () => selectedPhotosList.filter((p) => p.status === "DRAFT").map((p) => p.id),
    [selectedPhotosList],
  );
  const selectedPublishedIds = useMemo(
    () => selectedPhotosList.filter((p) => p.status === "PUBLISHED").map((p) => p.id),
    [selectedPhotosList],
  );
  const adminCat = categories.find(isAdminCategory);
  /** Selected photos that currently sit in the reserved Admin category. */
  const selectedAdminPhotos = selectedPhotosList.filter((p) =>
    p.categories.some(isAdminCategory),
  );
  const zoomedIndex = zoomedPhoto ? visiblePhotos.findIndex((p) => p.id === zoomedPhoto.id) : -1;
  const prevZoomedPhoto = zoomedIndex > 0 ? visiblePhotos[zoomedIndex - 1] : undefined;
  const nextZoomedPhoto =
    zoomedIndex >= 0 && zoomedIndex < visiblePhotos.length - 1
      ? visiblePhotos[zoomedIndex + 1]
      : undefined;

  const bulkPublishSelected = async () => {
    if (!token || bulkBusy) return;
    const ids = selectedDraftIds.length > 0 ? selectedDraftIds : [...selected];
    if (ids.length === 0) return;
    if (!window.confirm(`Xuất bản ${ids.length} bức ảnh đã chọn?`)) return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBulkStatusText(`Đang xuất bản ${i + 1}/${ids.length}…`);
      try {
        await publishPhoto(token, ids[i]);
        ok++;
      } catch (err) {
        fail++;
        onApiError(err);
      }
    }
    setBulkStatusText(null);
    setBulkBusy(false);
    clearSelection();
    setNotice({
      ok: fail === 0,
      text:
        fail === 0
          ? `Đã xuất bản thành công ${ok} bức ảnh.`
          : `Đã xuất bản ${ok} bức ảnh, ${fail} ảnh lỗi.`,
    });
    await load(token);
  };

  const bulkUnpublishSelected = async () => {
    if (!token || bulkBusy || selectedPublishedIds.length === 0) return;
    const ids = selectedPublishedIds;
    if (!window.confirm(`Chuyển ${ids.length} bức ảnh đã chọn về Bản nháp?`)) return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBulkStatusText(`Đang ẩn ${i + 1}/${ids.length}…`);
      try {
        await unpublishPhoto(token, ids[i]);
        ok++;
      } catch (err) {
        fail++;
        onApiError(err);
      }
    }
    setBulkStatusText(null);
    setBulkBusy(false);
    clearSelection();
    setNotice({
      ok: fail === 0,
      text:
        fail === 0
          ? `Đã chuyển ${ok} bức ảnh về Bản nháp.`
          : `Đã ẩn ${ok} bức ảnh, ${fail} ảnh lỗi.`,
    });
    await load(token);
  };

  const bulkDeleteSelected = async () => {
    if (!token || selectedCount === 0 || bulkBusy) return;
    const ids = [...selected];
    if (
      !window.confirm(
        `Xóa vĩnh viễn toàn bộ (${ids.length} bức) ảnh đã chọn? Hành động này không thể hoàn tác.`,
      )
    )
      return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBulkStatusText(`Đang xóa ${i + 1}/${ids.length}…`);
      try {
        await deletePhoto(token, ids[i]);
        ok++;
      } catch (err) {
        fail++;
        onApiError(err);
      }
    }
    setBulkStatusText(null);
    setBulkBusy(false);
    clearSelection();
    setNotice({
      ok: fail === 0,
      text:
        fail === 0
          ? `Đã xóa thành công ${ok} bức ảnh.`
          : `Đã xóa ${ok} bức ảnh, ${fail} ảnh lỗi.`,
    });
    await load(token);
  };

  const applyBulk = async (add: number[], remove: number[]) => {
    if (!token || selectedCount === 0 || bulkBusy) return;
    const photoIds = [...selected];
    const verb = [
      add.length ? `gán ${add.length} danh mục` : "",
      remove.length ? `bỏ ${remove.length} danh mục` : "",
    ]
      .filter(Boolean)
      .join(" và ");
    if (!window.confirm(`${verb} cho ${photoIds.length} ảnh đã chọn?`)) return;
    setBulkBusy(true);
    setNotice(null);
    try {
      await bulkUpdatePhotoCategories(token, {
        photoIds,
        addCategoryIds: add.length ? add : undefined,
        removeCategoryIds: remove.length ? remove : undefined,
      });
      setNotice({ ok: true, text: `Đã cập nhật danh mục cho ${photoIds.length} ảnh.` });
      setBulkOpen(false);
      clearSelection();
      await load(token);
    } catch (err) {
      const text = err instanceof ApiError ? err.message : "Cập nhật danh mục thất bại.";
      setNotice({ ok: false, text });
      onApiError(err);
    } finally {
      setBulkBusy(false);
    }
  };

  /** Cards without the dragged one — the insertion index addresses this list. */
  const canReorder =
    !savingOrder &&
    !selectMode &&
    statusFilter === "ALL" &&
    searchQuery.trim() === "" &&
    visiblePhotos.length > 1;
  const others = useMemo(
    () => (dragId == null ? visiblePhotos : visiblePhotos.filter((p) => p.id !== dragId)),
    [visiblePhotos, dragId],
  );
  const othersIndex = useMemo(() => new Map(others.map((p, i) => [p.id, i])), [others]);
  const justDraggedRef = useRef(false);

  // ---------- Insertion-based drag-to-reorder ----------
  const startDrag = (e: React.DragEvent, photo: Photo) => {
    if (!canReorder || (e.target as HTMLElement).closest("button")) {
      e.preventDefault();
      return;
    }
    justDraggedRef.current = true;
    setDragId(photo.id);
    const card = (e.currentTarget as HTMLElement).closest("article");
    const cardRect = card?.getBoundingClientRect();
    if (card && cardRect) {
      e.dataTransfer.setDragImage(card, e.clientX - cardRect.left, e.clientY - cardRect.top);
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(photo.id));
    setInsertIndex(othersIndex.get(photo.id) ?? 0);
    if (cardRect && gridRef.current) {
      const cr = gridRef.current.getBoundingClientRect();
      setIndicator({
        left: Math.max(2, cardRect.left - cr.left - 8),
        top: cardRect.top - cr.top,
        height: cardRect.height,
      });
    }
  };

  const endDrag = () => {
    setDragId(null);
    setInsertIndex(null);
    setIndicator(null);
    window.setTimeout(() => {
      justDraggedRef.current = false;
    }, 0);
  };

  const onGridDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (dragId == null || !gridRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const gridEl = gridRef.current;
    const cr = gridEl.getBoundingClientRect();
    const cardEls = Array.from(gridEl.querySelectorAll<HTMLElement>("article[data-photo-id]"));
    const rects = cardEls.map((el, index) => ({
      index,
      id: Number(el.dataset.photoId),
      rect: el.getBoundingClientRect(),
    }));
    if (rects.length === 0) return;

    // Group cards into visual rows by vertical position
    const rows: (typeof rects)[] = [];
    for (const item of rects) {
      const lastRow = rows[rows.length - 1];
      if (!lastRow || Math.abs(item.rect.top - lastRow[0].rect.top) > item.rect.height / 2) {
        rows.push([item]);
      } else {
        lastRow.push(item);
      }
    }

    // Pick the row closest vertically to the pointer
    let targetRow = rows[0];
    let bestRowDist = Infinity;
    for (const row of rows) {
      const top = row[0].rect.top;
      const bottom = row[0].rect.bottom;
      const dist =
        e.clientY >= top && e.clientY <= bottom
          ? 0
          : Math.min(Math.abs(e.clientY - top), Math.abs(e.clientY - bottom));
      if (dist < bestRowDist) {
        bestRowDist = dist;
        targetRow = row;
      }
    }

    // Find whether the pointer is before the first card (head) or between two cards in the row
    const firstBeforeIdx = targetRow.findIndex(
      (item) => e.clientX < item.rect.left + item.rect.width / 2,
    );

    let slotIndex: number;
    let indicatorLeft: number;
    let indicatorTop: number;
    let indicatorHeight: number;

    if (firstBeforeIdx === 0) {
      // At the head of the row (before the first card in this row)
      const first = targetRow[0];
      slotIndex = first.index;
      indicatorLeft = Math.max(2, first.rect.left - cr.left - 8);
      indicatorTop = first.rect.top - cr.top;
      indicatorHeight = first.rect.height;
    } else if (firstBeforeIdx > 0) {
      // In the middle gap between targetRow[firstBeforeIdx - 1] and targetRow[firstBeforeIdx]
      const prevCard = targetRow[firstBeforeIdx - 1];
      const nextCard = targetRow[firstBeforeIdx];
      slotIndex = nextCard.index;
      indicatorLeft = (prevCard.rect.right - cr.left + (nextCard.rect.left - cr.left)) / 2;
      indicatorTop = nextCard.rect.top - cr.top;
      indicatorHeight = nextCard.rect.height;
    } else {
      // After the last card in this row
      const last = targetRow[targetRow.length - 1];
      slotIndex = last.index + 1;
      indicatorLeft = Math.min(cr.width - 2, last.rect.right - cr.left + 8);
      indicatorTop = last.rect.top - cr.top;
      indicatorHeight = last.rect.height;
    }

    const draggedVisualIdx = visiblePhotos.findIndex((p) => p.id === dragId);
    const nextInsertIdx =
      draggedVisualIdx !== -1 && slotIndex > draggedVisualIdx ? slotIndex - 1 : slotIndex;

    setInsertIndex(nextInsertIdx);
    setIndicator({ left: indicatorLeft, top: indicatorTop, height: indicatorHeight });
  };

  const commitReorder = async () => {
    const id = dragId;
    const idx = insertIndex;
    endDrag();
    if (!token || id == null || idx == null) return;

    const ids = others.map((p) => p.id);
    ids.splice(Math.min(idx, ids.length), 0, id);
    if (ids.join() === visiblePhotos.map((p) => p.id).join()) return;

    const prev = photos;
    const newOrderMap = new Map(ids.map((pid, i) => [pid, i + 1]));
    setPhotos(
      prev.map((p) => (newOrderMap.has(p.id) ? { ...p, sortOrder: newOrderMap.get(p.id)! } : p)),
    );
    setSavingOrder(true);
    setOrderError(null);
    try {
      const saved = await reorderPhotos(
        token,
        ids.map((pid, i) => ({ id: pid, sortOrder: i + 1 })),
      );
      setPhotos(saved);
    } catch (err) {
      setPhotos(prev);
      if (!onApiError(err)) setOrderError("Không thể lưu thứ tự ảnh. Vui lòng thử lại.");
    } finally {
      setSavingOrder(false);
    }
  };

  const activeCategoryTitle = selectedCategoryObj
    ? categoryLabel(selectedCategoryObj)
    : activeCategory === "UNCATEGORIZED"
      ? "Chưa gán danh mục"
      : "Tất cả ảnh";

  const publishedInCategory = categoryFilteredPhotos.filter((p) => p.status === "PUBLISHED").length;
  const draftInCategory = categoryFilteredPhotos.length - publishedInCategory;

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Category Selector */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản lý thư viện ảnh</h1>
            <p className="mt-1 text-sm text-gray-500">
              Chọn danh mục bên dưới để xem, thêm ảnh mới hoặc chỉnh sửa ảnh theo từng chủ đề.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B8E5A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5A7A4B]"
            >
              <span aria-hidden="true" className="text-base leading-none">＋</span>
              {selectedCategoryObj
                ? `Thêm ảnh vào "${categoryLabel(selectedCategoryObj)}"`
                : "Thêm ảnh mới"}
            </button>
            <Btn variant="ghost" onClick={() => token && load(token)}>
              Làm mới
            </Btn>
          </div>
        </div>

        {/* Category cards/tabs */}
        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Danh mục ({categories.length})
            </span>
            <span className="text-xs text-gray-400">
              Tổng cộng {photos.length} ảnh trong hệ thống
            </span>
          </div>

          {loading && categories.length === 0 ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : (
            <div
              role="tablist"
              aria-label="Danh mục ảnh"
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            >
              {categories.map((c) => {
                const stats = categoryStats.byCategoryId.get(c.id) ?? {
                  total: 0,
                  published: 0,
                  draft: 0,
                };
                const isActive = activeCategory === c.id;
                const badge = categoryTypeBadge(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectCategory(c.id)}
                    className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                      isActive
                        ? "border-[#6B8E5A] bg-[#F4F7F2] ring-2 ring-[#6B8E5A]/30 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`font-semibold text-sm leading-snug ${
                          isActive ? "text-[#4E6B40]" : "text-gray-800"
                        }`}
                      >
                        {categoryLabel(c)}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-2">
                      <span
                        className={`text-lg font-bold ${
                          isActive ? "text-[#4E6B40]" : "text-gray-900"
                        }`}
                      >
                        {stats.total}{" "}
                        <span className="text-xs font-normal text-gray-500">ảnh</span>
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {stats.published} đã đăng
                        {stats.draft > 0 ? ` · ${stats.draft} nháp` : ""}
                      </span>
                    </div>
                  </button>
                );
              })}

              {categoryStats.uncategorizedTotal > 0 && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === "UNCATEGORIZED"}
                  onClick={() => handleSelectCategory("UNCATEGORIZED")}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    activeCategory === "UNCATEGORIZED"
                      ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/30 shadow-sm"
                      : "border-amber-200 bg-amber-50/30 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-amber-900">
                      Chưa gán danh mục
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      Cần phân loại
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <span className="text-lg font-bold text-amber-900">
                      {categoryStats.uncategorizedTotal}{" "}
                      <span className="text-xs font-normal text-amber-700">ảnh</span>
                    </span>
                    <span className="text-[11px] text-amber-700">Chưa có category</span>
                  </div>
                </button>
              )}

              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === "ALL"}
                onClick={() => handleSelectCategory("ALL")}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                  activeCategory === "ALL"
                    ? "border-[#6B8E5A] bg-[#F4F7F2] ring-2 ring-[#6B8E5A]/30 shadow-sm"
                    : "border-dashed border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-100/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      activeCategory === "ALL" ? "text-[#4E6B40]" : "text-gray-700"
                    }`}
                  >
                    Tất cả ảnh
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    Toàn bộ
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {photos.length}{" "}
                    <span className="text-xs font-normal text-gray-500">ảnh</span>
                  </span>
                  <span className="text-[11px] text-gray-400">Hỗ trợ kéo thả thứ tự</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* 2. Pending Upload Queue (shown when files are selected) */}
      {pending.length > 0 && (
        <div ref={uploadSectionRef}>
          <Card className="border-[#6B8E5A]/40 bg-[#F4F7F2]/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Hàng đợi tải ảnh lên ({pending.length})
                </h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  {selectedCategoryObj ? (
                    <>
                      Ảnh mới đã được gán mặc định vào danh mục{" "}
                      <strong className="text-[#4E6B40]">
                        {categoryLabel(selectedCategoryObj)}
                      </strong>
                      . Bạn có thể chỉnh tiêu đề, vùng cắt hoặc thêm danh mục khác trước khi tải lên.
                    </>
                  ) : (
                    "Chọn danh mục cho từng ảnh bên dưới rồi bấm Tải lên."
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategoryObj && (
                  <Btn
                    variant="ghost"
                    className="text-xs"
                    onClick={assignCurrentCategoryToAllPending}
                  >
                    Gán &ldquo;{categoryLabel(selectedCategoryObj)}&rdquo; cho tất cả ảnh chờ
                  </Btn>
                )}
                <Btn variant="ghost" onClick={() => fileInput.current?.click()}>
                  + Chọn thêm ảnh
                </Btn>
                <button
                  type="button"
                  onClick={uploadAll}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6B8E5A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5A7A4B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading
                    ? "Đang tải lên…"
                    : `Tải lên ${pending.filter((p) => p.state !== "done").length} ảnh`}
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Đã tải lên {pending.filter((p) => p.state === "done").length} / {pending.length} ảnh
              {pending.some((p) => p.state === "error") &&
                ` · ${pending.filter((p) => p.state === "error").length} lỗi`}
              {pending.find((p) => p.state === "uploading") &&
                ` · Đang tải: ${pending.find((p) => p.state === "uploading")!.file.name}`}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pending.map((p) => (
                <div
                  key={p.key}
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                >
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
                        <img
                          src={p.preview}
                          alt={p.title}
                          className="h-full w-full object-contain"
                        />
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
                              ? "bg-[#6B8E5A] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {categoryLabel(c)}
                        </button>
                      ))}
                    </div>
                    {p.categoryIds.length === 0 && (
                      <p className="text-[11px] text-amber-600">
                        Chưa chọn danh mục — hãy chọn ít nhất 1 danh mục cho ảnh này.
                      </p>
                    )}
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
                          p.state === "done"
                            ? "text-green-600"
                            : p.state === "error"
                              ? "text-red-600"
                              : "text-gray-400"
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
                        className="text-xs font-semibold text-[#6B8E5A] hover:underline"
                      >
                        Thử lại
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 3. Active Category Photo Grid */}
      <Card>
        {/* Category Context Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-900">{activeCategoryTitle}</h2>
              {selectedCategoryObj && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    categoryTypeBadge(selectedCategoryObj).cls
                  }`}
                >
                  {categoryTypeBadge(selectedCategoryObj).label}
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {categoryFilteredPhotos.length} ảnh
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {publishedInCategory} đã đăng · {draftInCategory} bản nháp
              {(canReorder || savingOrder) && (
                <span className="ml-2 text-gray-400">
                  · {savingOrder ? "Đang lưu thứ tự…" : "Giữ và kéo thẻ ảnh để sắp xếp vị trí"}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6B8E5A] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#5A7A4B]"
            >
              <span>＋</span> Thêm ảnh
            </button>
          </div>
        </div>

        {/* Search, Status Filter & Bulk-Selection Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tiêu đề, mô tả, #id…"
                className={`${inputCls} py-1.5 text-xs`}
              />
            </div>

            {/* Status filter pills */}
            <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs">
              {(
                [
                  { id: "ALL", label: `Tất cả (${categoryFilteredPhotos.length})` },
                  { id: "PUBLISHED", label: `Đã đăng (${publishedInCategory})` },
                  { id: "DRAFT", label: `Bản nháp (${draftInCategory})` },
                ] as { id: StatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                    statusFilter === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk selection controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Btn
              variant={selectMode ? "primary" : "ghost"}
              className="px-3 py-1.5 text-xs"
              disabled={bulkBusy}
              onClick={() => {
                if (selectMode) {
                  setSelectMode(false);
                  clearSelection();
                } else {
                  setSelectMode(true);
                }
              }}
            >
              {selectMode
                ? `✓ Chế độ chọn (${selectedCount} đã chọn)`
                : "Chọn nhanh / Chọn nhiều"}
            </Btn>
            {(selectMode || selectedCount > 0) && (
              <>
                <Btn
                  variant="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  disabled={bulkBusy || visiblePhotos.length === 0}
                  onClick={selectAllVisible}
                >
                  Chọn tất cả ({visiblePhotos.length})
                </Btn>
                <Btn
                  variant="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  onClick={clearSelection}
                  disabled={bulkBusy || selectedCount === 0}
                >
                  Bỏ chọn
                </Btn>
                <Btn
                  variant="success"
                  className="px-3 py-1.5 text-xs"
                  disabled={bulkBusy || selectedCount === 0}
                  onClick={bulkPublishSelected}
                >
                  {bulkStatusText && bulkStatusText.startsWith("Đang xuất bản")
                    ? bulkStatusText
                    : `Xuất bản (${selectedDraftIds.length > 0 ? selectedDraftIds.length : selectedCount} bức)`}
                </Btn>
                {selectedPublishedIds.length > 0 && (
                  <Btn
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    disabled={bulkBusy}
                    onClick={bulkUnpublishSelected}
                  >
                    {bulkStatusText && bulkStatusText.startsWith("Đang ẩn")
                      ? bulkStatusText
                      : `Ẩn (${selectedPublishedIds.length} bức)`}
                  </Btn>
                )}
                <Btn
                  className="px-3 py-1.5 text-xs"
                  disabled={bulkBusy || selectedCount === 0}
                  onClick={() => setBulkOpen(true)}
                >
                  Đổi danh mục ({selectedCount})
                </Btn>
                <Btn
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  disabled={bulkBusy || selectedCount === 0}
                  onClick={bulkDeleteSelected}
                >
                  {bulkStatusText && bulkStatusText.startsWith("Đang xóa")
                    ? bulkStatusText
                    : `Xóa toàn bộ (${selectedCount} bức)`}
                </Btn>
              </>
            )}
          </div>
        </div>

        {/* Status / Notification Banners */}
        {notice && (
          <div
            className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
              notice.ok ? "bg-[#EBF1E7] text-[#4E6B40]" : "bg-red-50 text-red-600"
            }`}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-3 text-xs font-semibold opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}
        {orderError && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{orderError}</p>
        )}

        {/* Photo Grid / States */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 py-10 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <Btn
              variant="ghost"
              className="mt-3 text-xs"
              onClick={() => token && load(token)}
            >
              Thử tải lại
            </Btn>
          </div>
        ) : visiblePhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-14 text-center">
            <p className="text-sm font-semibold text-gray-600">
              {searchQuery.trim() || statusFilter !== "ALL"
                ? "Không tìm thấy ảnh phù hợp với bộ lọc hiện tại"
                : `Chưa có ảnh nào trong "${activeCategoryTitle}"`}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {searchQuery.trim() || statusFilter !== "ALL"
                ? "Hãy thử xoá từ khoá tìm kiếm hoặc chuyển bộ lọc trạng thái về Tất cả."
                : "Bấm nút bên dưới để tải nhiều ảnh trực tiếp vào danh mục này."}
            </p>
            {searchQuery.trim() || statusFilter !== "ALL" ? (
              <Btn
                variant="ghost"
                className="mt-4 text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
              >
                Xoá bộ lọc
              </Btn>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6B8E5A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#5A7A4B]"
              >
                <span>＋</span> Thêm ảnh vào &ldquo;{activeCategoryTitle}&rdquo;
              </button>
            )}
          </div>
        ) : (
          <div
            ref={gridRef}
            className="relative grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-4"
            onDragOver={onGridDragOver}
            onDrop={(e) => {
              e.preventDefault();
              commitReorder();
            }}
          >
            {dragId != null && indicator && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-20 w-1 -translate-x-1/2 rounded-full bg-[#6B8E5A] shadow-[0_0_8px_rgba(107,142,90,0.65)]"
                style={{ left: indicator.left, top: indicator.top, height: indicator.height }}
              >
                <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-[#6B8E5A] shadow-sm" />
                <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-[#6B8E5A] shadow-sm" />
              </div>
            )}
            {visiblePhotos.map((p) => {
              const isSelected = selected.has(p.id);
              const isPkgPhoto =
                Boolean(selectedCategoryObj && isPackageCategory(selectedCategoryObj)) ||
                p.categories.some(isPackageCategory);
              return (
                <article
                  key={p.id}
                  data-photo-id={p.id}
                  draggable={canReorder}
                  onDragStart={(e) => startDrag(e, p)}
                  onDragEnd={endDrag}
                  onClick={(e) => {
                    if (justDraggedRef.current) return;
                    if (selectMode) {
                      toggleSelect(p.id, e.shiftKey);
                    }
                  }}
                  className={`group/card flex flex-col overflow-hidden rounded-xl border bg-white transition ${
                    selectMode
                      ? "cursor-pointer"
                      : canReorder
                        ? "cursor-grab active:cursor-grabbing"
                        : ""
                  } ${
                    dragId === p.id
                      ? "border-dashed border-[#6B8E5A] opacity-40"
                      : isSelected
                        ? "border-[#6B8E5A] ring-2 ring-[#6B8E5A] shadow-md"
                        : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`relative overflow-hidden bg-gray-100 ${
                      isPkgPhoto ? "aspect-[16/10]" : ""
                    } ${!selectMode ? "group" : ""}`}
                    onClick={(e) => {
                      if (justDraggedRef.current) return;
                      if (!selectMode) {
                        e.stopPropagation();
                        setZoomedPhoto(p);
                      }
                    }}
                    title={
                      !selectMode
                        ? canReorder
                          ? "Giữ và kéo để đổi vị trí · Nhấp để xem ảnh phóng to"
                          : "Nhấp để xem ảnh phóng to"
                        : undefined
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail URL */}
                    <img
                      src={resolveAdminPreviewUrl(p)}
                      alt={p.altText ?? p.title ?? "Ảnh"}
                      loading="lazy"
                      className={`w-full transition-transform duration-200 ${
                        isPkgPhoto ? "h-full object-cover" : "block h-auto"
                      } ${!selectMode ? "group-hover:scale-[1.03]" : ""}`}
                    />
                    <div className="pointer-events-none absolute left-2 top-2">
                      <Badge
                        color={
                          p.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }
                      >
                        {p.status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={isSelected ? "Bỏ chọn ảnh" : "Chọn ảnh"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(p.id, e.shiftKey);
                      }}
                      className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold transition-all ${
                        isSelected
                          ? "border-[#6B8E5A] bg-[#6B8E5A] text-white opacity-100"
                          : selectMode
                            ? "border-gray-300 bg-white/90 text-transparent opacity-100 hover:border-[#6B8E5A]"
                            : "border-gray-300 bg-white/90 text-transparent opacity-80 group-hover/card:opacity-100 hover:border-[#6B8E5A]"
                      }`}
                    >
                      ✓
                    </button>
                    {p.isFeatured && (
                      <div className="pointer-events-none absolute right-2 top-9">
                        <Badge color="bg-green-100 text-green-700">Nổi bật</Badge>
                      </div>
                    )}
                    {isSelected && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-[#6B8E5A]"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="h-5 truncate text-sm font-semibold text-gray-800">
                      {p.title || "(không tiêu đề)"}
                    </p>
                    <div className="mt-1 flex min-h-[22px] flex-wrap gap-1">
                      {p.categories.length > 0 ? (
                        p.categories.map((c) => (
                          <span
                            key={c.id}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              activeCategory === c.id
                                ? "bg-[#EBF1E7] text-[#4E6B40]"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {categoryLabel(c)}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">
                          Chưa có danh mục
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 flex items-center text-[11px] text-gray-400">
                      Thứ tự: {p.sortOrder} · {formatDate(p.createdAt)}
                    </p>
                    <div
                      className="mt-3 flex flex-wrap gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Btn
                        variant="ghost"
                        className="px-2.5 py-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(p);
                        }}
                      >
                        Sửa / Đổi mục
                      </Btn>
                      {p.status === "DRAFT" ? (
                        <Btn
                          variant="success"
                          className="px-2.5 py-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            act(
                              () => publishPhoto(token!, p.id),
                              `Đã xuất bản ảnh "${p.title || `#${p.id}`}".`,
                              "Xuất bản thất bại",
                            );
                          }}
                        >
                          Xuất bản
                        </Btn>
                      ) : (
                        <Btn
                          variant="ghost"
                          className="px-2.5 py-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            act(
                              () => unpublishPhoto(token!, p.id),
                              `Đã chuyển ảnh "${p.title || `#${p.id}`}" về Bản nháp.`,
                              "Ẩn ảnh thất bại",
                            );
                          }}
                        >
                          Ẩn
                        </Btn>
                      )}
                      <Btn
                        variant="danger"
                        className="px-2.5 py-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Xóa ảnh "${p.title ?? p.id}"? Hành động này không thể hoàn tác.`,
                            )
                          )
                            act(
                              () => deletePhoto(token!, p.id),
                              `Đã xóa ảnh "${p.title || `#${p.id}`}".`,
                              "Xóa ảnh thất bại",
                            );
                        }}
                      >
                        Xóa
                      </Btn>
                    </div>
                  </div>
                </article>
              );
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
          onSaved={(updatedTitle) => {
            setEditing(null);
            setNotice({ ok: true, text: `Đã lưu thay đổi cho ảnh "${updatedTitle}".` });
            if (token) load(token);
          }}
          onError={onApiError}
          token={token}
        />
      )}

      {cropKey &&
        (() => {
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

      {zoomedPhoto && (
        <PhotoZoomModal
          photo={zoomedPhoto}
          onClose={() => setZoomedPhoto(null)}
          onPrev={prevZoomedPhoto ? () => setZoomedPhoto(prevZoomedPhoto) : undefined}
          onNext={nextZoomedPhoto ? () => setZoomedPhoto(nextZoomedPhoto) : undefined}
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
          current.has(c.id)
            ? "bg-[#6B8E5A] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <Btn variant="ghost" onClick={onClose}>
            Hủy
          </Btn>
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
  onSaved: (title: string) => void;
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
  const [saveError, setSaveError] = useState<string | null>(null);
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
    setSaveError(null);
    try {
      await updatePhoto(token, photo.id, {
        title,
        description,
        altText,
        sortOrder,
        isFeatured,
        categoryIds: catIds,
        ...(cropAction.kind === "cleared"
          ? { clearCrop: true }
          : cropAction.kind === "set"
            ? { ...cropAction.crop }
            : {}),
      });
      onSaved(title || `#${photo.id}`);
    } catch (err) {
      if (!onError(err)) setSaveError(`Lưu ảnh thất bại — ${describeApiError(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!photo} onClose={onClose} title={`Chỉnh sửa: ${photo.title ?? `#${photo.id}`}`}>
      <div className="space-y-4">
        {saveError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{saveError}</p>
        )}
        <div>
          <label className={labelCls}>Tiêu đề</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Mô tả</label>
          <textarea
            className={inputCls}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Alt text</label>
          <input className={inputCls} value={altText} onChange={(e) => setAltText(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Thứ tự hiển thị</label>
            <input
              type="number"
              className={inputCls}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 accent-[#6B8E5A]"
              />
              Ảnh nổi bật
            </label>
          </div>
        </div>
        <div>
          <label className={labelCls}>Danh mục (có thể chọn nhiều)</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCat(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  catIds.includes(c.id)
                    ? "bg-[#6B8E5A] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <Btn variant="ghost" onClick={onClose}>
            Hủy
          </Btn>
          <Btn onClick={save} disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </Btn>
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

function PhotoZoomModal({
  photo,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] max-w-[95vw] flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng phóng to"
          className="absolute -top-10 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
        >
          ✕
        </button>

        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Ảnh trước"
            className="absolute -left-12 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white transition hover:bg-white/40 md:-left-16"
          >
            ‹
          </button>
        )}

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Ảnh tiếp theo"
            className="absolute -right-12 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white transition hover:bg-white/40 md:-right-16"
          >
            ›
          </button>
        )}

        <div className="overflow-hidden rounded-xl shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- Full-size preview in Admin */}
          <img
            src={photo.imageUrl}
            alt={photo.altText ?? pTitle(photo)}
            className="max-h-[82vh] max-w-[90vw] object-contain"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/80">
          <p className="text-sm font-semibold text-white">{pTitle(photo)}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {photo.categories.map((c) => (
              <span key={c.id} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white">
                {categoryLabel(c)}
              </span>
            ))}
            <span className="ml-2 text-white/60">Thứ tự: {photo.sortOrder}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function pTitle(photo: Photo): string {
  return photo.title || "(không tiêu đề)";
}
