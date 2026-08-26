"use client";

import { StatusMessage } from "@/components/common/StatusMessage";
import { ChatRoomListItemButton } from "@/features/chat/components/ChatRoomListItemButton";
import type { ChatRoomListItem } from "@/features/chat/types";

interface ChatRoomListProps {
  rooms: ChatRoomListItem[];
  selectedRoomUuid: string | null;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (chatRoomUuid: string) => void;
}

export function ChatRoomList({
  rooms,
  selectedRoomUuid,
  isLoading,
  hasMore,
  onLoadMore,
  onSelect,
}: ChatRoomListProps) {
  if (isLoading && rooms.length === 0) {
    return (
      <div className="p-4">
        <StatusMessage>채팅방을 불러오는 중입니다.</StatusMessage>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4">
        <StatusMessage>
          참여 중인 채팅방이 없습니다. 모임에 참여하면 여기에 표시됩니다.
        </StatusMessage>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-light px-4 py-3">
        <h1 className="text-heading-md text-text-primary">채팅</h1>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <li key={room.chatRoomUuid}>
            <ChatRoomListItemButton
              onSelect={onSelect}
              room={room}
              selected={room.chatRoomUuid === selectedRoomUuid}
            />
          </li>
        ))}
        {hasMore ? (
          <li className="p-3">
            <button
              className="w-full rounded-md py-2 text-body-sm text-brand-primary hover:bg-blue-ice"
              onClick={onLoadMore}
              type="button"
            >
              이전 채팅방 더 보기
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
