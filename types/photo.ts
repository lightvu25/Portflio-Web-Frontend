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
  thumbnailUrl: string | null;
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
}
