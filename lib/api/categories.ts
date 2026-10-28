/**
 * Category endpoints.
 * Public: GET /api/categories
 * Admin:  GET/POST /api/admin/categories, PUT/DELETE /api/admin/categories/{id}
 */

import { isScrollCategory, SCROLL_CATEGORY_SLUG } from "@/lib/labels";
import { apiFetch } from "./client";
import type { Category, CategoryRequest } from "@/types/category";

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function getAdminCategories(token: string): Promise<Category[]> {
  const list = await apiFetch<Category[]>("/api/admin/categories", { token });
  if (list.some(isScrollCategory)) {
    return list;
  }
  // Auto-seed the reserved "Scroll" category if the backend hasn't run V18 yet.
  try {
    const created = await createCategory(token, {
      name: "Scroll",
      slug: SCROLL_CATEGORY_SLUG,
      sortOrder: 997,
      type: "SCROLL",
    });
    return [...list, created];
  } catch {
    try {
      const fallback = await createCategory(token, {
        name: "Scroll",
        slug: SCROLL_CATEGORY_SLUG,
        sortOrder: 997,
        type: "PORTFOLIO",
      });
      return [...list, fallback];
    } catch {
      return list;
    }
  }
}

export function createCategory(token: string, request: CategoryRequest): Promise<Category> {
  return apiFetch<Category>("/api/admin/categories", { method: "POST", body: request, token });
}

export function updateCategory(token: string, id: number, request: CategoryRequest): Promise<Category> {
  return apiFetch<Category>(`/api/admin/categories/${id}`, { method: "PUT", body: request, token });
}

export function deleteCategory(token: string, id: number): Promise<void> {
  return apiFetch<void>(`/api/admin/categories/${id}`, { method: "DELETE", token });
}
