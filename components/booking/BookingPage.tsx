"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import {
  CopyIcon,
  FacebookIcon,
  InstagramIcon,
} from "@/components/shared/contact";
import { getAvailability } from "@/lib/api/availability";
import { createBooking } from "@/lib/api/bookings";
import {
  buildBookingCopyMessage,
  formatHoldExpiryVi,
  formatShootDateVi,
  SOCIAL_CONTACT_LINKS,
} from "@/lib/booking-message";
import {
  bookingStatusLabel,
  formatVnd,
  sessionTypeLabel,
  slotLabel,
} from "@/lib/labels";
import { resolveCaptchaToken } from "@/lib/turnstile";
import type { AvailabilityResponse } from "@/types/availability";
import type { PricingPackage } from "@/types/pricing";
import type { Booking, Slot } from "@/types/booking";

/** NODE_ENV is inlined at build time — production builds can never bypass. */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const PHONE_10_DIGITS_REGEX = /^\d{10}$/;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const input =
  "w-full rounded-[10px] bg-dark-08 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand-55/50";
const label =
  "mb-1.5 block font-medium text-xs font-medium uppercase tracking-[0.12em] text-grey-50";

/**
 * Booking page — real submission via POST /api/bookings.
 * Turnstile: renders the Cloudflare widget when turnstileSiteKey is set
 * (production — TURNSTILE_SITE_KEY is read server-side and passed in).
 * The "local-dev" bypass is dev-builds-only — a missing site key in
 * production blocks submission with a clear error instead of sending a
 * token that can never verify.
 */
