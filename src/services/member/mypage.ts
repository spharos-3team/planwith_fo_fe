import type {
  MemberAgreement,
  PublicProfile,
  UpdateMyPageRequest,
  UpdateMyPageResult,
} from "@/features/mypage/types";
import { apiClient } from "@/utils/apiClient";

export function listMyAgreements() {
  return apiClient<MemberAgreement[]>("/members/me/agreements");
}

export function updateMyPage(request: UpdateMyPageRequest) {
  return apiClient<UpdateMyPageResult>("/members/me", {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function getPublicProfile(memberUuid: string) {
  return apiClient<PublicProfile>(`/members/${memberUuid}/profile`);
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiClient<void>(
    "/members/me/password",
    {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    },
    { allowEmpty: true }
  );
}

export function withdrawMember() {
  return apiClient<void>(
    "/members/me",
    { method: "DELETE" },
    { allowEmpty: true }
  );
}
