"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Reveal } from "@/components/shared/Reveal";
import {
  CopyIcon,
  FacebookIcon,
  InstagramIcon,
} from "@/components/shared/contact";
import {
  buildBookingCopyMessage,
  formatShootDateVi,
  SOCIAL_CONTACT_LINKS,
} from "@/lib/booking-message";
import {
  bookingStatusLabel,
  formatVnd,
  sessionTypeLabel,
  slotLabel,
} from "@/lib/labels";
import type { PricingPackage } from "@/types/pricing";
import type { Slot } from "@/types/booking";

const PHONE_10_DIGITS_REGEX = /^\d{10}$/;

interface ClientBookingDraft {
  customerName: string;
  phone: string;
  instagram: string | null;
  address: string;
  note: string | null;
  shootDate: string;
  slot: Slot | null;
}

const input =
  "w-full rounded-[10px] bg-dark-08 px-4 py-3 text-sm text-absolutewhite placeholder:text-grey-40 focus:outline-none focus:ring-2 focus:ring-brand-55/50";
const label =
  "mb-1.5 block font-medium text-xs font-medium uppercase tracking-[0.12em] text-grey-50";

/**
 * Integrated Booking Form — decoupled from backend API requests.
 * Validates customer input on the client and immediately generates a ready-to-send
 * summary message for the customer to copy and send to Bấu via Facebook or Instagram.
 */
