import { Users } from "lucide-react";

import { StatusMessage } from "@/components/common/StatusMessage";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { MyPageSectionHeading } from "@/features/mypage/components/MyPageSectionHeading";
import { StoryGrid } from "@/features/mypage/components/StoryGrid";

export function LikesPage({ expanded = false }: { expanded?: boolean }) {
  if (expanded) {
    return (
      <section className="flex w-full flex-col gap-8 py-4">
        <MyPageSectionHeading
          description="커뮤니티에서 좋아요를 누른 여행 스토리 목록이에요."
          title="좋아요한 스토리"
        />
        <StoryGrid message="좋아요한 스토리가 없습니다." />
      </section>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <MyPageCard>
        <h1 className="text-heading-lg text-text-primary">좋아요 현황</h1>
        <div className="w-full rounded-lg bg-blue-ice/60 px-6 py-5">
          <p className="text-caption text-text-secondary">총 좋아요한 콘텐츠</p>
          <p className="mt-1 text-[28px] font-bold leading-none text-blue-700">
            —개
          </p>
          <div className="mt-3 flex flex-wrap gap-5 text-caption text-text-primary">
            <span>스토리 —</span>
            <span>사진 —</span>
            <span>댓글 —</span>
          </div>
        </div>
      </MyPageCard>

      <section className="flex w-full flex-col gap-6">
        <MyPageSectionHeading
          actionHref="/mypage/likes/stories"
          actionLabel="더보기"
          description="커뮤니티에서 좋아요를 누른 여행 스토리 목록이에요."
          title="좋아요한 스토리"
        />
        <StoryGrid message="좋아요한 스토리가 없습니다." />
      </section>

      <MyPageCard>
        <MyPageSectionHeading
          description="자주 좋아요를 누른 크리에이터 목록이에요."
          title="좋아요한 크리에이터"
        />
        <div className="w-full">
          <StatusMessage>
            <Users
              aria-hidden="true"
              className="mx-auto mb-3 size-6 text-brand-primary"
            />
            좋아요한 크리에이터가 없습니다.
          </StatusMessage>
        </div>
      </MyPageCard>
    </div>
  );
}
