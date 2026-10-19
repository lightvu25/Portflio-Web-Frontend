import { describe, expect, it } from "vitest";
import { LOCAL_DEV_CAPTCHA_TOKEN, resolveCaptchaToken } from "./turnstile";

const KEY = "0x4AAAAAAA_testsitekey";

describe("resolveCaptchaToken", () => {
  it("production + site key + widget token → submits the real token", () => {
    const r = resolveCaptchaToken({ siteKey: KEY, token: "cf-token-123", isProduction: true });
    expect(r).toEqual({ ok: true, token: "cf-token-123" });
  });

  it("production + site key but token not yet issued → blocked as missing-token", () => {
    const r = resolveCaptchaToken({ siteKey: KEY, token: "", isProduction: true });
    expect(r).toEqual({ ok: false, reason: "missing-token" });
  });

  it("production + widget load failure → blocked as widget-failed", () => {
    const r = resolveCaptchaToken({
      siteKey: KEY, token: "", isProduction: true, widgetFailed: true,
    });
    expect(r).toEqual({ ok: false, reason: "widget-failed" });
  });

  it("production + missing site key → blocked as missing-site-key", () => {
    const r = resolveCaptchaToken({ siteKey: undefined, token: "", isProduction: true });
    expect(r).toEqual({ ok: false, reason: "missing-site-key" });
  });

  it("production NEVER yields the local-dev bypass token — any input combination", () => {
    const inputs = [
      { siteKey: undefined, token: "", widgetFailed: false },
      { siteKey: "", token: "", widgetFailed: false },
      { siteKey: "   ", token: "", widgetFailed: false },
      { siteKey: undefined, token: "stale", widgetFailed: true },
      { siteKey: KEY, token: "", widgetFailed: true },
      { siteKey: KEY, token: "", widgetFailed: false },
    ];
    for (const input of inputs) {
      const r = resolveCaptchaToken({ ...input, isProduction: true });
      if (r.ok) {
        expect(r.token).not.toBe(LOCAL_DEV_CAPTCHA_TOKEN);
        expect(r.token).not.toBe("");
      }
    }
  });

  it("development + missing site key → bypass placeholder for local backend", () => {
    const r = resolveCaptchaToken({ siteKey: undefined, token: "", isProduction: false });
    expect(r).toEqual({ ok: true, token: LOCAL_DEV_CAPTCHA_TOKEN });
  });

  it("development + blank/whitespace site key still bypasses (treated as unset)", () => {
    const r = resolveCaptchaToken({ siteKey: "  ", token: "", isProduction: false });
    expect(r.ok).toBe(true);
  });

  it("dev + site key + no token → still requires the widget token", () => {
    const r = resolveCaptchaToken({ siteKey: KEY, token: "", isProduction: false });
    expect(r).toEqual({ ok: false, reason: "missing-token" });
  });
});
