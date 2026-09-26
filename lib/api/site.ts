/**
 * Site settings endpoints.
 * Public: GET /api/site (404 when no settings row exists yet)
 * Admin:  GET /api/admin/site, PUT /api/admin/site (upsert)
 */

import { apiFetch } from "./client";
import type { SiteSettings, SiteSettingsRequest } from "@/types/site";

export function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>("/api/site");
}

export function getAdminSiteSettings(token: string): Promise<SiteSettings> {
  return apiFetch<SiteSettings>("/api/admin/site", { token });
}

export function updateSiteSettings(token: string, request: SiteSettingsRequest): Promise<SiteSettings> {
  return apiFetch<SiteSettings>("/api/admin/site", { method: "PUT", body: request, token });
}
