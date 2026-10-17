/**
 * Server-side data helpers for public pages — call the real backend via
 * lib/api. Most helpers fall back to empty data on failure so a page never
 * crashes on a backend outage; photo fetches instead return a DataResult so
 * the UI can show an error + retry state distinct from a real empty gallery.
 */
import { getCategories } from "@/lib/api/categories";
import { describeApiError } from "@/lib/api/client";
import { getFeedback } from "@/lib/api/feedback";
import { getFeaturedPhotos, getGallery } from "@/lib/api/photos";
import { getPricing } from "@/lib/api/pricing";
import { getSiteSettings } from "@/lib/api/site";
import type { Category } from "@/types/category";
import type { Feedback } from "@/types/feedback";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";
import type { SiteSettings } from "@/types/site";

async function safe<T>(label: string, p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    console.error(`[data] ${label} failed: ${describeApiError(err)}`);
    return fallback;
  }
}

/**
 * Fetch result that distinguishes "the backend returned an empty list"
 * (ok: true, data: []) from "the request failed" (ok: false, data is the
 * fallback). `data` is always safe to render; `ok` drives error UI.
 */
export interface DataResult<T> {
  ok: boolean;
  data: T;
}

async function attempt<T>(label: string, p: Promise<T>, fallback: T): Promise<DataResult<T>> {
  try {
    return { ok: true, data: await p };
  } catch (err) {
    console.error(`[data] ${label} failed: ${describeApiError(err)}`);
    return { ok: false, data: fallback };
  }
}

export const fetchPhotos = (): Promise<DataResult<Photo[]>> =>
  attempt("GET /api/gallery", getGallery(), []);
export const fetchFeaturedPhotos = (): Promise<Photo[]> => safe("GET /api/gallery/featured", getFeaturedPhotos(), []);
export const fetchCategories = (): Promise<Category[]> => safe("GET /api/categories", getCategories(), []);
export const fetchPricing = (): Promise<PricingPackage[]> => safe("GET /api/pricing", getPricing(), []);
export const fetchFeedback = (): Promise<Feedback[]> => safe("GET /api/feedback", getFeedback(), []);
export const fetchSite = (): Promise<SiteSettings | null> => safe("GET /api/site", getSiteSettings(), null);
