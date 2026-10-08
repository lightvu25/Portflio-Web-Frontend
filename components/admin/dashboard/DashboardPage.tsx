"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminBookings } from "@/lib/api/bookings";
import { getAdminFeedback } from "@/lib/api/feedback";
import { getPayments } from "@/lib/api/payments";
import { getAdminPhotos } from "@/lib/api/photos";
import { useAdmin } from "@/lib/auth/useAdmin";
import { bookingStatusColor, bookingStatusLabel, formatDateTime } from "@/lib/labels";
import type { Booking } from "@/types/booking";
import type { Feedback } from "@/types/feedback";
import type { PaymentResponse } from "@/types/payment";
import type { Photo } from "@/types/photo";
import { Badge, Card, Spinner, StatCard } from "@/components/admin/ui";

interface Data {
  photos: Photo[];
  bookings: Booking[];
  payments: PaymentResponse[];
  feedback: Feedback[];
}

/** Dashboard — stats derived only from existing list endpoints. */
export function AdminDashboardPage() {
  const { token, ready, onApiError } = useAdmin();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    Promise.all([
      getAdminPhotos(token),
      getAdminBookings(token),
      getPayments(token),
      getAdminFeedback(token),
    ])
      .then(([photos, bookings, payments, feedback]) => setData({ photos, bookings, payments, feedback }))
      .catch((err) => {
        if (!onApiError(err)) setError("Không tải được dữ liệu tổng quan.");
      });
  }, [ready, token, onApiError]);

  if (error) return <Card><p className="text-sm text-red-600">{error}</p></Card>;
  if (!data)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const published = data.photos.filter((p) => p.status === "PUBLISHED").length;
  const pendingBookings = data.bookings.filter((b) => b.status === "PENDING").length;
  const unpaid = data.payments.filter((p) => p.status === "UNPAID").length;
  const pendingFeedback = data.feedback.filter((f) => !f.isPublished).length;
  const recent = [...data.bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ảnh đã đăng" value={`${published} / ${data.photos.length}`} sub="Đã đăng / tổng" />
        <StatCard label="Booking chờ xử lý" value={pendingBookings} sub={`${data.bookings.length} tổng booking`} />
        <StatCard label="Thanh toán chưa nhận" value={unpaid} sub={`${data.payments.length} khoản`} />
        <StatCard label="Cảm nhận chờ duyệt" value={pendingFeedback} sub={`${data.feedback.length} tổng`} />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Booking gần đây</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-green-600 hover:text-green-800">
            Xem tất cả →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Chưa có booking nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Khách hàng</th>
                  <th className="pb-3 pr-4 font-medium">Mã booking</th>
                  <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                  <th className="pb-3 font-medium">Thời gian tạo</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-800">{b.customerName}</td>
                    <td className="py-3 pr-4 text-gray-500">{b.bookingCode}</td>
                    <td className="py-3 pr-4">
                      <Badge color={bookingStatusColor[b.status]}>{bookingStatusLabel[b.status]}</Badge>
                    </td>
                    <td className="py-3 text-gray-500">{formatDateTime(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
