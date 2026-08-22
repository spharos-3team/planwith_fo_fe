import { apiClient } from "@/utils/apiClient";

const publicJson = { skipAuthRefresh: true };

export interface FindEmailResult {
  email: string;
  maskedEmail: string;
  loginType: "LOCAL" | "GOOGLE" | "NAVER" | "KAKAO" | string;
}

export interface PasswordResetRequestResult {
  email: string;
  expiresInSeconds: number;
  message: string;
}

export function findEmailByPhone(phoneNumber: string) {
  return apiClient<FindEmailResult>(
    "/auth/find-email",
    {
      method: "POST",
      body: JSON.stringify({ phoneNumber: phoneNumber.replace(/\D/g, "") }),
    },
    publicJson
  );
}

export function requestPasswordReset(email: string) {
  return apiClient<PasswordResetRequestResult>(
    "/auth/password/reset-requests",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    },
    publicJson
  );
}

export function resetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  return apiClient<void>(
    "/auth/password/reset",
    {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      }),
    },
    { ...publicJson, allowEmpty: true }
  );
}
