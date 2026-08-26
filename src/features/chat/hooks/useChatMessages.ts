"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import type { ChatMessage } from "@/features/chat/types";
import { listChatMessages } from "@/services/chat/chat-rooms";

export function chatMessagesQueryKey(chatRoomUuid: string) {
  return ["chat-rooms", chatRoomUuid, "messages"] as const;
}

export function flattenChatMessages(
  pages: { content: ChatMessage[] }[] | undefined
): ChatMessage[] {
  if (!pages) {
    return [];
  }
  return pages.flatMap((page) => page.content).reverse();
}

export function useChatMessages(chatRoomUuid: string | null) {
  return useInfiniteQuery({
    queryKey: chatRoomUuid
      ? chatMessagesQueryKey(chatRoomUuid)
      : ["chat-rooms", "messages", "idle"],
    queryFn: ({ pageParam }) =>
      listChatMessages(chatRoomUuid as string, {
        before: pageParam,
        size: 30,
      }),
    enabled: Boolean(chatRoomUuid),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextBefore ?? undefined,
  });
}
