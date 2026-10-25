"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  deleteBooking,
  getAdminBookings,
  getBookingStatus,
  rejectBooking,
} from "@/lib/api/bookings";
import { useAdmin } from "@/lib/auth/useAdmin";
import {
  bookingStatusColor,
  bookingStatusLabel,
  formatDateTime,
  sessionTypeLabel,
  slotLabel,
} from "@/lib/labels";
import type { Booking, BookingStatus } from "@/types/booking";
import { AdminCheckbox, Badge, Btn, Card, EmptyState, Spinner } from "@/components/admin/ui";

/** Slots joined from the public booking-status endpoint (Booking JSON omits slots). */
interface SlotInfo {
  bookingDate: string;
  slot: "MORNING" | "AFTERNOON";
}
type SlotsMap = Record<string, SlotInfo[]>;

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "OTHER";

/** Valid transitions per backend state machine — no arbitrary edits. */
const actions: Partial<
  Record<
    BookingStatus,
    {
      label: string;
      run: (t: string, id: number) => Promise<Booking>;
      variant: "primary" | "success" | "danger";
    }[]
  >
> = {
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkStatusText, setBulkStatusText] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const lastClickedIdRef = useRef<number | null>(null);

  const load = async (t: string) => {
    setLoading(true);
    try {
      const list = await getAdminBookings(t);
      setBookings(list);
      setError(null);
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

  const visibleBookings = useMemo(() => {
    if (statusFilter === "ALL") return bookings;
    if (statusFilter === "OTHER") {
      return bookings.filter(
        (b) => b.status === "REJECTED" || b.status === "CANCELLED" || b.status === "EXPIRED",
      );
    }
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const selectedBookings = useMemo(
    () => bookings.filter((b) => selected.has(b.id)),
    [bookings, selected],
  );
  const pendingSelectedIds = useMemo(
    () => selectedBookings.filter((b) => b.status === "PENDING").map((b) => b.id),
    [selectedBookings],
  );
  const confirmedSelectedIds = useMemo(
    () => selectedBookings.filter((b) => b.status === "CONFIRMED").map((b) => b.id),
    [selectedBookings],
  );

  const allVisibleSelected =
    visibleBookings.length > 0 && visibleBookings.every((b) => selected.has(b.id));

  const toggleSelect = (id: number, shiftKey = false) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const shouldSelect = !next.has(id);
      if (shiftKey && lastClickedIdRef.current != null) {
        const ids = visibleBookings.map((b) => b.id);
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
        visibleBookings.forEach((b) => next.delete(b.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleBookings.forEach((b) => next.add(b.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelected(new Set());
    lastClickedIdRef.current = null;
  };

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

  const remove = async (b: Booking) => {
    if (!token || !confirm(`Xóa booking "${b.bookingCode}" của khách "${b.customerName}"?`))
      return;
    setBusy(b.id);
    try {
      await deleteBooking(token, b.id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(b.id);
        return next;
      });
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Xóa booking thất bại.");
    } finally {
      setBusy(null);
    }
  };

  const runBulkAction = async (
    ids: number[],
    confirmMessage: string,
    progressPrefix: string,
    successVerb: string,
    actionFn: (t: string, id: number) => Promise<unknown>,
  ) => {
    if (!token || ids.length === 0 || bulkBusy) return;
    if (!window.confirm(confirmMessage)) return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBulkStatusText(`${progressPrefix} ${i + 1}/${ids.length}…`);
      try {
        await actionFn(token, ids[i]);
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
          ? `Đã ${successVerb} ${ok} lịch đặt.`
          : `Đã ${successVerb} ${ok} lịch đặt, ${fail} lịch lỗi.`,
    });
    await load(token);
  };

  const counts = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let other = 0;
    for (const b of bookings) {
      if (b.status === "PENDING") pending++;
      else if (b.status === "CONFIRMED") confirmed++;
      else if (b.status === "COMPLETED") completed++;
      else other++;
    }
    return { pending, confirmed, completed, other };
  }, [bookings]);

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Lịch đặt ({bookings.length})</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Tích chọn các dòng để xác nhận, hoàn thành hoặc xóa nhanh nhiều lịch đặt cùng lúc.
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
              { id: "ALL", label: `Tất cả (${bookings.length})` },
              { id: "PENDING", label: `Chờ xác nhận (${counts.pending})` },
              { id: "CONFIRMED", label: `Đã xác nhận (${counts.confirmed})` },
              { id: "COMPLETED", label: `Hoàn thành (${counts.completed})` },
              { id: "OTHER", label: `Hủy / Từ chối (${counts.other})` },
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
            disabled={bulkBusy || visibleBookings.length === 0}
            onClick={toggleSelectAllVisible}
          >
            {allVisibleSelected
              ? "Bỏ chọn trang này"
              : `Chọn tất cả (${visibleBookings.length})`}
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
              {pendingSelectedIds.length > 0 && (
                <>
                  <Btn
                    variant="success"
                    className="px-3 py-1.5 text-xs"
                    disabled={bulkBusy}
                    onClick={() =>
                      runBulkAction(
                        pendingSelectedIds,
                        `Xác nhận ${pendingSelectedIds.length} lịch đặt đang chờ?`,
                        "Đang xác nhận",
                        "xác nhận",
                        confirmBooking,
                      )
                    }
                  >
                    Xác nhận đã chọn ({pendingSelectedIds.length})
                  </Btn>
                  <Btn
                    variant="ghost"
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    disabled={bulkBusy}
                    onClick={() =>
                      runBulkAction(
                        pendingSelectedIds,
                        `Từ chối ${pendingSelectedIds.length} lịch đặt đang chờ?`,
                        "Đang từ chối",
                        "từ chối",
                        rejectBooking,
                      )
                    }
                  >
                    Từ chối ({pendingSelectedIds.length})
                  </Btn>
                </>
              )}
              {confirmedSelectedIds.length > 0 && (
                <>
                  <Btn
                    variant="primary"
                    className="px-3 py-1.5 text-xs"
                    disabled={bulkBusy}
                    onClick={() =>
                      runBulkAction(
                        confirmedSelectedIds,
                        `Đánh dấu hoàn thành ${confirmedSelectedIds.length} lịch đặt đã xác nhận?`,
                        "Đang hoàn thành",
                        "hoàn thành",
                        completeBooking,
                      )
                    }
                  >
                    Hoàn thành ({confirmedSelectedIds.length})
                  </Btn>
                  <Btn
                    variant="ghost"
                    className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    disabled={bulkBusy}
                    onClick={() =>
                      runBulkAction(
                        confirmedSelectedIds,
                        `Hủy ${confirmedSelectedIds.length} lịch đặt đã xác nhận?`,
                        "Đang hủy",
                        "hủy",
                        cancelBooking,
                      )
                    }
                  >
                    Hủy ({confirmedSelectedIds.length})
                  </Btn>
                </>
              )}
              <Btn
                variant="danger"
                className="px-3 py-1.5 text-xs"
                disabled={bulkBusy}
                onClick={() =>
                  runBulkAction(
                    [...selected],
                    `Xóa vĩnh viễn ${selected.size} lịch đặt đã chọn?`,
                    "Đang xóa",
                    "xóa",
                    deleteBooking,
                  )
                }
              >
                {bulkStatusText ?? `Xóa đã chọn (${selected.size})`}
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
      ) : visibleBookings.length === 0 ? (
        <EmptyState title="Không có lịch đặt nào trong mục này" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="w-9 pb-3 pr-2">
                  <AdminCheckbox
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    label="Chọn tất cả lịch đặt"
                  />
                </th>
                <th className="pb-3 pr-4 font-medium">Khách hàng</th>
                <th className="pb-3 pr-4 font-medium">Liên hệ</th>
                <th className="pb-3 pr-4 font-medium">Gói</th>
                <th className="pb-3 pr-4 font-medium">Ngày / Buổi</th>
                <th className="pb-3 pr-4 font-medium">Địa chỉ &amp; Lưu ý</th>
                <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                <th className="pb-3 pr-4 font-medium">Tạo lúc</th>
                <th className="pb-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((b) => {
                const slotList = slots[b.bookingCode] ?? [];
                const isSelected = selected.has(b.id);
                return (
                  <tr
                    key={b.id}
                    className={`border-b border-gray-50 align-top transition-colors last:border-0 ${
                      isSelected ? "bg-[#F4F7F2]" : "hover:bg-gray-50/60"
                    }`}
                  >
                    <td className="py-3 pr-2">
                      <AdminCheckbox
                        checked={isSelected}
                        onChange={(shiftKey) => toggleSelect(b.id, shiftKey)}
                        label={`Chọn booking ${b.bookingCode}`}
                        className="mt-0.5"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-800">{b.customerName}</p>
                      <p className="text-xs text-gray-400">{b.bookingCode}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      <p>{b.phone}</p>
                      {b.instagram && (
                        <p className="text-xs text-green-600">@{b.instagram.replace(/^@/, "")}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {b.pricingPackage ? (
                        <>
                          <p className="font-medium text-gray-800">{b.pricingPackage.name}</p>
                          <p className="text-xs text-gray-400">
                            {sessionTypeLabel[b.pricingPackage.sessionType]} ·{" "}
                            {b.pricingPackage.groupSize} người
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
                            {new Date(s.bookingDate).toLocaleDateString("vi-VN")} ·{" "}
                            {slotLabel[s.slot]}
                          </p>
                        ))
                      )}
                    </td>
                    <td className="max-w-[240px] py-3 pr-4 text-gray-600">
                      <p className="break-words">{b.address}</p>
                      {b.note && (
                        <p className="mt-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-500">
                          <span className="font-medium text-gray-700">Lưu ý:</span> {b.note}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge color={bookingStatusColor[b.status]}>
                        {bookingStatusLabel[b.status]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">
                      {formatDateTime(b.createdAt)}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(actions[b.status] ?? []).map((a) => (
                          <Btn
                            key={a.label}
                            variant={a.variant}
                            disabled={busy === b.id || bulkBusy}
                            className="px-2.5 py-1 text-xs"
                            onClick={() => run(b, a.run)}
                          >
                            {a.label}
                          </Btn>
                        ))}
                        <Btn
                          variant="danger"
                          disabled={busy === b.id || bulkBusy}
                          className="px-2.5 py-1 text-xs"
                          onClick={() => remove(b)}
                        >
                          Xóa
                        </Btn>
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
