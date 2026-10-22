/**
 * Types matching site/entity/SiteSettings.java JSON,
 * site/dto/PublicSiteSettingsResponse.java, and
 * site/dto/SiteSettingsRequest.java.
 */

import type { Photo } from "./photo";

export interface AboutPhoto {
  id: number;
  title: string | null;
  description: string | null;
  altText: string | null;
  imageUrl: string;
}

export interface SiteSettings {
  id: number;
  photographerName: string;
  experience: string | null;
  bio: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  messengerUrl: string | null;
  heroImageUrl: string | null;
  heroCloudinaryPublicId?: string | null;
  profileImageUrl: string | null;
  profileCloudinaryPublicId?: string | null;
  /** Stored self-introduction selection (Admin-category photo), or null (admin endpoint only). */
  profilePhoto?: Photo | null;
  /** Resolved About-section photo — always an Admin-category photo or null. */
  aboutPhoto: Photo | AboutPhoto | null;
  /** Deposit amount in VND. */
  depositAmount: number;
  /** JSON string stored in a jsonb column. */
  equipment: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** PUT /api/admin/site request body. */
export interface SiteSettingsRequest {
  photographerName: string;
  experience?: string;
  bio?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  messengerUrl?: string;
  heroImageUrl?: string;
  heroCloudinaryPublicId?: string;
  profileImageUrl?: string;
  profileCloudinaryPublicId?: string;
  /** About-section photo id — must be in the Admin category; null clears. */
  profilePhotoId?: number | null;
  depositAmount?: number;
  equipment?: string;
}
