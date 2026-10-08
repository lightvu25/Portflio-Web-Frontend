"use client";

import { useEffect, useState } from "react";
import { createCategory, deleteCategory, getAdminCategories, updateCategory } from "@/lib/api/categories";
import { useAdmin } from "@/lib/auth/useAdmin";
import type { Category } from "@/types/category";
import { Btn, Card, EmptyState, inputCls, labelCls, Modal, Spinner } from "@/components/admin/ui";

/** Categories admin — list + create/edit/delete via /api/admin/categories. */
export function AdminCategoriesPage() {
  const { token, ready, onApiError } = useAdmin();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = async (t: string) => {
    setLoading(true);
    try {
      setItems(await getAdminCategories(t));
      setError(null);
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được danh mục.");
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
    setName("");
    setSlug("");
    setSortOrder(items.length + 1);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setSortOrder(c.sortOrder);
    setModalOpen(true);
  };

  const save = async () => {
    if (!token || !name.trim()) return;
    setSaving(true);
    try {
      const body = { name: name.trim(), slug: slug.trim() || undefined, sortOrder };
      if (editing) await updateCategory(token, editing.id, body);
      else await createCategory(token, body);
      setModalOpen(false);
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Lưu danh mục thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!token) return;
    if (!window.confirm(`Xóa danh mục "${c.name}"? Ảnh thuộc danh mục sẽ mất liên kết.`)) return;
    try {
      await deleteCategory(token, c.id);
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Xóa danh mục thất bại.");
    }
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Danh mục ảnh ({items.length})</h2>
        <Btn onClick={openCreate}>+ Thêm danh mục</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có danh mục" hint="Tạo danh mục đầu tiên (vd: Chân dung, Cặp đôi…)." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="pb-3 pr-4 font-medium">Tên</th>
                <th className="pb-3 pr-4 font-medium">Slug</th>
                <th className="pb-3 pr-4 font-medium">Thứ tự</th>
                <th className="pb-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-800">{c.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{c.slug}</td>
                  <td className="py-3 pr-4 text-gray-500">{c.sortOrder}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Btn variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => openEdit(c)}>Sửa</Btn>
                      <Btn variant="danger" className="px-2.5 py-1 text-xs" onClick={() => remove(c)}>Xóa</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sửa danh mục" : "Thêm danh mục"}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Tên danh mục</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Chân dung" />
          </div>
          <div>
            <label className={labelCls}>Slug (để trống sẽ tự tạo)</label>
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="chan-dung" />
          </div>
          <div>
            <label className={labelCls}>Thứ tự hiển thị</label>
            <input type="number" className={inputCls} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Btn>
            <Btn onClick={save} disabled={saving || !name.trim()}>{saving ? "Đang lưu…" : "Lưu"}</Btn>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
