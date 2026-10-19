/**
 * Turnstile token resolution for the booking form.
 *
 * The backend always verifies CAPTCHA when TURNSTILE_ENABLED=true, so the
 * frontend must send a real token from the Cloudflare widget. The "local-dev"
 * placeholder exists ONLY for local development against a backend running
 * TURNSTILE_ENABLED=false — it must be impossible to reach in a production
 * build, including when TURNSTILE_SITE_KEY is missing/empty on Vercel (the
 * misconfiguration that previously let the form submit "local-dev" to
 * production).
 */

export const LOCAL_DEV_CAPTCHA_TOKEN = "local-dev";

export type CaptchaResolution =
  | { ok: true; token: string }
  | { ok: false; reason: "missing-site-key" | "widget-failed" | "missing-token" };

export function resolveCaptchaToken({
  siteKey,
  token,
  isProduction,
  widgetFailed = false,
}: {
  /** TURNSTILE_SITE_KEY — read server-side, undefined when not configured. */
  siteKey: string | undefined;
  /** Token issued by the Turnstile widget ("" until the user solves it). */
  token: string;
  /** process.env.NODE_ENV === "production" — the bypass is dev-only. */
  isProduction: boolean;
  /** Widget script failed to load or render — no token can ever be issued. */
  widgetFailed?: boolean;
}): CaptchaResolution {
  const key = siteKey?.trim() || undefined;
  if (!key) {
    // Local dev only: backend runs TURNSTILE_ENABLED=false and ignores the
    // placeholder. Production without a site key is a misconfiguration —
    // block rather than submit a fabricated token that can never verify.
    return isProduction
      ? { ok: false, reason: "missing-site-key" }
      : { ok: true, token: LOCAL_DEV_CAPTCHA_TOKEN };
  }
  if (widgetFailed) {
    return { ok: false, reason: "widget-failed" };
  }
  return token
    ? { ok: true, token }
    : { ok: false, reason: "missing-token" };
}
