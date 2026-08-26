"use client";

import { useQuery } from "@tanstack/react-query";

import { getPublicProfile } from "@/services/member/mypage";

export function usePublicProfile(memberUuid: string | null | undefined) {
  return useQuery({
    queryKey: ["members", memberUuid, "public-profile"],
    queryFn: () => getPublicProfile(memberUuid as string),
    enabled: Boolean(memberUuid),
    retry: false,
    staleTime: 60_000,
  });
}
