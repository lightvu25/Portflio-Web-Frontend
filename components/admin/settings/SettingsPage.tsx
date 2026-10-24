"use client";

import { useEffect, useState } from "react";
import { CONTACT, resolveZaloPhone } from "@/components/shared/contact";
import { getAdminSiteSettings, updateSiteSettings } from "@/lib/api/site";
import { describeApiError } from "@/lib/api/client";
import { getAdminPhotos } from "@/lib/api/photos";
import { useAdmin } from "@/lib/auth/useAdmin";
import { isAdminCategory } from "@/lib/labels";
import type { Photo } from "@/types/photo";
import type { SiteSettings, SiteSettingsRequest } from "@/types/site";
import { Btn, Card, inputCls, labelCls, Spinner } from "@/components/admin/ui";

/** Settings admin — public site settings only; no server secrets exposed. */
export function AdminSettingsPage() {
  const { token, ready, onApiError } = useAdmin();
  const [form, setForm] = useState<SiteSettingsRequest | null>(null);
  const [adminPhotos, setAdminPhotos] = useState<Photo[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    getAdminPhotos(token).then(setAdminPhotos).catch(() => {});
    getAdminSiteSettings(token)
      .then((s: SiteSettings) =>
        setForm({
          photographerName: s.photographerName,
          experience: s.experience ?? "",
          bio: s.bio ?? "",
          facebookUrl: s.facebookUrl ?? "",
          instagramUrl: s.instagramUrl ?? "",
          messengerUrl: resolveZaloPhone(s.messengerUrl),
          heroImageUrl: s.heroImageUrl ?? "",
          profilePhotoId: s.profilePhoto?.id ?? null,
          depositAmount: s.depositAmount,
          equipment: s.equipment && s.equipment.trim() ? s.equipment : undefined,
        }),
      )
      .catch((err) => {
        if (!onApiError(err)) {
          // 404 = no settings row yet — start with defaults.
          setForm({
            photographerName: "Bấu Chụp Choẹt",
            messengerUrl: CONTACT.zalo,
            depositAmount: 500000,
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const save = async () => {
    if (!token || !form) return;
    setMessage(null);
    setError(null);
    const zaloPhone = (form.messengerUrl ?? "").trim();
    if (!/^\d{10}$/.test(zaloPhone)) {
      setError("Số điện thoại Zalo không hợp lệ — vui lòng nhập đúng 10 chữ số.");
      return;
    }
    setSaving(true);
    try {
      // A blank equipment must be omitted: the backend stores it in a jsonb column.
      await updateSiteSettings(token, {
        ...form,
        messengerUrl: zaloPhone,
        equipment: form.equipment && form.equipment.trim() ? form.equipment : undefined,
      });
      setMessage("Đã lưu cài đặt.");
    } catch (err) {
      if (!onApiError(err)) setError(`Lưu cài đặt thất bại — ${describeApiError(err)}`);
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return (
      <div className="flex justify-center py-20"><Spinner /></div>
    );

  const set = (k: keyof SiteSettingsRequest, v: string | number | null) => setForm({ ...form, [k]: v });

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
          <label className={labelCls}>Zalo (10 chữ số)</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern="[0-9]{10}"
            placeholder="Nhập 10 chữ số (0982246205)"
            className={inputCls}
            value={form.messengerUrl ?? ""}
            onChange={(e) =>
              set("messengerUrl", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
        </div>
        <div>
          <label className={labelCls}>Tiền cọc (VNĐ)</label>
          <input type="number" min={0} className={inputCls} value={form.depositAmount ?? 0} onChange={(e) => set("depositAmount", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Ảnh hero URL</label>
          <input className={inputCls} value={form.heroImageUrl ?? ""} onChange={(e) => set("heroImageUrl", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Ảnh giới thiệu (mục &ldquo;Tôi là&rdquo; trên trang chủ)</label>
          <p className="mb-2 text-xs text-gray-400">
            Chỉ chọn được ảnh thuộc danh mục Admin. Để trống = tự động lấy ảnh Admin đầu tiên đã đăng.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => set("profilePhotoId", null)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                form.profilePhotoId == null ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tự động
            </button>
            {adminPhotos.filter((p) => p.categories.some(isAdminCategory)).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set("profilePhotoId", p.id)}
                className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition ${
                  form.profilePhotoId === p.id ? "border-green-500" : "border-transparent hover:border-gray-300"
                }`}
                title={p.title ?? `#${p.id}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail URL */}
                <img src={p.thumbnailUrl ?? p.imageUrl} alt={p.altText ?? p.title ?? "Ảnh"} className="h-full w-full object-cover" />
                {p.status === "DRAFT" && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[10px] text-white">Nháp</span>
                )}
              </button>
            ))}
            {adminPhotos.length > 0 && !adminPhotos.some((p) => p.categories.some(isAdminCategory)) && (
              <p className="text-xs text-gray-400">
                Chưa có ảnh nào trong danh mục Admin — gán danh mục Admin cho ảnh trong mục Thư viện ảnh.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Btn onClick={save} disabled={saving}>{saving ? "Đang lưu…" : "Lưu cài đặt"}</Btn>
      </div>
    </Card>
  );
}
