"use client";

import { useEffect, useState } from "react";
import { cancelBooking, completeBooking, confirmBooking, getAdminBookings, getBookingStatus, rejectBooking } from "@/lib/api/bookings";
import { useAdmin } from "@/lib/auth/useAdmin";
import { bookingStatusColor, bookingStatusLabel, formatDateTime, sessionTypeLabel, slotLabel } from "@/lib/labels";
import type { Booking, BookingStatus } from "@/types/booking";
import { Badge, Btn, Card, EmptyState, Spinner } from "@/components/admin/ui";

/** Slots joined from the public booking-status endpoint (Booking JSON omits slots). */
interface SlotInfo {
  bookingDate: string;
  slot: "MORNING" | "AFTERNOON";
}
type SlotsMap = Record<string, SlotInfo[]>;

/** Valid transitions per backend state machine — no arbitrary edits. */
const actions: Partial<Record<BookingStatus, { label: string; run: (t: string, id: number) => Promise<Booking>; variant: "primary" | "success" | "danger" }[]>> = {
  PENDING: [
    { label: "Xác nhận", run: confirmBooking, variant: "success" },
    { label: "Từ chối", run: rejectBooking, variant: "danger" },
  ],
  CONFIRMED: [
    { label: "Hoàn thành", run: completeBooking, variant: "primary" },
    { label: "Hủy", run: cancelBooking, variant: "danger" },
  ],
};

export function AdminBookingsPage() {
  const { token, ready, onApiError } = useAdmin();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<SlotsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async (t: string) => {
    setLoading(true);
    try {
      const list = await getAdminBookings(t);
      setBookings(list);
      setError(null);
      // Fetch slot/date info per booking (public status endpoint).
      const entries = await Promise.all(
        list.map(async (b) => {
          try {
            const s = await getBookingStatus(b.bookingCode);
            return [b.bookingCode, s.slots] as const;
          } catch {
            return [b.bookingCode, []] as const;
          }
        }),
      );
      setSlots(Object.fromEntries(entries));
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được lịch đặt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && token) queueMicrotask(() => load(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const run = async (b: Booking, fn: (t: string, id: number) => Promise<Booking>) => {
    if (!token) return;
    setBusy(b.id);
    try {
      await fn(token, b.id);
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Thao tác thất bại.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Lịch đặt ({bookings.length})</h2>
        <Btn variant="ghost" onClick={() => token && load(token)}>Làm mới</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      ) : bookings.length === 0 ? (
        <EmptyState title="Chưa có booking" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="pb-3 pr-4 font-medium">Khách hàng</th>
                <th className="pb-3 pr-4 font-medium">Liên hệ</th>
                <th className="pb-3 pr-4 font-medium">Gói</th>
                <th className="pb-3 pr-4 font-medium">Ngày / Buổi</th>
                <th className="pb-3 pr-4 font-medium">Địa chỉ</th>
                <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                <th className="pb-3 pr-4 font-medium">Tạo lúc</th>
                <th className="pb-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const slotList = slots[b.bookingCode] ?? [];
                return (
                  <tr key={b.id} className="border-b border-gray-50 align-top last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-800">{b.customerName}</p>
                      <p className="text-xs text-gray-400">{b.bookingCode}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      <p>{b.phone}</p>
                      {b.instagram && <p className="text-xs text-green-500">@{b.instagram.replace(/^@/, "")}</p>}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {b.pricingPackage ? (
                        <>
                          <p className="font-medium text-gray-800">{b.pricingPackage.name}</p>
                          <p className="text-xs text-gray-400">
                            {sessionTypeLabel[b.pricingPackage.sessionType]} · {b.pricingPackage.groupSize} người
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {slotList.length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        slotList.map((s, i) => (
                          <p key={i} className="whitespace-nowrap">
                            {new Date(s.bookingDate).toLocaleDateString("vi-VN")} · {slotLabel[s.slot]}
                          </p>
                        ))
                      )}
                    </td>
                    <td className="max-w-[180px] py-3 pr-4 text-gray-600"><p className="truncate">{b.address}</p></td>
                    <td className="py-3 pr-4">
                      <Badge color={bookingStatusColor[b.status]}>{bookingStatusLabel[b.status]}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{formatDateTime(b.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(actions[b.status] ?? []).map((a) => (
                          <Btn key={a.label} variant={a.variant} disabled={busy === b.id} className="px-2.5 py-1 text-xs" onClick={() => run(b, a.run)}>
                            {a.label}
                          </Btn>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