function BookingFormInner({
  packages,
  selectedPackageId,
  onSelectPackageId,
  hidePackageSelector = false,
  embeddedInZoom = false,
}: {
  packages: PricingPackage[];
  turnstileSiteKey?: string | undefined;
  selectedPackageId?: number;
  onSelectPackageId?: (id: number) => void;
  hidePackageSelector?: boolean;
  embeddedInZoom?: boolean;
}) {
  const params = useSearchParams();
  const queryPkgId = Number(params.get("package"));
  const [internalPkgId, setInternalPkgId] = useState<number | undefined>(
    undefined,
  );

  const pkgId =
    selectedPackageId !== undefined &&
    packages.some((p) => p.id === selectedPackageId)
      ? selectedPackageId
      : internalPkgId !== undefined &&
          packages.some((p) => p.id === internalPkgId)
        ? internalPkgId
        : packages.some((p) => p.id === queryPkgId)
          ? queryPkgId
          : (packages[0]?.id ?? 0);

  const handleSelectPkg = (id: number) => {
    setInternalPkgId(id);
    onSelectPackageId?.(id);
  };

  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot>("MORNING");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedDraft, setSubmittedDraft] =
    useState<ClientBookingDraft | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const selected = packages.find((p) => p.id === pkgId);
  const isFullDay = selected?.sessionType === "FULL_DAY";

  const submit = (e: React.FormEvent) => {
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

    setSubmittedDraft({
      customerName: name.trim(),
      phone: normalizedPhone,
      instagram: instagram.trim() || null,
      address: address.trim(),
      note: note.trim() || null,
      shootDate: date,
      slot: isFullDay ? null : slot,
    });
    setCopyState("idle");
    setErrorMsg("");
    setState("sent");
  };

  const copyMessage =
    submittedDraft && selected
      ? buildBookingCopyMessage({
          status: "PENDING",
          packageName: selected.name,
          sessionType: selected.sessionType,
          groupSize: selected.groupSize,
          packagePrice: selected.price,
          shootDate: submittedDraft.shootDate,
          slot: isFullDay ? null : submittedDraft.slot,
          customerName: submittedDraft.customerName,
          phone: submittedDraft.phone,
          instagram: submittedDraft.instagram,
          address: submittedDraft.address,
          note: submittedDraft.note,
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

  const formBody = (
    <>
      <div>
        <p className="font-medium text-xs font-medium uppercase tracking-[0.18em] text-brand-55">
          Đặt lịch
        </p>
        <h3
          className={`mt-2 font-semibold text-absolutewhite ${
            embeddedInZoom ? "text-2xl md:text-3xl" : "text-3xl md:text-5xl"
          }`}
        >
          Đặt lịch chụp cùng Bấu
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-grey-50">
          {hidePackageSelector
            ? "Chọn ngày chụp và điền thông tin bên dưới để tạo sẵn tin nhắn tóm tắt gửi cho Bấu."
            : "Chọn gói chụp, ngày chụp và điền thông tin bên dưới để tạo sẵn tin nhắn tóm tắt gửi cho Bấu."}
        </p>
      </div>

      {state === "sent" && submittedDraft && selected ? (
        <div className="mt-6 space-y-6 rounded-[14px] bg-dark-08 p-6 md:p-8">
          <div className="pb-2">
            <span className="inline-flex items-center rounded-full bg-brand-55/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-55">
              {bookingStatusLabel.PENDING} · Chưa thanh toán cọc
            </span>
            <h3 className="mt-3 font-semibold text-2xl font-semibold text-absolutewhite">
              Đã tạo thông tin đăng ký đặt lịch
            </h3>
            <p className="mt-2 text-sm leading-6 text-grey-50">
              Hãy sao chép tin nhắn tóm tắt bên dưới và gửi qua Facebook hoặc
              Instagram để trao đổi lịch trống và xác nhận đặt cọc cùng Bấu nhé.
            </p>
          </div>

          {/* Summary grid */}
          <dl className="grid gap-4 rounded-[12px] bg-dark-06 p-5 text-sm sm:grid-cols-2">
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
                {formatShootDateVi(submittedDraft.shootDate)} ·{" "}
                {isFullDay
                  ? "Cả ngày (Sáng + Chiều)"
                  : slotLabel[submittedDraft.slot ?? slot]}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                Họ tên bạn &amp; SĐT
              </dt>
              <dd className="mt-1 font-medium text-absolutewhite">
                {submittedDraft.customerName} · {submittedDraft.phone}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                Địa chỉ cụ thể
              </dt>
              <dd className="mt-1 text-absolutewhite">
                {submittedDraft.address}
              </dd>
            </div>
            {submittedDraft.note && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.1em] text-grey-40">
                  Lưu ý với thợ
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-absolutewhite">
                  {submittedDraft.note}
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-55 text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55"
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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
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
              <button
                type="button"
                onClick={() => setState("idle")}
                className="text-xs font-medium text-grey-50 transition-colors hover:text-absolutewhite"
              >
                ← Chỉnh sửa thông tin đặt lịch
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          className={embeddedInZoom ? "mt-6 space-y-5" : "mt-10 space-y-8"}
          onSubmit={submit}
        >
          {/* Package selector — omitted when hidePackageSelector is true */}
          {!hidePackageSelector && (
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
                      onClick={() => handleSelectPkg(p.id)}
                      aria-pressed={pkgId === p.id}
                      className={`rounded-[12px] p-4 text-left transition-colors ${
                        pkgId === p.id
                          ? "bg-brand-55/20"
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
          )}

          {/* Date + slot */}
          <div className="grid gap-5 sm:grid-cols-2">
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
                <p className="rounded-[10px] bg-dark-08 px-4 py-3 text-sm text-grey-50">
                  Gói cả ngày — bao gồm sáng và chiều.
                </p>
              ) : (
                <div className="flex gap-3">
                  {(["MORNING", "AFTERNOON"] as Slot[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      aria-pressed={slot === s}
                      className={`flex-1 rounded-[10px] py-3 font-medium text-sm transition-colors ${
                        slot === s
                          ? "bg-brand-55/20 font-semibold text-absolutewhite"
                          : "bg-dark-08 text-grey-70 hover:bg-dark-15 hover:text-absolutewhite"
                      }`}
                    >
                      {slotLabel[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid gap-5 sm:grid-cols-2">
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
                Vui lòng ghi rõ tên trường / địa điểm chụp, xã/phường,
                tỉnh/thành phố để Bấu tính lịch trình và ước tính chi phí di
                chuyển chính xác.
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

          {state === "error" && (
            <p role="alert" className="text-sm text-red-600">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={packages.length === 0}
            className="w-full rounded-[10px] bg-brand-55 py-3.5 font-medium text-sm font-medium text-white shadow-[inset_4px_4px_17.4px_#ffffff47] transition-[transform,background-color] duration-200 hover:scale-[1.01] hover:bg-brand-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-55 disabled:opacity-50"
          >
            Gửi yêu cầu đặt lịch
          </button>
        </form>
      )}
    </>
  );

  if (embeddedInZoom) {
    return (
      <div
        id="booking"
        aria-label="Đặt lịch chụp"
        className="scroll-mt-24 rounded-[16px] bg-dark-06 p-6 md:p-8"
      >
        {formBody}
      </div>
    );
  }

  return (
    <section
      id="booking"
      aria-label="Đặt lịch chụp"
      className="scroll-mt-24 border-t border-dark-12 bg-dark-06"
    >
      <div className="mx-auto max-w-[960px] px-5 py-16 md:px-10 md:py-20">
        <Reveal from="up">{formBody}</Reveal>
      </div>
    </section>
  );
}

export function BookingSection({
  packages,
  turnstileSiteKey,
  selectedPackageId,
  onSelectPackageId,
  hidePackageSelector,
  embeddedInZoom,
}: {
  packages: PricingPackage[];
  turnstileSiteKey?: string;
  selectedPackageId?: number;
  onSelectPackageId?: (id: number) => void;
  hidePackageSelector?: boolean;
  embeddedInZoom?: boolean;
}) {
  return (
    <Suspense>
      <BookingFormInner
        packages={packages}
        turnstileSiteKey={turnstileSiteKey}
        selectedPackageId={selectedPackageId}
        onSelectPackageId={onSelectPackageId}
        hidePackageSelector={hidePackageSelector}
        embeddedInZoom={embeddedInZoom}
      />
    </Suspense>
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
    <main className="flex min-h-screen w-full flex-col bg-dark-03 text-absolutewhite">
      <BookingSection packages={packages} turnstileSiteKey={turnstileSiteKey} />
    </main>
  );
}
