import type { TokenResponse } from "@/types/api";
import { apiClient } from "@/utils/apiClient";

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiClient<TokenResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    { skipAuthRefresh: true }
  );
}

export function refreshToken(): Promise<TokenResponse> {
  return apiClient<TokenResponse>(
    "/auth/refresh",
    { method: "POST" },
    { skipAuthRefresh: true }
  );
}

export function logout(): Promise<void> {
  return apiClient<void>(
    "/auth/logout",
    { method: "POST" },
    { allowEmpty: true }
  );
}
