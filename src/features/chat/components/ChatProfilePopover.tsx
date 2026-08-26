"use client";

import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { usePublicProfile } from "@/features/mypage/hooks/usePublicProfile";

interface ChatProfilePopoverProps {
  memberUuid: string;
  onClose: () => void;
  onReport: () => void;
}

export function ChatProfilePopover({
  memberUuid,
  onClose,
  onReport,
}: ChatProfilePopoverProps) {
  const profileQuery = usePublicProfile(memberUuid);
  const nickname = profileQuery.data?.nickname ?? "여행자";
  const intro = profileQuery.data?.profileIntro?.trim() || "소개가 없습니다.";

  return (
    <div
      className="w-[16.5rem] rounded-xl border border-line-light bg-surface-default p-4 shadow-[0_12px_28px_rgb(15_23_42/0.12)]"
      role="dialog"
    >
      <div className="flex items-start gap-3">
        <ProfileAvatar
          memberUuid={memberUuid}
          nickname={nickname}
          size={56}
          src={profileQuery.data?.profileImage ?? null}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-md font-bold text-text-primary">
            {nickname}
          </p>
          <p className="mt-1 line-clamp-3 text-caption text-text-secondary">
            {profileQuery.isLoading ? "프로필을 불러오는 중…" : intro}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 rounded-md border border-line-light py-2 text-body-sm text-text-secondary hover:bg-surface-page"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
        <button
          className="flex-1 rounded-md bg-status-error py-2 text-body-sm font-bold text-text-inverse hover:bg-status-error/90"
          onClick={onReport}
          type="button"
        >
          신고하기
        </button>
      </div>
    </div>
  );
}
