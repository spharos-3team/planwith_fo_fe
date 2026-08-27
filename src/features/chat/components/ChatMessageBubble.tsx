"use client";

import { ChatMessageFiles } from "@/features/chat/components/ChatMessageFiles";
import { formatChatClock } from "@/features/chat/lib/format";
import type { ChatMessage } from "@/features/chat/types";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { usePublicProfile } from "@/features/mypage/hooks/usePublicProfile";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
  showMeta: boolean;
  onProfileClick: (memberUuid: string) => void;
}

export function ChatMessageBubble({
  message,
  mine,
  showMeta,
  onProfileClick,
}: ChatMessageBubbleProps) {
  const profileQuery = usePublicProfile(mine ? null : message.senderUuid);
  const nickname = profileQuery.data?.nickname ?? "여행자";
  const body = message.deleted
    ? "삭제된 메시지입니다."
    : (message.content?.trim() ?? "");
  const statusLabel = message.deleted
    ? "삭제됨"
    : message.modified
      ? "수정됨"
      : null;
  const files = message.deleted ? [] : message.files;

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      {showMeta && !mine ? (
        <p className="mb-1 ml-11 px-1 text-caption-sm font-bold text-text-secondary">
          {nickname}
        </p>
      ) : null}
      <div
        className={`flex max-w-[min(100%,28rem)] items-start gap-2 ${
          mine ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!mine ? (
          <div className="grid size-9 shrink-0 place-items-start">
            {showMeta ? (
              <button
                aria-label={`${nickname} 프로필`}
                className="size-9"
                onClick={() => onProfileClick(message.senderUuid)}
                type="button"
              >
                <ProfileAvatar
                  memberUuid={message.senderUuid}
                  nickname={nickname}
                  size={36}
                  src={profileQuery.data?.profileImage ?? null}
                />
              </button>
            ) : null}
          </div>
        ) : null}
        <div
          className={`flex min-w-0 items-end gap-1 ${mine ? "flex-row-reverse" : ""}`}
        >
          <div className="min-w-0">
            {files.length > 0 ? (
              <ChatMessageFiles files={files} mine={mine} />
            ) : null}
            {body ? (
              <p
                className={`whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-body-sm ${
                  files.length > 0 ? "mt-1" : ""
                } ${
                  message.deleted
                    ? "bg-surface-page text-text-disabled"
                    : mine
                      ? "bg-brand-primary text-text-inverse"
                      : "bg-blue-ice text-text-primary"
                }`}
              >
                {body}
              </p>
            ) : null}
            {statusLabel ? (
              <p
                className={`mt-0.5 text-[10px] leading-none text-text-disabled ${
                  mine ? "text-right" : "text-left"
                }`}
              >
                {statusLabel}
              </p>
            ) : null}
          </div>
          <time className="shrink-0 pb-0.5 text-caption-sm text-text-disabled">
            {formatChatClock(message.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}
