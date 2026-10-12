/**
 * Single source of truth for public contact channels — used by the site
 * footer and the About "Thông tin liên hệ" card. Update here once.
 * Icons match the existing inline-SVG style used across the site.
 */

export const CONTACT = {
  facebook: "https://www.facebook.com/haibaudepzai",
  instagram: "https://www.instagram.com/bauu.chupchoet",
  email: "haianh092005@gmail.com",
  phone: "0982246205",
  phoneHref: "tel:0982246205",
  mailto: "mailto:haianh092005@gmail.com",
} as const;

type IconProps = { size?: number; className?: string };

export function FacebookIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V5.1c-.6-.1-1.4-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z" />
    </svg>
  );
}

export function InstagramIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
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
