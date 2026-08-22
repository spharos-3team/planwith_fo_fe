import type { FollowSummary, PagedProfiles } from "@/features/mypage/types";
import { apiClient } from "@/utils/apiClient";

interface PageQuery {
  page?: number;
  size?: number;
}

function pageQuery({ page = 0, size = 20 }: PageQuery): string {
  return `page=${page}&size=${size}`;
}

export function listFollowers(memberUuid: string, query: PageQuery = {}) {
  return apiClient<PagedProfiles>(
    `/members/${memberUuid}/followers?${pageQuery(query)}`
  );
}

export function listFollowings(memberUuid: string, query: PageQuery = {}) {
  return apiClient<PagedProfiles>(
    `/members/${memberUuid}/followings?${pageQuery(query)}`
  );
}

export function followMember(memberUuid: string) {
  return apiClient<FollowSummary>(`/members/${memberUuid}/follow`, {
    method: "POST",
  });
}

export function unfollowMember(memberUuid: string) {
  return apiClient<void>(
    `/members/${memberUuid}/follow`,
    { method: "DELETE" },
    { allowEmpty: true }
  );
}
