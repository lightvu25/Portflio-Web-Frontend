"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deletePayment, getPayments, markPaymentPaid } from "@/lib/api/payments";
import { useAdmin } from "@/lib/auth/useAdmin";
import { formatDateTime, formatVnd, paymentStatusLabel } from "@/lib/labels";
import type { PaymentResponse } from "@/types/payment";
import { AdminCheckbox, Badge, Btn, Card, EmptyState, Spinner } from "@/components/admin/ui";

type StatusFilter = "ALL" | "UNPAID" | "PAID";

/** Payments admin — list + bulk/single "Đánh dấu đã nhận" and "Xóa". */
export function AdminPaymentsPage() {
  const { token, ready, onApiError } = useAdmin();
  const [items, setItems] = useState<PaymentResponse[]>([]);
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
      setItems(await getPayments(t));
      setError(null);
    } catch (err) {
      if (!onApiError(err)) setError("Không tải được thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready && token) queueMicrotask(() => load(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  const visibleItems = useMemo(() => {
    if (statusFilter === "ALL") return items;
    return items.filter((p) => p.status === statusFilter);
  }, [items, statusFilter]);

  const unpaidCount = useMemo(() => items.filter((p) => p.status === "UNPAID").length, [items]);
  const paidCount = items.length - unpaidCount;

  const selectedItems = useMemo(
    () => items.filter((p) => selected.has(p.id)),
    [items, selected],
  );
  const unpaidSelectedIds = useMemo(
    () => selectedItems.filter((p) => p.status === "UNPAID").map((p) => p.id),
    [selectedItems],
  );

  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((p) => selected.has(p.id));

  const toggleSelect = (id: number, shiftKey = false) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const shouldSelect = !next.has(id);
      if (shiftKey && lastClickedIdRef.current != null) {
        const ids = visibleItems.map((p) => p.id);
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
        visibleItems.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleItems.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelected(new Set());
    lastClickedIdRef.current = null;
  };

  const markPaid = async (p: PaymentResponse) => {
    if (!token) return;
    setBusy(p.id);
    try {
      await markPaymentPaid(token, p.id);
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Không đánh dấu được thanh toán.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (p: PaymentResponse) => {
    if (!token || !confirm(`Xóa khoản thanh toán của mã booking "${p.bookingCode}"?`)) return;
    setBusy(p.id);
    try {
      await deletePayment(token, p.id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
      await load(token);
    } catch (err) {
      if (!onApiError(err)) alert("Xóa thanh toán thất bại.");
    } finally {
      setBusy(null);
    }
  };

  const bulkMarkPaid = async () => {
    if (!token || unpaidSelectedIds.length === 0 || bulkBusy) return;
    if (
      !window.confirm(
        `Đánh dấu đã nhận thanh toán cho ${unpaidSelectedIds.length} khoản cọc đang chọn?`,
      )
    )
      return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < unpaidSelectedIds.length; i++) {
      setBulkStatusText(`Đang duyệt ${i + 1}/${unpaidSelectedIds.length}…`);
      try {
        await markPaymentPaid(token, unpaidSelectedIds[i]);
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
          ? `Đã đánh dấu nhận tiền ${ok} khoản thanh toán.`
          : `Đã duyệt ${ok} khoản, ${fail} khoản lỗi.`,
    });
    await load(token);
  };

  const bulkDeleteSelected = async () => {
    if (!token || selected.size === 0 || bulkBusy) return;
    const ids = [...selected];
    if (!window.confirm(`Xóa vĩnh viễn ${ids.length} khoản thanh toán đã chọn?`)) return;
    setBulkBusy(true);
    setNotice(null);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < ids.length; i++) {
      setBulkStatusText(`Đang xóa ${i + 1}/${ids.length}…`);
      try {
        await deletePayment(token, ids[i]);
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
          ? `Đã xóa ${ok} khoản thanh toán.`
          : `Đã xóa ${ok} khoản, ${fail} khoản lỗi.`,
    });
    await load(token);
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Thanh toán ({items.length})</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Tích chọn để đánh dấu đã nhận cọc hoặc xóa nhanh nhiều khoản thanh toán cùng lúc.
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
              { id: "ALL", label: `Tất cả (${items.length})` },
              { id: "UNPAID", label: `Chưa nhận (${unpaidCount})` },
              { id: "PAID", label: `Đã nhận (${paidCount})` },
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
            disabled={bulkBusy || visibleItems.length === 0}
            onClick={toggleSelectAllVisible}
          >
            {allVisibleSelected
              ? "Bỏ chọn trang này"
              : `Chọn tất cả (${visibleItems.length})`}
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
              {unpaidSelectedIds.length > 0 && (
                <Btn
                  variant="success"
                  className="px-3 py-1.5 text-xs"
                  disabled={bulkBusy}
                  onClick={bulkMarkPaid}
                >
                  {bulkStatusText && bulkStatusText.startsWith("Đang duyệt")
                    ? bulkStatusText
                    : `Đánh dấu đã nhận (${unpaidSelectedIds.length})`}
                </Btn>
              )}
              <Btn
                variant="danger"
                className="px-3 py-1.5 text-xs"
                disabled={bulkBusy}
                onClick={bulkDeleteSelected}
              >
                {bulkStatusText && bulkStatusText.startsWith("Đang xóa")
                  ? bulkStatusText
                  : `Xóa đã chọn (${selected.size})`}
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
      ) : visibleItems.length === 0 ? (
        <EmptyState
          title="Chưa có thanh toán nào"
          hint="Khoản cọc được tạo khi khách đặt lịch."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="w-9 pb-3 pr-2">
                  <AdminCheckbox
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    label="Chọn tất cả thanh toán"
                  />
                </th>
                <th className="pb-3 pr-4 font-medium">Mã booking</th>
                <th className="pb-3 pr-4 font-medium">Số tiền</th>
                <th className="pb-3 pr-4 font-medium">Mã QR</th>
                <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                <th className="pb-3 pr-4 font-medium">Tạo lúc</th>
                <th className="pb-3 pr-4 font-medium">Thanh toán lúc</th>
                <th className="pb-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((p) => {
                const isSelected = selected.has(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 transition-colors last:border-0 ${
                      isSelected ? "bg-[#F4F7F2]" : "hover:bg-gray-50/60"
                    }`}
                  >
                    <td className="py-3 pr-2">
                      <AdminCheckbox
                        checked={isSelected}
                        onChange={(shiftKey) => toggleSelect(p.id, shiftKey)}
                        label={`Chọn thanh toán ${p.bookingCode}`}
                      />
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-800">{p.bookingCode}</td>
                    <td className="py-3 pr-4 text-gray-700">{formatVnd(p.amount)}</td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{p.qrReference}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        color={
                          p.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }
                      >
                        {paymentStatusLabel[p.status]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{formatDateTime(p.paidAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {p.status === "UNPAID" && (
                          <Btn
                            variant="success"
                            disabled={busy === p.id || bulkBusy}
                            className="px-2.5 py-1 text-xs"
                            onClick={() => markPaid(p)}
                          >
                            Đánh dấu đã nhận
                          </Btn>
                        )}
                        <Btn
                          variant="danger"
                          disabled={busy === p.id || bulkBusy}
                          className="px-2.5 py-1 text-xs"
                          onClick={() => remove(p)}
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
