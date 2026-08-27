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
  const files = message.deleted ? [] : message.files;

  return (
    <div className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}>
      {mine ? (
        <span className="size-9 shrink-0" />
      ) : (
        <button
          aria-label={`${nickname} 프로필`}
          className="mt-5 shrink-0"
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
      )}
      <div
        className={`max-w-[min(100%,28rem)] ${mine ? "items-end" : "items-start"} flex flex-col`}
      >
        {showMeta && !mine ? (
          <p className="mb-1 px-1 text-caption-sm font-bold text-text-secondary">
            {nickname}
          </p>
        ) : null}
        <div
          className={`flex items-end gap-1 ${mine ? "flex-row-reverse" : ""}`}
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
          </div>
          <time className="shrink-0 pb-0.5 text-caption-sm text-text-disabled">
            {formatChatClock(message.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}
