/**
 * Feedback endpoints.
 * Public: GET /api/feedback (published only), POST /api/feedback
 * Admin:  GET /api/admin/feedbacks, PUT /{id}, POST /{id}/image (multipart), DELETE /{id}
 */

import { apiFetch } from "./client";
import type { Feedback, FeedbackRequest, FeedbackUpdateRequest } from "@/types/feedback";

export function getFeedback(): Promise<Feedback[]> {
  return apiFetch<Feedback[]>("/api/feedback");
}

/** New feedback starts unpublished — admin must approve. */
export function createFeedback(request: FeedbackRequest): Promise<Feedback> {
  return apiFetch<Feedback>("/api/feedback", { method: "POST", body: request });
}

export function getAdminFeedback(token: string): Promise<Feedback[]> {
  return apiFetch<Feedback[]>("/api/admin/feedbacks", { token });
}

export function updateFeedback(token: string, id: number, request: FeedbackUpdateRequest): Promise<Feedback> {
  return apiFetch<Feedback>(`/api/admin/feedbacks/${id}`, { method: "PUT", body: request, token });
}

export function attachFeedbackImage(token: string, id: number, file: File): Promise<Feedback> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<Feedback>(`/api/admin/feedbacks/${id}/image`, { method: "POST", formData, token });
}

export function deleteFeedback(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/api/admin/feedbacks/${id}`, { method: "DELETE", token });
}
