/**
 * Types matching gallery/entity/Category.java JSON and
 * gallery/dto/CategoryRequest.java.
 */

/** PORTFOLIO = public gallery; PACKAGE = pricing cover images (admin-only). */
export type CategoryType = "PORTFOLIO" | "PACKAGE";

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

/** POST/PUT /api/admin/categories request body. */
export interface CategoryRequest {
  name: string;
  slug?: string;
  sortOrder?: number;
  type?: CategoryType;
}
