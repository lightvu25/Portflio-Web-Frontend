/**
 * Photo endpoints.
 * Public:  GET /api/gallery, GET /api/gallery/featured
 * Admin:   GET/POST /api/admin/photos (multipart upload),
 *          PUT/DELETE /api/admin/photos/{id},
 *          POST /api/admin/photos/{id}/publish|unpublish
 */

import { apiFetch } from "./client";
import type { Photo, PhotoUpdateRequest } from "@/types/photo";

// ---------- Public ----------

export function getGallery(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery");
}

/** Published customer-feedback screenshots (Feedback category only). */
export function getFeedbackPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery/feedback");
}

export function getFeaturedPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery/featured");
}

// ---------- Admin ----------

export function getAdminPhotos(token: string): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/admin/photos", { token });
}

/** Multipart upload. `categoryIds` may be repeated — Spring binds a Set<Long>. */
export function uploadPhoto(
  token: string,
  file: File,
  metadata: {
    title?: string;
    description?: string;
    altText?: string;
    sortOrder?: number;
    categoryIds?: number[];
    /** Optional crop (0..1 fractions of the stored image). */
    crop?: { cropX: number; cropY: number; cropW: number; cropH: number };
    /** Optional AbortSignal to cancel an in-flight upload on unmount. */
    signal?: AbortSignal;
  } = {},
): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata.title !== undefined) formData.append("title", metadata.title);
  if (metadata.description !== undefined) formData.append("description", metadata.description);
  if (metadata.altText !== undefined) formData.append("altText", metadata.altText);
  if (metadata.sortOrder !== undefined) formData.append("sortOrder", String(metadata.sortOrder));
  for (const id of metadata.categoryIds ?? []) formData.append("categoryIds", String(id));
  if (metadata.crop) {
    formData.append("cropX", String(metadata.crop.cropX));
    formData.append("cropY", String(metadata.crop.cropY));
    formData.append("cropW", String(metadata.crop.cropW));
    formData.append("cropH", String(metadata.crop.cropH));
  }

  return apiFetch<Photo>("/api/admin/photos", {
    method: "POST",
    formData,
    token,
    signal: metadata.signal,
  });
}

/** Atomic bulk add/remove of categories across the selected photos. */
export function bulkUpdatePhotoCategories(
  token: string,
  request: { photoIds: number[]; addCategoryIds?: number[]; removeCategoryIds?: number[] },
): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/admin/photos/bulk-categories", { method: "PUT", body: request, token });
}

export function updatePhoto(token: string, id: number, request: PhotoUpdateRequest): Promise<Photo> {
  return apiFetch<Photo>(`/api/admin/photos/${id}`, { method: "PUT", body: request, token });
}

/** Atomic batch reorder — one request persists the final order. */
export function reorderPhotos(token: string, items: { id: number; sortOrder: number }[]): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/admin/photos/reorder", { method: "PUT", body: items, token });
}

export function publishPhoto(token: string, id: number): Promise<Photo> {
  return apiFetch<Photo>(`/api/admin/photos/${id}/publish`, { method: "POST", token });
}

export function unpublishPhoto(token: string, id: number): Promise<Photo> {
  return apiFetch<Photo>(`/api/admin/photos/${id}/unpublish`, { method: "POST", token });
}

export function deletePhoto(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/api/admin/photos/${id}`, { method: "DELETE", token });
}
