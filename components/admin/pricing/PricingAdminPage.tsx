"use client";

import { useEffect, useState } from "react";
import { createPricingPackage, deletePricingPackage, getAdminPricing, updatePricingPackage } from "@/lib/api/pricing";
import { getAdminCategories } from "@/lib/api/categories";
import { getAdminPhotos } from "@/lib/api/photos";
import { ApiError } from "@/lib/api/client";
import { useAdmin } from "@/lib/auth/useAdmin";
import { categoryLabel, formatVnd, isAdminCategory, sessionTypeLabel } from "@/lib/labels";
import type { SessionType } from "@/types/booking";
import type { Category } from "@/types/category";
import type { Photo } from "@/types/photo";
import type { PricingPackage, PricingPackageRequest } from "@/types/pricing";
import { Badge, Btn, Card, inputCls, labelCls, Modal, Spinner } from "@/components/admin/ui";

/** Pricing admin — CRUD over /api/admin/pricing. VND amounts from backend. */
export function AdminPricingPage() {
  const { token, ready, onApiError } = useAdmin();
  const [items, setItems] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PricingPackage | null>(null);
  const [form, setForm] = useState<PricingPackageRequest>({
    name: "", groupSize: 1, sessionType: "HALF_DAY", price: 0, sortOrder: 0, isActive: true,
  });
  const [saving, setSaving] = useState(false);
  /** Photo library for the cover picker — loaded lazily on first open. */
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [pickerCats, setPickerCats] = useState<Category[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCatId, setPickerCatId] = useState<number | null>(null);
  /** Preview of the selected cover so it shows even before photos load. */
  const [coverPreview, setCoverPreview] = useState<{ id: number; url: string } | null>(null);

  const load = async (t: string) => {
    setLoading(true);
    try {
      setItems(await getAdminPricing(t));
      setError(null);
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được bảng giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && token) queueMicrotask(() => load(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", groupSize: 1, sessionType: "HALF_DAY", price: 0, description: "", sortOrder: items.length + 1, isActive: true, coverPhotoId: null });
    setCoverPreview(null);
    setModalOpen(true);
  };

  const openEdit = (p: PricingPackage) => {
    setEditing(p);
    setForm({
      name: p.name,
      groupSize: p.groupSize,
      sessionType: p.sessionType,
      price: p.price,
      description: p.description ?? "",
      sortOrder: p.sortOrder,
      isActive: p.isActive,
      coverPhotoId: p.coverPhotoId,
    });
    setCoverPreview(p.coverPhotoId != null && p.coverImageUrl ? { id: p.coverPhotoId, url: p.coverImageUrl } : null);
    setModalOpen(true);
  };

  const openPicker = async () => {
    setPickerOpen(true);
    setPickerCatId(null);
    if (photos || !token) return;
    try {
      const [p, c] = await Promise.all([getAdminPhotos(token), getAdminCategories(token)]);
      setPhotos(p);
      setPickerCats(c);
    } catch (err) {
      if (!onApiError(err)) alert("Không tải được thư viện ảnh.");
      setPickerOpen(false);
    }
  };

  const pickCover = (p: Photo) => {
    set("coverPhotoId", p.id);
    setCoverPreview({ id: p.id, url: p.thumbnailUrl ?? p.imageUrl });
    setPickerOpen(false);
  };

  // Package categories first — they're the intended cover library. Photos in
  // the reserved Admin category are excluded: that image is for the homepage
  // About section only and must never surface on public pages.
  const pickerPhotos = (photos ?? []).filter(
    (p) =>
      !p.categories.some(isAdminCategory) &&
      (pickerCatId == null || p.categories.some((c) => c.id === pickerCatId)),
  );

  const save = async () => {
    if (!token || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await updatePricingPackage(token, editing.id, form);
      else await createPricingPackage(token, form);
      setModalOpen(false);
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Lưu gói thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: PricingPackage) => {
    if (!token) return;
    if (!window.confirm(`Xóa gói "${p.name}"?`)) return;
    try {
      await deletePricingPackage(token, p.id);
      await load(token);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        alert("Gói đang được booking sử dụng — hãy tắt kích hoạt thay vì xóa.");
      } else if (!onApiError(err)) {
        alert("Xóa gói thất bại.");
      }
    }
  };

  const set = <K extends keyof PricingPackageRequest>(k: K, v: PricingPackageRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Bảng giá ({items.length})</h2>
        <Btn onClick={openCreate}>+ Thêm gói</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((p) => (
            <article key={p.id} className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                {p.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL
                  <img src={p.coverImageUrl} alt={p.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400">
                    Chưa có ảnh
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-gray-900">{p.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {sessionTypeLabel[p.sessionType as SessionType]} · {p.groupSize} người · Thứ tự {p.sortOrder}
                  </p>
                </div>
                <Badge color={p.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}>
                  {p.isActive ? "Đang bán" : "Tạm ẩn"}
                </Badge>
              </div>
              <p className="mt-3 text-2xl font-bold text-green-600">{formatVnd(p.price)}</p>
              {p.description && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{p.description}</p>}
              <div className="mt-4 flex gap-2">
                <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => openEdit(p)}>Sửa</Btn>
                <Btn variant="danger" className="px-2.5 py-1 text-xs" onClick={() => remove(p)}>Xóa</Btn>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa gói" : "Thêm gói"}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Tên gói</label>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Solo Half Day" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Số người</label>
              <input type="number" min={1} className={inputCls} value={form.groupSize} onChange={(e) => set("groupSize", Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Loại buổi</label>
              <select className={inputCls} value={form.sessionType} onChange={(e) => set("sessionType", e.target.value as SessionType)}>
                <option value="HALF_DAY">Nửa ngày</option>
                <option value="FULL_DAY">Cả ngày</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Giá (VNĐ)</label>
              <input type="number" min={0} step={100000} className={inputCls} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
            </div>
            <div>
              <label className={labelCls}>Thứ tự</label>
              <input type="number" className={inputCls} value={form.sortOrder ?? 0} onChange={(e) => set("sortOrder", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Mô tả</label>
            <textarea className={inputCls} rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Ảnh gói dịch vụ</label>
            <div className="flex items-center gap-3">
              {coverPreview && form.coverPhotoId != null ? (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL
                <img src={coverPreview.url} alt="Ảnh gói" className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[10px] text-gray-400">
                  Chưa chọn
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={openPicker}>Chọn ảnh</Btn>
                {form.coverPhotoId != null && (
                  <button
                    type="button"
                    className="text-left text-xs text-red-500 hover:text-red-600"
                    onClick={() => { set("coverPhotoId", null); setCoverPreview(null); }}
                  >
                    Bỏ ảnh
                  </button>
                )}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 accent-green-600" />
            Đang bán (hiển thị công khai)
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Btn>
            <Btn onClick={save} disabled={saving || !form.name.trim()}>{saving ? "Đang lưu…" : "Lưu"}</Btn>
          </div>
        </div>
      </Modal>

      {/* Cover photo picker — existing photo library, package categories first */}
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Chọn ảnh gói dịch vụ">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setPickerCatId(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${pickerCatId == null ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tất cả
          </button>
          {[...pickerCats].filter((c) => !isAdminCategory(c)).sort((a, b) => Number(b.type === "PACKAGE") - Number(a.type === "PACKAGE")).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setPickerCatId(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${pickerCatId === c.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
        {photos == null ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : pickerPhotos.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Không có ảnh nào trong danh mục này.</p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {pickerPhotos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickCover(p)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                  form.coverPhotoId === p.id ? "border-green-500" : "border-transparent hover:border-gray-300"
                }`}
                title={p.title ?? `#${p.id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail URL */}
                <img src={p.thumbnailUrl ?? p.imageUrl} alt={p.altText ?? p.title ?? "Ảnh"} className="h-full w-full object-cover" />
                {p.status === "DRAFT" && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Nháp</span>
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
}
