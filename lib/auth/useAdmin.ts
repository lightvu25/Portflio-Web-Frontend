"use client";

/**
 * Admin auth hook — the ONLY client-side guard for /admin/* pages.
 * Returns the JWT or redirects to /admin/login when absent/expired (401).
 */
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { clearAdminToken, getAdminToken } from "./token";

export function useAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    clearAdminToken();
    router.replace("/admin/login");
  }, [router]);

  useEffect(() => {
    queueMicrotask(() => {
      const t = getAdminToken();
      if (!t && pathname !== "/admin/login") {
        router.replace("/admin/login");
        return;
      }
      setToken(t);
      setReady(true);
    });
  }, [pathname, router]);

  /** Call inside catch: on 401/403 clears the token and bounces to login. */
  const onApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout();
        return true;
      }
      return false;
    },
    [logout],
  );

  return { token, ready, logout, onApiError };
}
