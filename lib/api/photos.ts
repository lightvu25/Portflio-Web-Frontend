/**
 * Photo endpoints.
 * Public:  GET /api/gallery, GET /api/gallery/featured, GET /api/gallery/feedback, GET /api/gallery/scroll
 * Admin:   GET /api/admin/photos,
 *          POST /api/admin/photos/upload-signature (Phase A: signed upload ticket),
 *          Direct upload to https://api.cloudinary.com/v1_1/{cloudName}/image/upload (Phase B),
 *          POST /api/admin/photos (Phase C: verify & persist metadata + Category links),
 *          PUT/DELETE /api/admin/photos/{id},
 *          POST /api/admin/photos/{id}/publish|unpublish
 */

import { apiFetch } from "./client";
import type { Photo, PhotoUpdateRequest } from "@/types/photo";

export interface PhotoUploadSignatureTicket {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  uploadUrl?: string;
}

export interface CloudinaryUploadedAsset {
  publicId: string;
  version: number;
  signature: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export interface PhotoCompleteUploadPayload extends CloudinaryUploadedAsset {
  title?: string;
  description?: string;
  altText?: string;
  sortOrder?: number;
  categoryIds?: number[];
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
}

export class CloudinaryDirectUploadError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CloudinaryDirectUploadError";
    this.status = status;
  }
}

// ---------- Public ----------

export function getGallery(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery");
}

/** Published customer-feedback screenshots (Feedback category only). */
export function getFeedbackPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery/feedback");
}

/** Published homepage scroll-driven hero photos (Scroll category only). */
export function getScrollPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery/scroll");
}

export function getFeaturedPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/gallery/featured");
}

// ---------- Admin ----------

export function getAdminPhotos(token: string): Promise<Photo[]> {
  return apiFetch<Photo[]>("/api/admin/photos", { token });
}

/**
 * Phase A: Requests a short-lived signed upload ticket from the backend.
 * The backend controls `folder` ("haibau/photos") and generates a unique `publicId`.
 */
export function requestPhotoUploadSignature(
  token: string,
  params: {
    fileName?: string;
    contentType?: string;
    fileSizeBytes?: number;
  } = {},
  signal?: AbortSignal,
): Promise<PhotoUploadSignatureTicket> {
  return apiFetch<PhotoUploadSignatureTicket>("/api/admin/photos/upload-signature", {
    method: "POST",
    body: params,
    token,
    signal,
  });
}

/**
 * Phase B: Uploads the untouched original `File` directly from the browser to Cloudinary
 * using the signed ticket issued by the backend. Never sends backend JWTs to Cloudinary,
 * and never modifies/re-encodes the file before sending.
 */
export async function uploadFileDirectToCloudinary(
  file: File,
  ticket: PhotoUploadSignatureTicket,
  signal?: AbortSignal,
): Promise<CloudinaryUploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", ticket.apiKey);
  formData.append("timestamp", String(ticket.timestamp));
  formData.append("signature", ticket.signature);
  formData.append("folder", ticket.folder);
  formData.append("public_id", ticket.publicId);

  const uploadUrl =
    ticket.uploadUrl ??
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(ticket.cloudName)}/image/upload`;

  const timeoutSignal = AbortSignal.timeout(300_000);
  const combinedSignal =
    signal && typeof AbortSignal.any === "function"
      ? AbortSignal.any([signal, timeoutSignal])
      : (signal ?? timeoutSignal);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    signal: combinedSignal,
  });

  if (!response.ok) {
    const errJson = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const rawMsg = errJson?.error?.message ?? `HTTP ${response.status}`;
    if (/file size too large/i.test(rawMsg)) {
      throw new CloudinaryDirectUploadError(
        `Ảnh vượt quá giới hạn dung lượng của gói tài khoản Cloudinary (${rawMsg}).`,
        response.status,
      );
    }
    throw new CloudinaryDirectUploadError(
      `Tải ảnh trực tiếp lên Cloudinary thất bại: ${rawMsg}`,
      response.status,
    );
  }

  const data = (await response.json()) as {
    public_id?: string;
    version?: number;
    signature?: string;
    secure_url?: string;
    resource_type?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
  };

  if (
    !data.public_id ||
    typeof data.version !== "number" ||
    !data.signature ||
    !data.secure_url ||
    !data.format ||
    typeof data.bytes !== "number" ||
    typeof data.width !== "number" ||
    typeof data.height !== "number"
  ) {
    throw new CloudinaryDirectUploadError(
      "Phản hồi từ Cloudinary thiếu thông tin xác thực ảnh (public_id/version/signature).",
      502,
    );
  }

  return {
    publicId: data.public_id,
    version: data.version,
    signature: data.signature,
    secureUrl: data.secure_url,
    resourceType: data.resource_type ?? "image",
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}

/**
 * Phase C: Sends the Cloudinary upload result + Admin metadata/Category IDs to
 * the backend for cryptographic verification and PostgreSQL persistence.
 */
export function completePhotoUpload(
  token: string,
  payload: PhotoCompleteUploadPayload,
  signal?: AbortSignal,
): Promise<Photo> {
  return apiFetch<Photo>("/api/admin/photos", {
    method: "POST",
    body: payload,
    token,
    signal,
  });
}

/**
 * End-to-end Signed Direct Upload pipeline:
 * 1. Requests a signed upload ticket from the Spring Boot backend (unless `uploadedAsset` is already cached from a prior attempt).
 * 2. Uploads the original `File` directly to Cloudinary.
 * 3. Calls `onUploadedToCloudinary(asset)` so the caller can persist the uploaded asset state and transition UI to "saving".
 * 4. Verifies and saves photo metadata + categories in PostgreSQL via `completePhotoUpload`.
 */
export async function uploadPhoto(
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
    /** Cached Cloudinary asset from an earlier attempt whose DB metadata save failed. */
    uploadedAsset?: CloudinaryUploadedAsset;
    /** Invoked as soon as the file is stored in Cloudinary and before DB metadata save begins. */
    onUploadedToCloudinary?: (asset: CloudinaryUploadedAsset) => void;
    /** Optional AbortSignal to cancel an in-flight upload on unmount. */
    signal?: AbortSignal;
  } = {},
): Promise<Photo> {
  let asset = metadata.uploadedAsset;

  if (!asset) {
    const ticket = await requestPhotoUploadSignature(
      token,
      {
        fileName: file.name,
        contentType: file.type || undefined,
        fileSizeBytes: file.size > 0 ? file.size : undefined,
      },
      metadata.signal,
    );
    asset = await uploadFileDirectToCloudinary(file, ticket, metadata.signal);
  }

  metadata.onUploadedToCloudinary?.(asset);

  return completePhotoUpload(
    token,
    {
      ...asset,
      title: metadata.title,
      description: metadata.description,
      altText: metadata.altText,
      sortOrder: metadata.sortOrder,
      categoryIds: metadata.categoryIds,
      cropX: metadata.crop?.cropX,
      cropY: metadata.crop?.cropY,
      cropW: metadata.crop?.cropW,
      cropH: metadata.crop?.cropH,
    },
    metadata.signal,
  );
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
