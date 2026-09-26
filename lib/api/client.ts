/**
 * Centralized API client for the Spring Boot backend.
 * Base URL comes from NEXT_PUBLIC_API_URL — never hardcode it elsewhere.
 */

import type { ApiErrorResponse } from "@/types/error";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Error thrown for every non-2xx backend response. */
export class ApiError extends Error {
  readonly status: number;
  /** Backend error code (e.g. "BOOKING_CONFLICT"), or "UNKNOWN" if unparsable. */
  readonly errorCode: string;
  readonly path: string | undefined;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(body: ApiErrorResponse | null, fallbackStatus: number) {
    super(body?.message ?? `Request failed with status ${fallbackStatus}`);
    this.name = "ApiError";
    this.status = body?.status ?? fallbackStatus;
    this.errorCode = body?.error ?? "UNKNOWN";
    this.path = body?.path;
    this.fieldErrors = body?.fieldErrors;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serializable request body. */
  body?: unknown;
  /** Multipart body; when set, `body` is ignored and no Content-Type is set. */
  formData?: FormData;
  /** JWT for admin endpoints. */
  token?: string;
}

/**
 * Thin fetch wrapper: JSON/FormData handling + consistent error parsing.
 * GET responses are never cached (no-store) — availability and booking
 * data must always be fresh.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, formData, token } = options;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined && !formData) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(errorBody, response.status);
  }

  // 204 No Content and empty bodies
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
