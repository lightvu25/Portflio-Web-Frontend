/**
 * Category endpoints.
 * Public: GET /api/categories
 * Admin:  GET/POST /api/admin/categories, PUT/DELETE /api/admin/categories/{id}
 */

import { apiFetch } from "./client";
import type { Category, CategoryRequest } from "@/types/category";

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export function getAdminCategories(token: string): Promise<Category[]> {
  return apiFetch<Category[]>("/api/admin/categories", { token });
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
