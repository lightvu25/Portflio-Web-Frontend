/**
 * Types matching feedback/entity/Feedback.java JSON and feedback DTOs.
 */

export interface Feedback {
  id: number;
  customerName: string;
  content: string | null;
  cloudinaryPublicId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/feedback request body (feedback/dto/FeedbackRequest.java). */
export interface FeedbackRequest {
  customerName: string;
  content: string;
}

/** PUT /api/admin/feedbacks/{id} request body (feedback/dto/FeedbackUpdateRequest.java). */
export interface FeedbackUpdateRequest {
  customerName: string;
  content?: string;
  sortOrder?: number;
  isPublished?: boolean;
}
