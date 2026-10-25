import type { SiteSettings } from "@/types/site";

export interface ResolvedSiteStats {
  clientsCount: number;
  conceptsCount: number;
  experienceYears: number;
}

export const DEFAULT_SITE_STATS: ResolvedSiteStats = {
  clientsCount: 100,
  conceptsCount: 10,
  experienceYears: 2,
};

function sanitizeNonNegativeInt(value: number | null | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return Math.floor(value);
}

/**
 * Resolves the 3 homepage counters from SiteSettings, falling back to
 * 100+ clients, 2 years of experience, and 10+ concepts when the backend
 * has not yet deployed the V16 migration or when fields are null.
 */
export function resolveSiteStats(site: SiteSettings | null | undefined): ResolvedSiteStats {
  return {
    clientsCount: sanitizeNonNegativeInt(site?.clientsCount, DEFAULT_SITE_STATS.clientsCount),
    conceptsCount: sanitizeNonNegativeInt(site?.conceptsCount, DEFAULT_SITE_STATS.conceptsCount),
    experienceYears: sanitizeNonNegativeInt(
      site?.experienceYears,
      DEFAULT_SITE_STATS.experienceYears,
    ),
  };
}