function BookingForm({
  packages,
  turnstileSiteKey,
}: {
  packages: PricingPackage[];
  turnstileSiteKey: string | undefined;
}) {
  const params = useSearchParams();
  const initial = Number(params.get("package"));
  const [pkgId, setPkgId] = useState(
    packages.some((p) => p.id === initial) ? initial : (packages[0]?.id ?? 0),
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot>("MORNING");
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, AvailabilityResponse>
  >({});
  const availability = date ? (availabilityMap[date] ?? null) : null;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [tsToken, setTsToken] = useState("");
  /** Widget script failed to load/render — no token can ever be issued. */
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string | null>(null);

  const renderTurnstile = () => {
    if (!turnstileSiteKey || !turnstileRef.current || !window.turnstile) return;
    if (turnstileId.current !== null) return;
    try {
      turnstileId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => setTsToken(token),
        "expired-callback": () => setTsToken(""),
        "error-callback": () => setTsToken(""),
        "timeout-callback": () => setTsToken(""),
        theme: "dark",
      });
    } catch {
      setCaptchaFailed(true);
    }
  };

  const resetTurnstile = () => {
    if (turnstileId.current !== null)
      window.turnstile?.reset(turnstileId.current);
    setTsToken("");
  };

  const selected = packages.find((p) => p.id === pkgId);
  const isFullDay = selected?.sessionType === "FULL_DAY";

  // Live availability for the chosen date (cached per date).
  useEffect(() => {
    if (!date || availabilityMap[date]) return;
    let cancelled = false;
    getAvailability(date, date)
      .then((list) => {
        if (!cancelled && list[0]) {
          const avail = list[0];
          setAvailabilityMap((m) => ({ ...m, [date]: avail }));
          // Auto-switch to open slot if one is taken
          if (avail.morning !== "AVAILABLE" && avail.afternoon === "AVAILABLE") {
            setSlot("AFTERNOON");
          } else if (avail.afternoon !== "AVAILABLE" && avail.morning === "AVAILABLE") {
            setSlot("MORNING");
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [date, availabilityMap]);

  const slotTaken = (s: Slot) =>
    availability
      ? (s === "MORNING" ? availability.morning : availability.afternoon) !==
        "AVAILABLE"
      : false;
  const fullDayTaken = availability ? !availability.fullDayAvailable : false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = phone.trim().replace(/\s+/g, "");
    if (
      !selected ||
      !date ||
      !name.trim() ||
      !normalizedPhone ||
      !address.trim()
    ) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setState("error");
      return;
    }
    if (!PHONE_10_DIGITS_REGEX.test(normalizedPhone)) {
      setErrorMsg("Số điện thoại không hợp lệ — vui lòng nhập đúng 10 chữ số.");
      setState("error");
      return;
    }
    if (isFullDay && fullDayTaken) {
      setErrorMsg("Ngày này đã kín lịch cả ngày — vui lòng chọn ngày khác.");
      setState("error");
      return;
    }
    if (!isFullDay && slotTaken(slot)) {
      setErrorMsg("Buổi này đã có lịch — vui lòng chọn buổi khác.");
      setState("error");
      return;
    }
    const captcha = resolveCaptchaToken({
      siteKey: turnstileSiteKey,
      token: tsToken,
      isProduction: IS_PRODUCTION,
      widgetFailed: captchaFailed,
    });
    if (!captcha.ok) {
      setErrorMsg(
        captcha.reason === "missing-token"
          ? "Vui lòng hoàn thành xác nhận captcha."
          : "Xác nhận bảo mật chưa sẵn sàng — vui lòng tải lại trang hoặc thử lại sau.",
      );
      setState("error");
      return;
    }
    setState("sending");
    try {
      const booking = await createBooking({
        packageId: selected.id,
        customerName: name.trim(),
        phone: normalizedPhone,
        instagram: instagram.trim() || undefined,
        bookingDate: date,
        slot: isFullDay ? undefined : slot,
        address: address.trim(),
        note: note.trim() || undefined,
        turnstileToken: captcha.token,
      });
      setCreatedBooking(booking);
      setCopyState("idle");
      setState("sent");
      // Invalidate and reload live availability for this date
      getAvailability(date, date)
        .then((list) => {
          if (list[0]) {
            setAvailabilityMap((m) => ({ ...m, [date]: list[0] }));
          }
        })
        .catch(() => {});
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Đặt lịch thất bại — vui lòng thử lại.",
      );
      setState("error");
      resetTurnstile();
      // Invalidate and reload availability to sync latest slot status
      if (date) {
        getAvailability(date, date)
          .then((list) => {
            if (list[0]) {
              setAvailabilityMap((m) => ({ ...m, [date]: list[0] }));
            }
          })
          .catch(() => {});
      }
    }
  };

  const copyMessage =
    createdBooking && selected
      ? buildBookingCopyMessage({
          bookingCode: createdBooking.bookingCode,
          status: createdBooking.status,
          expiresAt: createdBooking.expiresAt,
          packageName: selected.name,
          sessionType: selected.sessionType,
          groupSize: selected.groupSize,
          packagePrice: selected.price,
          shootDate: date,
          slot: isFullDay ? null : slot,
          customerName: createdBooking.customerName || name.trim(),
          phone: createdBooking.phone || phone.trim(),
          instagram: createdBooking.instagram ?? (instagram.trim() || null),
          address: createdBooking.address || address.trim(),
          note: createdBooking.note ?? (note.trim() || null),
        })
      : "";

  const handleCopyMessage = async () => {
    if (!copyMessage) return;
    try {
      await navigator.clipboard.writeText(copyMessage);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const holdExpiryText = formatHoldExpiryVi(createdBooking?.expiresAt);

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

          {state === "sent" && createdBooking && selected ? (
            <Reveal from="up">
              <div className="mt-10 space-y-6 rounded-[14px] bg-dark-08 p-6 md:p-8">
                <div className="border-b border-dark-12 pb-5">
                  <span className="inline-flex items-center rounded-full bg-brand-55/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-55">
                    {bookingStatusLabel[createdBooking.status]} · Chưa thanh toán cọc
                  </span>
                  <h2 className="mt-3 font-semibold text-2xl font-semibold text-absolutewhite">
                    Đã ghi nhận yêu cầu giữ chỗ tạm thời
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-grey-50">
                    Mã đặt lịch của bạn là{" "}
                    <span className="font-mono text-lg font-semibold text-brand-55">
                      {createdBooking.bookingCode}
                    </span>
                    . Lịch chụp hiện ở trạng thái{" "}
                    <strong className="text-absolutewhite">chờ xử lý</strong>{" "}
                    {holdExpiryText
                      ? `(giữ chỗ tạm thời đến ${holdExpiryText})`
                      : "(giữ chỗ tạm thời 30 phút)"}{" "}
                    và sẽ được xác nhận chính thức sau khi bạn trao đổi với Bấu và hoàn tất đặt cọc.
                  </p>
                </div>

                {/* Summary grid */}
                <dl className="grid gap-4 rounded-[12px] bg-dark-06 p-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                      Mã đặt lịch
                    </dt>
                    <dd className="mt-1 font-mono font-semibold text-brand-55">
                      {createdBooking.bookingCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                      Gói chụp
                    </dt>
                    <dd className="mt-1 font-medium text-absolutewhite">
                      {selected.name} ({sessionTypeLabel[selected.sessionType]} ·{" "}
                      {selected.groupSize} người · {formatVnd(selected.price)})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                      Ngày dự kiến chụp &amp; Buổi
                    </dt>
                    <dd className="mt-1 font-medium text-absolutewhite">
                      {formatShootDateVi(date)} ·{" "}
                      {isFullDay ? "Cả ngày (Sáng + Chiều)" : slotLabel[slot]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                      Họ tên bạn &amp; SĐT
                    </dt>
                    <dd className="mt-1 font-medium text-absolutewhite">
                      {createdBooking.customerName || name.trim()} ·{" "}
                      {createdBooking.phone || phone.trim()}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                      Địa chỉ cụ thể
                    </dt>
                    <dd className="mt-1 text-absolutewhite">
                      {createdBooking.address || address.trim()}
                    </dd>
                  </div>
                  {(createdBooking.note || note.trim()) && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                        Lưu ý với thợ
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-absolutewhite">
                        {createdBooking.note || note.trim()}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Copyable message + social contact buttons */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      id="booking-copy-message-label"
                      className="font-medium text-xs font-medium uppercase tracking-[0.12em] text-grey-50"
                    >
                      Tin nhắn tóm tắt để gửi cho Bấu
                    </span>
                    <div className="flex items-center gap-2.5">
                      {copyState === "copied" && (
                        <span
                          role="status"
                          className="text-xs font-semibold text-brand-55"
                        >
                          Đã sao chép
                        </span>
                      )}
                      {copyState === "failed" && (
                        <span role="alert" className="text-xs text-red-600">
                          Hãy bôi đen và nhấn Ctrl+C
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        aria-label="Sao chép tin nhắn"
                        title="Sao chép tin nhắn"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-55 text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-all hover:scale-105 hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                      >
                        <CopyIcon size={18} />
                      </button>
                    </div>
                  </div>

                  <div
                    role="region"
                    aria-labelledby="booking-copy-message-label"
                    className="w-full select-all whitespace-pre-wrap rounded-[10px] bg-dark-06 p-4 font-mono text-xs leading-6 text-absolutewhite"
                  >
                    {copyMessage}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={SOCIAL_CONTACT_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Mở Facebook"
                      title="Mở Facebook"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                    >
                      <FacebookIcon size={18} />
                    </a>
                    <a
                      href={SOCIAL_CONTACT_LINKS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Mở Instagram"
                      title="Mở Instagram"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dark-12 text-grey-80 transition-colors hover:bg-dark-15 hover:text-absolutewhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
                    >
                      <InstagramIcon size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          ) : (
            <Reveal from="up">
              <form className="mt-10 space-y-8" onSubmit={submit}>
                {/* Package */}
                <fieldset>
                  <legend className={label}>Gói chụp</legend>
                  {packages.length === 0 ? (
                    <p className="text-sm text-grey-40">Đang tải gói chụp…</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {packages.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPkgId(p.id)}
                          aria-pressed={pkgId === p.id}
                          className={`rounded-[12px] p-4 text-left transition-colors ${
                            pkgId === p.id
                              ? "bg-brand-55/15"
                              : "bg-dark-08 hover:bg-dark-15"
                          }`}
                        >
                          <p className="font-semibold text-sm font-semibold text-absolutewhite">
                            {p.name}
                          </p>
                          <p className="mt-1 text-xs text-grey-50">
                            {sessionTypeLabel[p.sessionType]} · {p.groupSize} người ·{" "}
                            {formatVnd(p.price)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </fieldset>

                {/* Date + slot */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="booking-date" className={label}>
                      Ngày dự kiến chụp
                    </label>
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
                      <p
                        className={`rounded-[10px] px-4 py-3 text-sm ${
                          fullDayTaken
                            ? "bg-red-500/10 text-red-700"
                            : "bg-dark-08 text-grey-50"
                        }`}
                      >
                        {fullDayTaken
                          ? "Ngày này đã kín lịch cả ngày."
                          : "Gói cả ngày — bao gồm sáng và chiều."}
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
                                    ? "bg-brand-55/15 text-absolutewhite"
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
                    <label htmlFor="customer-name" className={label}>
                      Họ tên bạn
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ tên của bạn"
                      className={input}
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className={label}>
                      Số điện thoại
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="Nhập 10 chữ số (09xxxxxxxx)"
                      className={input}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="customer-address" className={label}>
                      Địa chỉ cụ thể
                    </label>
                    <input
                      id="customer-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      aria-describedby="customer-address-hint"
                      placeholder="Ví dụ: Trường THPT Chu Văn An, Phường Thụy Khuê, Hà Nội"
                      className={input}
                    />
                    <p
                      id="customer-address-hint"
                      className="mt-1.5 text-xs text-grey-50"
                    >
                      Vui lòng ghi rõ tên trường / địa điểm chụp, xã/phường, tỉnh/thành phố để Bấu tính lịch trình và ước tính chi phí di chuyển chính xác.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="customer-instagram" className={label}>
                      Instagram (không bắt buộc)
                    </label>
                    <input
                      id="customer-instagram"
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@tenban"
                      className={input}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="customer-note" className={label}>
                      Lưu ý với thợ (không bắt buộc)
                    </label>
                    <textarea
                      id="customer-note"
                      rows={3}
                      maxLength={1000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú thêm về concept mong muốn, thời gian tập trung, phụ kiện hoặc chụp thêm máy film..."
                      className={input}
                    />
                  </div>
                </div>

                {turnstileSiteKey ? (
                  <>
                    <Script
                      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                      strategy="afterInteractive"
                      onReady={renderTurnstile}
                      onError={() => setCaptchaFailed(true)}
                    />
                    <div ref={turnstileRef} />
                    {captchaFailed && (
                      <p className="text-sm text-red-600">
                        Không tải được xác nhận bảo mật — vui lòng kiểm tra kết nối và tải lại trang.
                      </p>
                    )}
                  </>
                ) : (
                  IS_PRODUCTION && (
                    <p role="alert" className="text-sm text-red-600">
                      Xác nhận bảo mật chưa sẵn sàng — vui lòng tải lại trang hoặc thử lại sau.
                    </p>
                  )
                )}

                {state === "error" && (
                  <p role="alert" className="text-sm text-red-600">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "sending" || packages.length === 0}
                  className="w-full rounded-[10px] bg-brand-55 py-3.5 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-all hover:scale-[1.01] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 disabled:opacity-50"
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

export function BookingPage({
  packages,
  turnstileSiteKey,
}: {
  packages: PricingPackage[];
  turnstileSiteKey: string | undefined;
}) {
  return (
    <Suspense>
      <BookingForm packages={packages} turnstileSiteKey={turnstileSiteKey} />
    </Suspense>
  );
}
