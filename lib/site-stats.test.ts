import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_STATS, resolveSiteStats } from "./site-stats";
import type { SiteSettings } from "@/types/site";

describe("resolveSiteStats", () => {
  it("returns default 100/10/2 when site settings is null or missing fields", () => {
    expect(resolveSiteStats(null)).toEqual(DEFAULT_SITE_STATS);
    expect(resolveSiteStats({} as SiteSettings)).toEqual(DEFAULT_SITE_STATS);
  });

  it("uses positive integers from site settings when provided", () => {
    const site = {
      clientsCount: 250,
      conceptsCount: 18,
      experienceYears: 4,
    } as SiteSettings;
    expect(resolveSiteStats(site)).toEqual({
      clientsCount: 250,
      conceptsCount: 18,
      experienceYears: 4,
    });
  });

  it("falls back to defaults on negative or non-finite values", () => {
    const site = {
      clientsCount: -5,
      conceptsCount: Number.NaN,
      experienceYears: 3.9,
    } as SiteSettings;
    expect(resolveSiteStats(site)).toEqual({
      clientsCount: 100,
      conceptsCount: 10,
      experienceYears: 3,
    });
  });
});
