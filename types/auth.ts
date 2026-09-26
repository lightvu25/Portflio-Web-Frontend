/**
 * Types matching auth/dto/LoginRequest.java and auth/dto/LoginResponse.java.
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
