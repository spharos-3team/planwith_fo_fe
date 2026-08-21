export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  timestamp: string;
}

export interface TokenUser {
  userId: string;
  roles: string[];
  scopes: string[];
}

export interface TokenResponse {
  tokenType: "Bearer" | string;
  accessToken: string;
  accessTokenExpiresIn: number;
  user: TokenUser;
}

export type SocialProvider = "google" | "naver" | "kakao";
