"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { confirmBooking, deleteBooking, getAdminBookings } from "@/lib/api/bookings";
import { getAdminFeedback } from "@/lib/api/feedback";
import { getPayments } from "@/lib/api/payments";
import { getAdminPhotos } from "@/lib/api/photos";
import { useAdmin } from "@/lib/auth/useAdmin";
import { bookingStatusColor, bookingStatusLabel, formatDateTime } from "@/lib/labels";
import type { Booking } from "@/types/booking";
import type { Feedback } from "@/types/feedback";
import type { PaymentResponse } from "@/types/payment";
import type { Photo } from "@/types/photo";
import { AdminCheckbox, Badge, Btn, Card, Spinner, StatCard } from "@/components/admin/ui";

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
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = (t: string) => {
    Promise.all([
      getAdminPhotos(t),
      getAdminBookings(t),
      getPayments(t),
      getAdminFeedback(t),
    ])
      .then(([photos, bookings, payments, feedback]) =>
        setData({ photos, bookings, payments, feedback }),
      )
      .catch((err) => {
        if (!onApiError(err)) setError("Không tải được dữ liệu tổng quan.");
      });
  };

  useEffect(() => {
    if (!ready || !token) return;
    load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const recent = useMemo(
    () =>
      data
        ? [...data.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
        : [],
    [data],
  );

  const pendingSelectedIds = useMemo(
    () => recent.filter((b) => selected.has(b.id) && b.status === "PENDING").map((b) => b.id),
    [recent, selected],
  );

  const allRecentSelected = recent.length > 0 && recent.every((b) => selected.has(b.id));

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    if (allRecentSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(recent.map((b) => b.id)));
    }
  };

  const removeBooking = async (b: Booking) => {
    if (!token || !confirm(`Xóa booking "${b.bookingCode}" của khách "${b.customerName}"?`))
      return;
    setBusyId(b.id);
    try {
      await deleteBooking(token, b.id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(b.id);
        return next;
      });
      load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Xóa booking thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  const bulkConfirmRecent = async () => {
    if (!token || pendingSelectedIds.length === 0 || bulkBusy) return;
    if (!window.confirm(`Xác nhận ${pendingSelectedIds.length} booking đang chờ đã chọn?`)) return;
    setBulkBusy(true);
    for (const id of pendingSelectedIds) {
      try {
        await confirmBooking(token, id);
      } catch (err) {
        onApiError(err);
      }
    }
    setBulkBusy(false);
    setSelected(new Set());
    load(token);
  };

  const bulkDeleteRecent = async () => {
    if (!token || selected.size === 0 || bulkBusy) return;
    const ids = [...selected];
    if (!window.confirm(`Xóa ${ids.length} booking đã chọn?`)) return;
    setBulkBusy(true);
    for (const id of ids) {
      try {
        await deleteBooking(token, id);
      } catch (err) {
        onApiError(err);
      }
    }
    setBulkBusy(false);
    setSelected(new Set());
    load(token);
  };

  if (error)
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ảnh đã đăng"
          value={`${published} / ${data.photos.length}`}
          sub="Đã đăng / tổng"
        />
        <StatCard
          label="Booking chờ xử lý"
          value={pendingBookings}
          sub={`${data.bookings.length} tổng booking`}
        />
        <StatCard
          label="Thanh toán chưa nhận"
          value={unpaid}
          sub={`${data.payments.length} khoản`}
        />
        <StatCard
          label="Cảm nhận chờ duyệt"
          value={pendingFeedback}
          sub={`${data.feedback.length} tổng`}
        />
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">Booking gần đây</h2>
            {selected.size > 0 && (
              <>
                {pendingSelectedIds.length > 0 && (
                  <Btn
                    variant="success"
                    className="px-2.5 py-1 text-xs"
                    disabled={bulkBusy}
                    onClick={bulkConfirmRecent}
                  >
                    Xác nhận đã chọn ({pendingSelectedIds.length})
                  </Btn>
                )}
                <Btn
                  variant="danger"
                  className="px-2.5 py-1 text-xs"
                  disabled={bulkBusy}
                  onClick={bulkDeleteRecent}
                >
                  Xóa đã chọn ({selected.size})
                </Btn>
              </>
            )}
          </div>
          <Link
            href="/admin/bookings"
            className="text-sm font-semibold text-green-600 hover:text-green-800"
          >
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
                  <th className="w-9 pb-3 pr-2">
                    <AdminCheckbox
                      checked={allRecentSelected}
                      onChange={toggleSelectAll}
                      label="Chọn tất cả booking gần đây"
                    />
                  </th>
                  <th className="pb-3 pr-4 font-medium">Khách hàng</th>
                  <th className="pb-3 pr-4 font-medium">Mã booking</th>
                  <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                  <th className="pb-3 pr-4 font-medium">Thời gian tạo</th>
                  <th className="pb-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => {
                  const isSelected = selected.has(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-gray-50 transition-colors last:border-0 ${
                        isSelected ? "bg-[#F4F7F2]" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <td className="py-3 pr-2">
                        <AdminCheckbox
                          checked={isSelected}
                          onChange={() => toggleSelect(b.id)}
                          label={`Chọn booking ${b.bookingCode}`}
                        />
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{b.customerName}</td>
                      <td className="py-3 pr-4 text-gray-500">{b.bookingCode}</td>
                      <td className="py-3 pr-4">
                        <Badge color={bookingStatusColor[b.status]}>
                          {bookingStatusLabel[b.status]}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{formatDateTime(b.createdAt)}</td>
                      <td className="py-3">
                        <Btn
                          variant="danger"
                          disabled={busyId === b.id || bulkBusy}
                          className="px-2.5 py-1 text-xs"
                          onClick={() => removeBooking(b)}
                        >
                          Xóa
                        </Btn>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
