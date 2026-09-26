/**
 * Types matching gallery/entity/Category.java JSON and
 * gallery/dto/CategoryRequest.java.
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** POST/PUT /api/admin/categories request body. */
export interface CategoryRequest {
  name: string;
  slug?: string;
  sortOrder?: number;
}
