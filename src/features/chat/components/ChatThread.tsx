"use client";

import { ArrowLeft, MoreVertical, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ChatMessageBubble } from "@/features/chat/components/ChatMessageBubble";
import { ChatProfilePopover } from "@/features/chat/components/ChatProfilePopover";
import {
  formatChatDayLabel,
  isChatRoomReadonly,
  isSameDay,
} from "@/features/chat/lib/format";
import type {
  ChatMessage,
  ChatRoomListItem,
  ChatSendPayload,
} from "@/features/chat/types";
import { formatMeetingPeriod } from "@/features/meeting/lib/format";
import type { MeetingDetail } from "@/features/meeting/types";

interface ChatThreadProps {
  room: ChatRoomListItem;
  meeting: MeetingDetail | null;
  messages: ChatMessage[];
  myMemberUuid: string;
  forceReadonly: boolean;
  connected: boolean;
  connectionError: string | null;
  loadingMessages: boolean;
  hasOlder: boolean;
  loadingOlder: boolean;
  onBack: () => void;
  onLoadOlder: () => void;
  onSend: (payload: ChatSendPayload) => boolean | Promise<boolean>;
  onDeleteRoom: () => void;
  onReport: (memberUuid: string) => void;
  sending: boolean;
}

export function ChatThread({
  room,
  meeting,
  messages,
  myMemberUuid,
  forceReadonly,
  connected,
  connectionError,
  loadingMessages,
  hasOlder,
  loadingOlder,
  onBack,
  onLoadOlder,
  onSend,
  onDeleteRoom,
  onReport,
  sending,
}: ChatThreadProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMemberUuid, setProfileMemberUuid] = useState<string | null>(
    null
  );
  const readonly = isChatRoomReadonly(room.roomStatus, forceReadonly);
  const period = meeting
    ? formatMeetingPeriod(meeting.startDate ?? null, meeting.endDate ?? null)
    : "";
  const memberCount = meeting
    ? `${meeting.currentMemberCount}/${meeting.maxMemberCount}명`
    : "";

  const items = useMemo(
    () => groupMessages(messages, myMemberUuid),
    [messages, myMemberUuid]
  );

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node || !stickToBottomRef.current) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-surface-page">
      <header className="flex items-center gap-2 border-b border-line-light bg-surface-default px-3 py-3">
        <button
          aria-label="채팅 목록"
          className="grid size-9 place-items-center rounded-md text-text-secondary hover:bg-surface-page md:hidden"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-body-lg font-bold text-text-primary">
            {room.roomName}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-secondary">
            {memberCount ? (
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden="true" className="size-3.5" />
                {memberCount}
              </span>
            ) : null}
            {period ? <span>{period}</span> : null}
          </p>
        </div>
        <div className="relative">
          <button
            aria-expanded={menuOpen}
            aria-label="채팅방 메뉴"
            className="grid size-9 place-items-center rounded-md text-text-secondary hover:bg-surface-page"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <MoreVertical aria-hidden="true" className="size-5" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-10 z-20 min-w-36 overflow-hidden rounded-md border border-line-light bg-surface-default shadow-[0_8px_24px_rgb(15_23_42/0.12)]">
              <button
                className="w-full px-4 py-2.5 text-left text-body-sm text-status-error hover:bg-surface-page"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteRoom();
                }}
                type="button"
              >
                채팅방 삭제
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {readonly ? (
        <p className="bg-status-warning-bg px-4 py-2 text-center text-caption text-status-error">
          종료된 모임 채팅방입니다. 이전 대화만 볼 수 있습니다.
        </p>
      ) : null}

      <div
        className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4"
        onScroll={(event) => {
          const node = event.currentTarget;
          const fromBottom =
            node.scrollHeight - node.scrollTop - node.clientHeight;
          stickToBottomRef.current = fromBottom < 80;
          if (node.scrollTop < 48 && hasOlder && !loadingOlder) {
            const previousHeight = node.scrollHeight;
            onLoadOlder();
            requestAnimationFrame(() => {
              node.scrollTop = node.scrollHeight - previousHeight;
            });
          }
        }}
        ref={scrollerRef}
      >
        {hasOlder ? (
          <div className="mb-3 text-center">
            <button
              className="text-caption text-brand-primary hover:underline"
              disabled={loadingOlder}
              onClick={onLoadOlder}
              type="button"
            >
              {loadingOlder ? "불러오는 중…" : "이전 메시지 보기"}
            </button>
          </div>
        ) : null}
        {loadingMessages && messages.length === 0 ? (
          <p className="py-10 text-center text-body-sm text-text-secondary">
            메시지를 불러오는 중입니다.
          </p>
        ) : null}
        {!loadingMessages && messages.length === 0 ? (
          <p className="py-10 text-center text-body-sm text-text-secondary">
            아직 메시지가 없습니다. 첫 인사를 남겨 보세요.
          </p>
        ) : null}
        <div className="space-y-3">
          {items.map((item) =>
            item.kind === "day" ? (
              <p
                className="py-2 text-center text-caption-sm text-text-disabled"
                key={item.key}
              >
                {item.label}
              </p>
            ) : (
              <ChatMessageBubble
                key={item.message.messageUuid}
                message={item.message}
                mine={item.mine}
                onProfileClick={setProfileMemberUuid}
                showMeta={item.showMeta}
              />
            )
          )}
        </div>
        {profileMemberUuid ? (
          <div className="absolute left-4 top-4 z-30">
            <ChatProfilePopover
              memberUuid={profileMemberUuid}
              onClose={() => setProfileMemberUuid(null)}
              onReport={() => {
                const target = profileMemberUuid;
                setProfileMemberUuid(null);
                onReport(target);
              }}
            />
          </div>
        ) : null}
      </div>

      <ChatComposer
        disabled={readonly || !connected}
        onSend={onSend}
        placeholder={
          readonly
            ? "종료된 채팅방에서는 메시지를 보낼 수 없습니다"
            : connected
              ? "메시지를 입력하세요"
              : (connectionError ?? "실시간 연결 중입니다…")
        }
        sending={sending}
      />
    </div>
  );
}

type ThreadItem =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "message";
      message: ChatMessage;
      mine: boolean;
      showMeta: boolean;
    };

function groupMessages(
  messages: ChatMessage[],
  myMemberUuid: string
): ThreadItem[] {
  const items: ThreadItem[] = [];
  let previous: ChatMessage | null = null;

  messages.forEach((message) => {
    const currentDay = new Date(message.createdAt);
    const previousDay = previous ? new Date(previous.createdAt) : null;
    if (!previousDay || !isSameDay(currentDay, previousDay)) {
      items.push({
        kind: "day",
        key: `day-${message.createdAt}`,
        label: formatChatDayLabel(message.createdAt),
      });
    }

    const mine = message.senderUuid === myMemberUuid;
    const showMeta =
      !mine &&
      (!previous ||
        previous.senderUuid !== message.senderUuid ||
        !previousDay ||
        !isSameDay(currentDay, previousDay));

    items.push({ kind: "message", message, mine, showMeta });
    previous = message;
  });

  return items;
}
