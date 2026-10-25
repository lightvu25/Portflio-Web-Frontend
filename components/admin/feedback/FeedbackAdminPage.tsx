"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  attachFeedbackImage,
  deleteFeedback,
  getAdminFeedback,
  updateFeedback,
} from "@/lib/api/feedback";
import { useAdmin } from "@/lib/auth/useAdmin";
import { formatDateTime } from "@/lib/labels";
import type { Feedback } from "@/types/feedback";
import { AdminCheckbox, Badge, Btn, Card, EmptyState, Spinner } from "@/components/admin/ui";

type StatusFilter = "ALL" | "PENDING" | "PUBLISHED";

/** Feedback admin — publish/unpublish (single & bulk), attach image, delete. */
export function AdminFeedbackPage() {
  const { token, ready, onApiError } = useAdmin();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkStatusText, setBulkStatusText] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const imageTarget = useRef<number | null>(null);
  const lastClickedIdRef = useRef<number | null>(null);

  const load = async (t: string) => {
    setLoading(true);
    try {
      setItems(await getAdminFeedback(t));
      setError(null);
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được cảm nhận.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && token) queueMicrotask(() => load(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const visibleItems = useMemo(() => {
    if (statusFilter === "ALL") return items;
    if (statusFilter === "PUBLISHED") return items.filter((f) => f.isPublished);
    return items.filter((f) => !f.isPublished);
  }, [items, statusFilter]);

  const publishedCount = useMemo(() => items.filter((f) => f.isPublished).length, [items]);
  const pendingCount = items.length - publishedCount;

  const selectedItems = useMemo(
    () => items.filter((f) => selected.has(f.id)),
    [items, selected],
  );
  const pendingSelected = useMemo(
    () => selectedItems.filter((f) => !f.isPublished),
    [selectedItems],
  );
  const publishedSelected = useMemo(
    () => selectedItems.filter((f) => f.isPublished),
    [selectedItems],
  );

  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((f) => selected.has(f.id));

  const toggleSelect = (id: number, shiftKey = false) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const shouldSelect = !next.has(id);
      if (shiftKey && lastClickedIdRef.current != null) {
        const ids = visibleItems.map((f) => f.id);
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

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleItems.forEach((f) => next.delete(f.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleItems.forEach((f) => next.add(f.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelected(new Set());
    lastClickedIdRef.current = null;
  };

  const act = async (id: number, fn: () => Promise<unknown>, errMsg: string) => {
    if (!token) return;
    setBusy(id);
    try {
      await fn();
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert(errMsg);
    } finally {
      setBusy(null);
    }
  };

  const togglePublish = (f: Feedback) =>
    act(
      f.id,
      () =>
        updateFeedback(token!, f.id, {
          customerName: f.customerName,
          isPublished: !f.isPublished,
        }),
      "Cập nhật thất bại",
    );

  const onPickImage = async (file: File | undefined) => {
    if (!file || !token || imageTarget.current == null) return;
    const id = imageTarget.current;
    await act(id, () => attachFeedbackImage(token, id, file), "Tải ảnh cảm nhận thất bại");
  };

  const bulkSetPublished = async (targetPublished: boolean) => {
    if (!token || bulkBusy) return;
    const targets = targetPublished ? pendingSelected : publishedSelected;
    if (targets.length === 0) return;
    const verb = targetPublished ? "duyệt đăng" : "ẩn";
    if (!window.confirm(`Bạn có chắc muốn ${verb} ${targets.length} cảm nhận đã chọn?`)) return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < targets.length; i++) {
      const f = targets[i];
      setBulkStatusText(`Đang ${verb} ${i + 1}/${targets.length}…`);
      try {
        await updateFeedback(token, f.id, {
          customerName: f.customerName,
          isPublished: targetPublished,
        });
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
          ? `Đã ${verb} ${ok} cảm nhận.`
          : `Đã ${verb} ${ok} cảm nhận, ${fail} lỗi.`,
    });
    await load(token);
  };

  const bulkDeleteSelected = async () => {
    if (!token || selected.size === 0 || bulkBusy) return;
    const ids = [...selected];
    if (!window.confirm(`Xóa vĩnh viễn ${ids.length} cảm nhận đã chọn?`)) return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBulkStatusText(`Đang xóa ${i + 1}/${ids.length}…`);
      try {
        await deleteFeedback(token, ids[i]);
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
          ? `Đã xóa ${ok} cảm nhận.`
          : `Đã xóa ${ok} cảm nhận, ${fail} lỗi.`,
    });
    await load(token);
  };

  return (
    <div className="space-y-6">
      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onPickImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Cảm nhận khách hàng ({items.length})
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Tích chọn để duyệt đăng toàn bộ hoặc xóa nhanh nhiều cảm nhận cùng lúc.
            </p>
          </div>
          <Btn variant="ghost" onClick={() => token && load(token)}>
            Làm mới
          </Btn>
        </div>

        {/* Filter pills & Bulk action bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="inline-flex flex-wrap rounded-xl bg-gray-100 p-1 text-xs">
            {(
              [
                { id: "ALL", label: `Tất cả (${items.length})` },
                { id: "PENDING", label: `Chờ duyệt (${pendingCount})` },
                { id: "PUBLISHED", label: `Đã đăng (${publishedCount})` },
              ] as { id: StatusFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  clearSelection();
                }}
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

          <div className="flex flex-wrap items-center gap-2">
            <Btn
              variant="ghost"
              className="px-2.5 py-1.5 text-xs"
              disabled={bulkBusy || visibleItems.length === 0}
              onClick={toggleSelectAllVisible}
            >
              {allVisibleSelected
                ? "Bỏ chọn trang này"
                : `Chọn tất cả (${visibleItems.length})`}
            </Btn>
            {selected.size > 0 && (
              <>
                <Btn
                  variant="ghost"
                  className="px-2.5 py-1.5 text-xs"
                  disabled={bulkBusy}
                  onClick={clearSelection}
                >
                  Bỏ chọn ({selected.size})
                </Btn>
                {pendingSelected.length > 0 && (
                  <Btn
                    variant="success"
                    className="px-3 py-1.5 text-xs"
                    disabled={bulkBusy}
                    onClick={() => bulkSetPublished(true)}
                  >
                    {bulkStatusText && bulkStatusText.startsWith("Đang duyệt")
                      ? bulkStatusText
                      : `Duyệt đăng (${pendingSelected.length})`}
                  </Btn>
                )}
                {publishedSelected.length > 0 && (
                  <Btn
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    disabled={bulkBusy}
                    onClick={() => bulkSetPublished(false)}
                  >
                    {bulkStatusText && bulkStatusText.startsWith("Đang ẩn")
                      ? bulkStatusText
                      : `Ẩn (${publishedSelected.length})`}
                  </Btn>
                )}
                <Btn
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  disabled={bulkBusy}
                  onClick={bulkDeleteSelected}
                >
                  {bulkStatusText && bulkStatusText.startsWith("Đang xóa")
                    ? bulkStatusText
                    : `Xóa đã chọn (${selected.size})`}
                </Btn>
              </>
            )}
          </div>
        </div>

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

        {loading ? (
          <div className="flex justify-center py-14">
            <Spinner />
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : visibleItems.length === 0 ? (
          <EmptyState
            title="Chưa có cảm nhận"
            hint="Cảm nhận được gửi từ trang công khai, chờ duyệt."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleItems.map((f) => {
              const isSelected = selected.has(f.id);
              return (
                <article
                  key={f.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? "border-[#6B8E5A] bg-[#F4F7F2]/60 ring-1 ring-[#6B8E5A]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AdminCheckbox
                      checked={isSelected}
                      onChange={(shiftKey) => toggleSelect(f.id, shiftKey)}
                      label={`Chọn cảm nhận của ${f.customerName}`}
                      className="mt-0.5"
                    />
                    {f.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Cloudinary feedback image
                      <img
                        src={f.imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-300">
                        ✎
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {f.customerName}
                        </p>
                        <Badge
                          color={
                            f.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        >
                          {f.isPublished ? "Đã đăng" : "Chờ duyệt"}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">
                        {f.content}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatDateTime(f.createdAt)} · Thứ tự: {f.sortOrder}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-7">
                    <Btn
                      variant={f.isPublished ? "ghost" : "success"}
                      disabled={busy === f.id || bulkBusy}
                      className="px-2.5 py-1 text-xs"
                      onClick={() => togglePublish(f)}
                    >
                      {f.isPublished ? "Ẩn" : "Duyệt đăng"}
                    </Btn>
                    <Btn
                      variant="ghost"
                      disabled={busy === f.id || bulkBusy}
                      className="px-2.5 py-1 text-xs"
                      onClick={() => {
                        imageTarget.current = f.id;
                        imageInput.current?.click();
                      }}
                    >
                      Đính kèm ảnh
                    </Btn>
                    <Btn
                      variant="danger"
                      disabled={busy === f.id || bulkBusy}
                      className="px-2.5 py-1 text-xs"
                      onClick={() => {
                        if (window.confirm(`Xóa cảm nhận của "${f.customerName}"?`))
                          act(f.id, () => deleteFeedback(token!, f.id), "Xóa thất bại");
                      }}
                    >
                      Xóa
                    </Btn>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
