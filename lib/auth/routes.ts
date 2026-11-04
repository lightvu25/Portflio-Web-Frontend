/**
 * Centralized frontend route constants for the Admin portal.
 * Note: Backend REST API endpoints remain under `/api/admin/*`.
 */

export const ADMIN_BASE_PATH = "/bcc-10d09m25y";
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`;

export function isAdminRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`)
  );
}
