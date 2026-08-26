"use client";

import { Badge } from "@/components/common/Badge";
import {
  formatChatListTime,
  previewChatContent,
} from "@/features/chat/lib/format";
import type { ChatRoomListItem } from "@/features/chat/types";

interface ChatRoomListItemButtonProps {
  room: ChatRoomListItem;
  selected: boolean;
  onSelect: (chatRoomUuid: string) => void;
}

export function ChatRoomListItemButton({
  room,
  selected,
  onSelect,
}: ChatRoomListItemButtonProps) {
  const unread = room.unreadCount > 0;
  const ended = room.roomStatus === "ENDED";

  return (
    <button
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
        selected ? "bg-blue-ice" : "bg-surface-default hover:bg-surface-page"
      }`}
      onClick={() => onSelect(room.chatRoomUuid)}
      type="button"
    >
      <div className="grid size-12 shrink-0 place-items-center rounded-circle bg-brand-primary/15 text-body-md font-bold text-brand-primary">
        {room.roomName.trim().slice(0, 1) || "모"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-body-md font-bold text-text-primary">
            {room.roomName}
          </p>
          {ended ? (
            <Badge size="sm" tone="gray">
              종료
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-caption text-text-secondary">
          {previewChatContent(room.lastMessage?.content, false)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <time className="text-caption-sm text-text-disabled">
          {formatChatListTime(room.lastMessage?.createdAt)}
        </time>
        {unread ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-status-error px-1.5 text-[11px] font-bold text-text-inverse">
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}
