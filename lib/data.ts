/**
 * Server-side data helpers for public pages — call the real backend via
 * lib/api and fall back to empty data when the API is unreachable so a
 * page never crashes on a backend outage.
 */
import { getCategories } from "@/lib/api/categories";
import { getFeedback } from "@/lib/api/feedback";
import { getFeaturedPhotos, getGallery } from "@/lib/api/photos";
import { getPricing } from "@/lib/api/pricing";
import { getSiteSettings } from "@/lib/api/site";
import type { Category } from "@/types/category";
import type { Feedback } from "@/types/feedback";
import type { Photo } from "@/types/photo";
import type { PricingPackage } from "@/types/pricing";
import type { SiteSettings } from "@/types/site";

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export const fetchPhotos = (): Promise<Photo[]> => safe(getGallery(), []);
export const fetchFeaturedPhotos = (): Promise<Photo[]> => safe(getFeaturedPhotos(), []);
export const fetchCategories = (): Promise<Category[]> => safe(getCategories(), []);
export const fetchPricing = (): Promise<PricingPackage[]> => safe(getPricing(), []);
export const fetchFeedback = (): Promise<Feedback[]> => safe(getFeedback(), []);
export const fetchSite = (): Promise<SiteSettings | null> => safe(getSiteSettings(), null);
