import type {
  SocialLoginResponse,
  SocialSignupRequest,
} from "@/features/auth/types";
import type { SocialProvider, TokenResponse } from "@/types/api";
import { apiClient } from "@/utils/apiClient";

export function socialLogin(
  provider: SocialProvider,
  authorizationCode: string,
  redirectUri?: string,
  state?: string | null
): Promise<SocialLoginResponse> {
  return apiClient<SocialLoginResponse>(
    `/auth/${provider}/login`,
    {
      method: "POST",
      body: JSON.stringify({ authorizationCode, redirectUri, state }),
    },
    { skipAuthRefresh: true }
  );
}

export function socialSignup(
  provider: SocialProvider,
  request: SocialSignupRequest
): Promise<
  TokenResponse & { memberUuid: string; email: string; nickname: string }
> {
  return apiClient(
    `/auth/${provider}/signup`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { skipAuthRefresh: true }
  );
}
