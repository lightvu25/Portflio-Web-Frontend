/**
 * POST /api/auth/login — public. Returns the admin JWT.
 */

import { apiFetch } from "./client";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: request });
}
