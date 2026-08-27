"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { listChatRooms } from "@/services/chat/chat-rooms";

export const chatRoomsQueryKey = ["chat-rooms"] as const;

export function useChatRooms(options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: chatRoomsQueryKey,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: true,
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
