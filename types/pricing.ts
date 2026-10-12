/**
 * Types matching pricing/entity/PricingPackage.java JSON and
 * pricing/dto/PricingPackageRequest.java.
 */

import type { SessionType } from "./booking";

export interface PricingPackage {
  id: number;
  name: string;
  groupSize: number;
  sessionType: SessionType;
  /** Price in VND. */
  price: number;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  /** Explicit cover image — references a Photo row (null = none). */
  coverPhotoId: number | null;
  /** Resolved from the referenced Photo; never stored on the package. */
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST/PUT /api/admin/pricing request body. */
export interface PricingPackageRequest {
  name: string;
  groupSize: number;
  sessionType: SessionType;
  price: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  coverPhotoId?: number | null;
}
