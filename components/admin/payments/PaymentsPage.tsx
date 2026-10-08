"use client";

import { useEffect, useState } from "react";
import { getPayments, markPaymentPaid } from "@/lib/api/payments";
import { useAdmin } from "@/lib/auth/useAdmin";
import { formatDateTime, formatVnd, paymentStatusLabel } from "@/lib/labels";
import type { PaymentResponse } from "@/types/payment";
import { Badge, Btn, Card, EmptyState, Spinner } from "@/components/admin/ui";

/** Payments admin — list + "Đánh dấu đã thanh toán" for UNPAID deposits. */
export function AdminPaymentsPage() {
  const { token, ready, onApiError } = useAdmin();
  const [items, setItems] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

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

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Thanh toán ({items.length})</h2>
        <Btn variant="ghost" onClick={() => token && load(token)}>Làm mới</Btn>
      </div>
      {loading ? (
        <div className="flex justify-center py-14"><Spinner /></div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có thanh toán nào" hint="Khoản cọc được tạo khi khách đặt lịch." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
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
              {items.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-800">{p.bookingCode}</td>
                  <td className="py-3 pr-4 text-gray-700">{formatVnd(p.amount)}</td>
                  <td className="py-3 pr-4 text-xs text-gray-400">{p.qrReference}</td>
                  <td className="py-3 pr-4">
                    <Badge color={p.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {paymentStatusLabel[p.status]}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400">{formatDateTime(p.createdAt)}</td>
                  <td className="py-3 pr-4 text-xs text-gray-400">{formatDateTime(p.paidAt)}</td>
                  <td className="py-3">
                    {p.status === "UNPAID" && (
                      <Btn variant="success" disabled={busy === p.id} className="px-2.5 py-1 text-xs" onClick={() => markPaid(p)}>
                        Đánh dấu đã nhận
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
