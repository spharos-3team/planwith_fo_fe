"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { listChatRooms } from "@/services/chat/chat-rooms";

export const chatRoomsQueryKey = ["chat-rooms"] as const;

export function useChatRooms() {
  return useInfiniteQuery({
    queryKey: chatRoomsQueryKey,
    queryFn: ({ pageParam }) =>
      listChatRooms({
        cursorAt: pageParam?.cursorAt,
        cursorChatRoomUuid: pageParam?.cursorChatRoomUuid,
        size: 20,
      }),
    initialPageParam: undefined as
      { cursorAt: string; cursorChatRoomUuid: string } | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.nextCursorAt || !lastPage.nextCursorChatRoomUuid) {
        return undefined;
      }
      return {
        cursorAt: lastPage.nextCursorAt,
        cursorChatRoomUuid: lastPage.nextCursorChatRoomUuid,
      };
    },
  });
}
