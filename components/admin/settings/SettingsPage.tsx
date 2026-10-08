"use client";

import { useEffect, useState } from "react";
import { getAdminSiteSettings, updateSiteSettings } from "@/lib/api/site";
import { useAdmin } from "@/lib/auth/useAdmin";
import type { SiteSettings, SiteSettingsRequest } from "@/types/site";
import { Btn, Card, inputCls, labelCls, Spinner } from "@/components/admin/ui";

/** Settings admin — public site settings only; no server secrets exposed. */
export function AdminSettingsPage() {
  const { token, ready, onApiError } = useAdmin();
  const [form, setForm] = useState<SiteSettingsRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    getAdminSiteSettings(token)
      .then((s: SiteSettings) =>
        setForm({
          photographerName: s.photographerName,
          experience: s.experience ?? "",
          bio: s.bio ?? "",
          facebookUrl: s.facebookUrl ?? "",
          instagramUrl: s.instagramUrl ?? "",
          messengerUrl: s.messengerUrl ?? "",
          heroImageUrl: s.heroImageUrl ?? "",
          profileImageUrl: s.profileImageUrl ?? "",
          depositAmount: s.depositAmount,
          equipment: s.equipment ?? "",
        }),
      )
      .catch((err) => {
        if (!onApiError(err)) {
          // 404 = no settings row yet — start with defaults.
          setForm({ photographerName: "Bấu Chụp Choẹt", depositAmount: 500000 });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const save = async () => {
    if (!token || !form) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateSiteSettings(token, form);
      setMessage("Đã lưu cài đặt.");
    } catch (err) {
      if (!onApiError(err)) setError("Lưu cài đặt thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return (
      <div className="flex justify-center py-20"><Spinner /></div>
    );

  const set = (k: keyof SiteSettingsRequest, v: string | number) => setForm({ ...form, [k]: v });

  return (
    <Card>
      <h2 className="mb-1 text-base font-bold text-gray-900">Cài đặt website</h2>
      <p className="mb-6 text-sm text-gray-500">
        Thông tin công khai hiển thị trên trang chính. Không chứa cấu hình bảo mật.
      </p>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelCls}>Tên nhiếp ảnh gia</label>
          <input className={inputCls} value={form.photographerName} onChange={(e) => set("photographerName", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Kinh nghiệm</label>
          <input className={inputCls} value={form.experience ?? ""} onChange={(e) => set("experience", e.target.value)} placeholder="5+ năm chụp ảnh" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Giới thiệu</label>
          <textarea className={inputCls} rows={4} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Facebook URL</label>
          <input className={inputCls} value={form.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Instagram URL</label>
          <input className={inputCls} value={form.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Messenger URL</label>
          <input className={inputCls} value={form.messengerUrl ?? ""} onChange={(e) => set("messengerUrl", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Tiền cọc (VNĐ)</label>
          <input type="number" min={0} className={inputCls} value={form.depositAmount ?? 0} onChange={(e) => set("depositAmount", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Ảnh hero URL</label>
          <input className={inputCls} value={form.heroImageUrl ?? ""} onChange={(e) => set("heroImageUrl", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Ảnh chân dung URL</label>
          <input className={inputCls} value={form.profileImageUrl ?? ""} onChange={(e) => set("profileImageUrl", e.target.value)} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Btn onClick={save} disabled={saving}>{saving ? "Đang lưu…" : "Lưu cài đặt"}</Btn>
      </div>
    </Card>
  );
}
