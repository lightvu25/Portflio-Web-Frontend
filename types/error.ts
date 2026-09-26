/**
 * Backend error response shape — verified against
 * common/exception/GlobalExceptionHandler.java and
 * common/security/RateLimitFilter.java (429 uses the same fields).
 *
 * All error bodies contain: timestamp, status, error, message, path.
 * Validation errors (400 VALIDATION_ERROR) additionally include fieldErrors.
 */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  /** Backend error code, e.g. VALIDATION_ERROR, BOOKING_CONFLICT, RATE_LIMITED, CAPTCHA_FAILED. */
  error: string;
  message: string;
  path: string;
  /** Present only on 400 VALIDATION_ERROR responses. */
  fieldErrors?: Record<string, string>;
}
