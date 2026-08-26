import type { InfiniteData } from "@tanstack/react-query";

import { toLastMessage } from "@/features/chat/lib/map-message";
import type {
  ChatMessage,
  ChatRoomListItem,
  ChatRoomListPage,
} from "@/features/chat/types";

export function flattenChatRooms(
  data: InfiniteData<ChatRoomListPage> | undefined
): ChatRoomListItem[] {
  if (!data) {
    return [];
  }
  return data.pages.flatMap((page) => page.content);
}

export function mergeUniqueMessages(
  history: ChatMessage[],
  live: ChatMessage[]
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  [...history, ...live].forEach((message) => {
    byId.set(message.messageUuid, message);
  });
  return [...byId.values()].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export function patchChatRoomPages(
  data: InfiniteData<ChatRoomListPage> | undefined,
  chatRoomUuid: string,
  patch: (room: ChatRoomListItem) => ChatRoomListItem
): InfiniteData<ChatRoomListPage> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: page.content.map((room) =>
        room.chatRoomUuid === chatRoomUuid ? patch(room) : room
      ),
    })),
  };
}

export function applyIncomingToRoom(
  room: ChatRoomListItem,
  message: ChatMessage,
  isOpen: boolean
): ChatRoomListItem {
  return {
    ...room,
    lastMessage: toLastMessage(message),
    unreadCount: isOpen ? 0 : room.unreadCount + 1,
  };
}
