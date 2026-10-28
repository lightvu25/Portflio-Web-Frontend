/**
 * Types matching gallery/entity/Category.java JSON and
 * gallery/dto/CategoryRequest.java.
 */

/**
 * PORTFOLIO = public gallery;
 * PACKAGE = pricing cover images;
 * FEEDBACK = customer feedback screenshots (marquee only);
 * SCROLL = homepage scroll-driven hero photos only.
 */
export type CategoryType = "PORTFOLIO" | "PACKAGE" | "FEEDBACK" | "SCROLL";

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
