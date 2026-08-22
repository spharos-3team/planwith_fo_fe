"use client";

import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { FollowersPage } from "@/features/mypage/components/FollowersPage";

export default function MyPageFollowersRoute() {
  const { profile } = useAuth();

  if (!profile?.memberUuid) {
    return <StatusMessage>회원 정보를 불러오는 중입니다.</StatusMessage>;
  }

  return <FollowersPage memberUuid={profile.memberUuid} />;
}
