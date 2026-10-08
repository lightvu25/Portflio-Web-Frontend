"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { getAvailability } from "@/lib/api/availability";
import { createBooking } from "@/lib/api/bookings";
import { formatVnd, sessionTypeLabel, slotLabel } from "@/lib/labels";
import type { AvailabilityResponse } from "@/types/availability";
import type { PricingPackage } from "@/types/pricing";
import type { Slot } from "@/types/booking";

const input =
  "w-full rounded-[10px] bg-dark-08 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-purple-55/50";
const label =
  "mb-1.5 block font-medium text-xs font-medium uppercase tracking-[0.12em] text-grey-50";

/**
 * Booking page — real submission via POST /api/bookings.
 * Turnstile token: when no site key is configured locally, a placeholder is
 * sent (backend skips verification when TURNSTILE_ENABLED=false).
 */
function BookingForm({ packages }: { packages: PricingPackage[] }) {
  const params = useSearchParams();
  const initial = Number(params.get("package"));
  const [pkgId, setPkgId] = useState(
    packages.some((p) => p.id === initial) ? initial : (packages[0]?.id ?? 0),
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot>("MORNING");
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityResponse>>({});
  const availability = date ? (availabilityMap[date] ?? null) : null;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingCode, setBookingCode] = useState("");

  const selected = packages.find((p) => p.id === pkgId);
  const isFullDay = selected?.sessionType === "FULL_DAY";

  // Live availability for the chosen date (cached per date).
  useEffect(() => {
    if (!date || availabilityMap[date]) return;
    let cancelled = false;
    getAvailability(date, date)
      .then((list) => {
        if (!cancelled && list[0]) {
          setAvailabilityMap((m) => ({ ...m, [date]: list[0] }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [date, availabilityMap]);

  const slotTaken = (s: Slot) =>
    availability ? (s === "MORNING" ? availability.morning : availability.afternoon) !== "AVAILABLE" : false;
  const fullDayTaken = availability ? !availability.fullDayAvailable : false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !date || !name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin.");
      setState("error");
      return;
    }
    if (!isFullDay && slotTaken(slot)) {
      setErrorMsg("Buổi này đã có lịch — vui lòng chọn buổi khác.");
      setState("error");
      return;
    }
    setState("sending");
    try {
      const booking = await createBooking({
        packageId: selected.id,
        customerName: name.trim(),
        phone: phone.trim(),
        instagram: instagram.trim() || undefined,
        bookingDate: date,
        slot: isFullDay ? undefined : slot,
        address: address.trim(),
        turnstileToken: "local-dev",
      });
      setBookingCode(booking.bookingCode);
      setState("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đặt lịch thất bại — vui lòng thử lại.");
      setState("error");
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <section className="flex-1">
        <div className="mx-auto max-w-[900px] px-5 py-14 md:px-10">
          <Reveal from="down">
          <p className="font-medium text-sm font-medium uppercase tracking-[0.18em] text-grey-40">
            Đặt lịch
          </p>
          <h1 className="mt-3 font-semibold text-4xl font-semibold text-absolutewhite">
            Đặt lịch chụp
          </h1>
          </Reveal>

          {state === "sent" ? (
            <Reveal from="up">
            <div className="mt-10 rounded-[14px] border border-dark-12 bg-dark-08 p-8 text-center">
              <p className="font-semibold text-xl font-semibold text-absolutewhite">
                Đã gửi yêu cầu đặt lịch
              </p>
              <p className="mt-3 text-sm text-grey-50">
                Mã booking của bạn:
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-purple-55">{bookingCode}</p>
              <p className="mt-3 text-sm text-grey-50">
                Bấu sẽ xác nhận lịch và gửi thông tin thanh toán cọc cho bạn.
              </p>
            </div>
            </Reveal>
          ) : (
          <Reveal from="up">
          <form className="mt-10 space-y-8" onSubmit={submit}>
            {/* Package */}
            <fieldset>
              <legend className={label}>Gói chụp</legend>
              {packages.length === 0 ? (
                <p className="text-sm text-grey-40">
                  Đang tải gói chụp…
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {packages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPkgId(p.id)}
                      aria-pressed={pkgId === p.id}
                      className={`rounded-[12px] p-4 text-left transition-colors ${
                        pkgId === p.id ? "bg-purple-55/15" : "bg-dark-08 hover:bg-dark-15"
                      }`}
                    >
                      <p className="font-semibold text-sm font-semibold text-absolutewhite">{p.name}</p>
                      <p className="mt-1 text-xs text-grey-50">
                        {sessionTypeLabel[p.sessionType]} · {formatVnd(p.price)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Date + slot */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="booking-date" className={label}>Ngày mong muốn</label>
                <input
                  id="booking-date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={input}
                />
              </div>
              <div>
                <span className={label}>Buổi chụp</span>
                {isFullDay ? (
                  <p className={`rounded-[10px] border px-4 py-3 text-sm ${
                    fullDayTaken ? "border-red-900/50 text-red-400" : "border-dark-12 bg-dark-06 text-grey-50"
                  }`}>
                    {fullDayTaken ? "Ngày này đã kín lịch cả ngày." : "Gói cả ngày — bao gồm sáng và chiều."}
                  </p>
                ) : (
                  <div className="flex gap-3">
                    {(["MORNING", "AFTERNOON"] as Slot[]).map((s) => {
                      const taken = date ? slotTaken(s) : false;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={taken}
                          onClick={() => setSlot(s)}
                          aria-pressed={slot === s}
                          className={`flex-1 rounded-[10px] py-3 font-medium text-sm transition-colors ${
                            taken
                              ? "cursor-not-allowed bg-dark-08 text-grey-40 line-through"
                              : slot === s
                                ? "bg-purple-55/15 text-absolutewhite"
                                : "bg-dark-08 text-grey-70 hover:bg-dark-15 hover:text-absolutewhite"
                          }`}
                        >
                          {slotLabel[s]}
                          {taken ? " (kín)" : ""}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Customer info */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="customer-name" className={label}>Họ và tên</label>
                <input id="customer-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" className={input} />
              </div>
              <div>
                <label htmlFor="customer-phone" className={label}>Số điện thoại</label>
                <input id="customer-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" className={input} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="customer-address" className={label}>Địa chỉ chụp</label>
                <input id="customer-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa điểm mong muốn" className={input} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="customer-instagram" className={label}>Instagram (không bắt buộc)</label>
                <input id="customer-instagram" type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@tenban" className={input} />
              </div>
            </div>

            {state === "error" && (
              <p className="rounded-[10px] bg-red-900/30 px-4 py-3 text-sm text-red-300">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "sending" || packages.length === 0}
              className="w-full rounded-[10px] bg-purple-55 py-3.5 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              {state === "sending" ? "Đang gửi…" : "Gửi yêu cầu đặt lịch"}
            </button>
          </form>
          </Reveal>
          )}
        </div>
      </section>
    </main>
  );
}

export function BookingPage({ packages }: { packages: PricingPackage[] }) {
  return (
    <Suspense>
      <BookingForm packages={packages} />
    </Suspense>
  );
}
