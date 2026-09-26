/**
 * Admin JWT storage abstraction.
 *
 * Strategy: the token is kept in localStorage under a single key so it
 * persists across tabs and reloads. This is acceptable for a single-admin
 * site; the trade-off is that any XSS could read it — keep the admin UI
 * minimal and free of third-party scripts.
 *
 * All functions are no-ops on the server so API modules can be imported
 * from both server and client components.
 */

const TOKEN_KEY = "hb_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}
