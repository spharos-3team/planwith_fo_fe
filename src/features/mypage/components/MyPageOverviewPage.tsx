"use client";

import { useQuery } from "@tanstack/react-query";

import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { MyPageProfileSummary } from "@/features/mypage/components/MyPageProfileSummary";
import { MyPageSectionHeading } from "@/features/mypage/components/MyPageSectionHeading";
import { StoryGrid } from "@/features/mypage/components/StoryGrid";
import { useApiError } from "@/hooks/useApiError";
import { getPublicProfile } from "@/services/member/mypage";

export function MyPageOverviewPage() {
  const { profile } = useAuth();
  const memberUuid = profile?.memberUuid ?? "";
  const profileQuery = useQuery({
    queryKey: ["members", memberUuid, "public-profile"],
    queryFn: () => getPublicProfile(memberUuid),
    enabled: Boolean(memberUuid),
  });
  const error = useApiError(profileQuery.error);

  if (!profile) {
    return <StatusMessage>회원 정보를 불러오는 중입니다.</StatusMessage>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <MyPageProfileSummary
        followerCount={profileQuery.data?.followerCount}
        followingCount={profileQuery.data?.followingCount}
        memberUuid={profile.memberUuid}
        nickname={profile.nickname}
        profileImage={profile.profileImage}
        profileIntro={profile.profileIntro}
      />

      {error ? <StatusMessage role="alert">{error}</StatusMessage> : null}

      <section className="flex w-full flex-col gap-6 py-4">
        <MyPageSectionHeading
          actionHref="/mypage/stories"
          actionLabel="전체보기"
          title="내 여행 스토리"
        />
        <StoryGrid message="등록된 여행 스토리가 없습니다." />
      </section>
    </div>
  );
}
