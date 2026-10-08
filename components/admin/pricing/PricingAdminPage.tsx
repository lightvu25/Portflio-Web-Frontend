"use client";

import { useEffect, useState } from "react";
import { createPricingPackage, deletePricingPackage, getAdminPricing, updatePricingPackage } from "@/lib/api/pricing";
import { ApiError } from "@/lib/api/client";
import { useAdmin } from "@/lib/auth/useAdmin";
import { formatVnd, sessionTypeLabel } from "@/lib/labels";
import type { SessionType } from "@/types/booking";
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
    setForm({ name: "", groupSize: 1, sessionType: "HALF_DAY", price: 0, description: "", sortOrder: items.length + 1, isActive: true });
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
    });
    setModalOpen(true);
  };

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
              <div className="flex items-start justify-between gap-3">
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
    </Card>
  );
}
