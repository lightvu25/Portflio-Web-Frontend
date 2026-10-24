/**
 * Single source of truth for public contact channels — used by the site
 * footer, the About "Thông tin liên hệ" card, and the Booking confirmation view.
 * Icons use the SVG definitions from `frontend/svg/`.
 */

export const CONTACT = {
  facebook: "https://www.facebook.com/haibaudepzai",
  instagram: "https://www.instagram.com/_bauu.chupchoet_/",
  zalo: "0982246205",
  zaloHref: "https://zalo.me/0982246205",
  email: "haianh092005@gmail.com",
  phone: "0982246205",
  phoneHref: "tel:0982246205",
  mailto: "mailto:haianh092005@gmail.com",
} as const;

export function resolveFacebookHref(raw?: string | null): string {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : CONTACT.facebook;
}

export function resolveInstagramHref(raw?: string | null): string {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : CONTACT.instagram;
}

export function resolveZaloPhone(raw?: string | null): string {
  if (!raw) return CONTACT.zalo;
  const digits = raw.replace(/\D/g, "");
  return /^\d{10}$/.test(digits) ? digits : CONTACT.zalo;
}

export function resolveZaloHref(raw?: string | null): string {
  return `https://zalo.me/${resolveZaloPhone(raw)}`;
}

type IconProps = { size?: number; className?: string };

export function CopyIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"
        fill="currentColor"
      />
      <path
        d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FacebookIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-5 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <g transform="translate(-385, -7399)" fill="currentColor" fillRule="evenodd">
        <g transform="translate(56, 160)">
          <path d="M335.821282,7259 L335.821282,7250 L338.553693,7250 L339,7246 L335.821282,7246 L335.821282,7244.052 C335.821282,7243.022 335.847593,7242 337.286884,7242 L338.744689,7242 L338.744689,7239.14 C338.744689,7239.097 337.492497,7239 336.225687,7239 C333.580004,7239 331.923407,7240.657 331.923407,7243.7 L331.923407,7246 L329,7246 L329,7250 L331.923407,7250 L331.923407,7259 L335.821282,7259 Z" />
        </g>
      </g>
    </svg>
  );
}

export function InstagramIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
        fill="currentColor"
      />
      <path
        d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ZaloIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.21 0.77L21.72 0.72L22.47 1.05L23.04 1.68L23.28 2.4L23.26 20.98L22.92 21.36L20.24 22.52L17.98 23.14L16.8 23.28L12.98 23.26L11.66 23.02L8.86 22.1L7.65 22.02L6.64 22.24L4.15 23.21L4.78 21.82L4.92 21.12L4.9 19.94L4.75 19.49L4.35 18.93L3.04 17.48L2.09 15.91L1.33 14.27L0.72 11.64L0.72 8.88L1.36 6.28L2.52 3.84L3.45 2.49Z M15.38 7.1L15.06 7.26L14.88 7.68L14.88 14.28L15.16 14.72L15.68 14.84L16.05 14.61L16.2 14.28L16.2 7.68L15.87 7.17Z M4.82 7.82L4.42 8.02L4.22 8.42L4.25 8.71L4.61 9.07L6.96 9.12L7.16 9.24L4.25 13.97L4.25 14.35L4.61 14.71L5.16 14.88L8.48 14.84L8.97 14.61L9.16 14.21L9.12 13.92L8.84 13.6L8.4 13.44L6.48 13.44L6.28 13.32L8.76 9.36L9.1 8.62L9.07 8.21L8.79 7.89L8.52 7.8Z M11.06 9.98L10.24 10.36L9.64 10.96L9.26 11.78L9.28 13.04L9.69 13.83L10.61 14.59L11.64 14.85L12.67 14.6L13.43 14.86L13.83 14.67L14.03 14.39L14.16 13.8L14.12 10.48L13.95 10.17L13.66 9.98L13.22 9.98L12.73 10.18L12.12 9.96Z M18.86 9.98L18.09 10.29L17.34 11.1L17.06 11.78L17.06 12.94L17.52 13.92L18.16 14.48L19.44 14.85L19.92 14.76L20.72 14.48L21.44 13.76L21.82 12.82L21.82 11.9L21.44 10.96L20.79 10.29L20.02 9.98Z M11.32 11.32L11.76 11.28L12.12 11.4L12.68 12.04L12.7 12.58L12.52 13L11.96 13.4L11.52 13.44L11.16 13.32L10.6 12.68L10.56 12.24L10.68 11.88Z M19.01 11.33L19.84 11.36L20.25 11.67L20.48 12.04L20.44 12.76L19.84 13.36L19.44 13.44L19.04 13.36L18.63 13.05L18.4 12.68L18.44 11.96Z"
      />
    </svg>
  );
}

export function MessengerIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 3C6.9 3 3 6.6 3 11.1c0 2.6 1.2 4.9 3.2 6.4V21l2.9-1.6c.9.3 1.9.4 2.9.4 5.1 0 9-3.6 9-8.1S17.1 3 12 3zm1 10.9-2.4-2.6-4.3 2.6 4.7-5 2.4 2.6 4.3-2.6-4.7 5z" />
    </svg>
  );
}

export function MailIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
