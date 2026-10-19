/**
 * Types matching the Photo entity JSON (gallery/entity/Photo.java +
 * common/entity/BaseEntity.java) and gallery/dto DTOs.
 */

import type { Category } from "./category";

export type PhotoStatus = "DRAFT" | "PUBLISHED";

/** Photo as returned by GET /api/gallery, /api/gallery/featured, /api/admin/photos. */
export interface Photo {
  id: number;
  title: string | null;
  description: string | null;
  cloudinaryPublicId: string;
  imageUrl: string;
  /** Untouched upload URL — set once a crop exists; imageUrl then carries the transform. */
  originalImageUrl: string | null;
  thumbnailUrl: string | null;
  /** Saved crop as fractions of the stored image (0..1); all four set or none. */
  cropX: number | null;
  cropY: number | null;
  cropW: number | null;
  cropH: number | null;
  altText: string | null;
  status: PhotoStatus;
  isFeatured: boolean;
  sortOrder: number;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

/** PUT /api/admin/photos/{id} request body (gallery/dto/PhotoUpdateRequest.java). */
export interface PhotoUpdateRequest {
  title?: string;
  description?: string;
  altText?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  categoryIds?: number[];
  /** New crop (0..1 fractions) — applied only when all four are sent. */
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
  /** Remove the saved crop and restore the original URL. */
  clearCrop?: boolean;
}
