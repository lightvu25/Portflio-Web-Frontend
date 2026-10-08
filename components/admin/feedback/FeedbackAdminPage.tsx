"use client";

import { useEffect, useRef, useState } from "react";
import { attachFeedbackImage, deleteFeedback, getAdminFeedback, updateFeedback } from "@/lib/api/feedback";
import { useAdmin } from "@/lib/auth/useAdmin";
import { formatDateTime } from "@/lib/labels";
import type { Feedback } from "@/types/feedback";
import { Badge, Btn, Card, EmptyState, Spinner } from "@/components/admin/ui";

/** Feedback admin — publish/unpublish, attach image, delete. */
export function AdminFeedbackPage() {
  const { token, ready, onApiError } = useAdmin();
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const imageTarget = useRef<number | null>(null);

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
    act(f.id, () => updateFeedback(token!, f.id, { customerName: f.customerName, isPublished: !f.isPublished }), "Cập nhật thất bại");

  const onPickImage = async (file: File | undefined) => {
    if (!file || !token || imageTarget.current == null) return;
    const id = imageTarget.current;
    await act(id, () => attachFeedbackImage(token, id, file), "Tải ảnh cảm nhận thất bại");
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Cảm nhận khách hàng ({items.length})</h2>
          <Btn variant="ghost" onClick={() => token && load(token)}>Làm mới</Btn>
        </div>
        {loading ? (
          <div className="flex justify-center py-14"><Spinner /></div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <EmptyState title="Chưa có cảm nhận" hint="Cảm nhận được gửi từ trang công khai, chờ duyệt." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((f) => (
              <article key={f.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  {f.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary feedback image
                    <img src={f.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl text-gray-300">✎</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-800">{f.customerName}</p>
                      <Badge color={f.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {f.isPublished ? "Đã đăng" : "Chờ duyệt"}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">{f.content}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{formatDateTime(f.createdAt)} · Thứ tự: {f.sortOrder}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Btn variant={f.isPublished ? "ghost" : "success"} disabled={busy === f.id} className="px-2.5 py-1 text-xs" onClick={() => togglePublish(f)}>
                    {f.isPublished ? "Ẩn" : "Duyệt đăng"}
                  </Btn>
                  <Btn
                    variant="ghost"
                    disabled={busy === f.id}
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
                    disabled={busy === f.id}
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
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
