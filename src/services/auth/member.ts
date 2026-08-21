import type {
  LocalSignupRequest,
  LocalSignupResponse,
  MemberMe,
  MemberProfile,
  TermDetail,
  TermItem,
} from "@/features/auth/types";
import { apiClient } from "@/utils/apiClient";

const publicJson = { skipAuthRefresh: true };

export interface EmailVerificationSendResult {
  email: string;
  expiresInSeconds: number;
  message: string;
}

export interface EmailVerificationConfirmResult {
  email: string;
  verified: boolean;
}

export interface PhoneVerificationPrepareResult {
  storeId: string;
  channelKey: string;
  identityVerificationId: string;
}

export interface PhoneVerificationConfirmResult {
  verified: boolean;
  phoneNumber: string;
  maskedPhoneNumber: string;
  name: string;
}

function jsonBody(payload: Record<string, string | undefined>): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(payload).filter((entry): entry is [string, string] =>
        Boolean(entry[1])
      )
    )
  );
}

export function sendEmailVerification(email: string) {
  return apiClient<EmailVerificationSendResult>(
    "/auth/email-verifications",
    {
      method: "POST",
      body: jsonBody({ email: email.trim().toLowerCase() }),
    },
    publicJson
  );
}

export function confirmEmailVerification(email: string, code: string) {
  return apiClient<EmailVerificationConfirmResult>(
    "/auth/email-verifications/confirm",
    {
      method: "POST",
      body: jsonBody({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      }),
    },
    publicJson
  );
}

export function preparePhoneVerification(phoneNumber?: string, name?: string) {
  return apiClient<PhoneVerificationPrepareResult>(
    "/auth/phone-verifications",
    {
      method: "POST",
      body: jsonBody({
        phoneNumber: phoneNumber?.replace(/\D/g, ""),
        name: name?.trim(),
      }),
    },
    publicJson
  );
}

export function confirmPhoneVerification(identityVerificationId: string) {
  return apiClient<PhoneVerificationConfirmResult>(
    "/auth/phone-verifications/confirm",
    {
      method: "POST",
      body: jsonBody({ identityVerificationId }),
    },
    publicJson
  );
}

export function listTerms() {
  return apiClient<TermItem[]>("/terms", { method: "GET" }, publicJson);
}

export function getTermDetail(termUuid: string) {
  return apiClient<TermDetail>(
    `/terms/${termUuid}`,
    { method: "GET" },
    publicJson
  );
}

export function checkNicknameAvailability(nickname: string) {
  return apiClient<{ nickname: string; available: boolean }>(
    `/members/nicknames/availability?nickname=${encodeURIComponent(nickname)}`,
    { method: "GET" },
    publicJson
  );
}

export function signupLocal(request: LocalSignupRequest) {
  return apiClient<LocalSignupResponse>(
    "/members",
    {
      method: "POST",
      body: JSON.stringify({
        ...request,
        email: request.email.trim().toLowerCase(),
        phoneNumber: request.phoneNumber.replace(/\D/g, ""),
        name: request.name.trim(),
      }),
    },
    publicJson
  );
}

export function getMyMember() {
  return apiClient<MemberMe>("/members/me");
}

export function getMyProfile() {
  return apiClient<MemberProfile>("/members/me/profile");
}

export function uploadProfileImage(file: File) {
  const body = new FormData();
  body.append("file", file);

  return apiClient<{ profileImage: string }>("/members/me/profile/image", {
    method: "POST",
    body,
  });
}
