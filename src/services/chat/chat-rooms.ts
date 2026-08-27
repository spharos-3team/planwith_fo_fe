import type {
  ChatFileUploadResult,
  ChatMessageListPage,
  ChatRoomByMeeting,
  ChatRoomListPage,
  ChatRoomReadResult,
  ListChatMessagesQuery,
  ListChatRoomsQuery,
} from "@/features/chat/types";
import { apiClient } from "@/utils/apiClient";

function toSearch(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function listChatRooms(query: ListChatRoomsQuery = {}) {
  return apiClient<ChatRoomListPage>(
    `/chat-rooms${toSearch({
      cursorAt: query.cursorAt,
      cursorChatRoomUuid: query.cursorChatRoomUuid,
      size: query.size ?? 20,
    })}`
  );
}

export function getChatRoomByMeeting(meetingUuid: string) {
  return apiClient<ChatRoomByMeeting>(
    `/chat-rooms/by-meeting/${meetingUuid}`,
    {},
    { quiet: true }
  );
}

export function listChatMessages(
  chatRoomUuid: string,
  query: ListChatMessagesQuery = {}
) {
  return apiClient<ChatMessageListPage>(
    `/chat-rooms/${chatRoomUuid}/messages${toSearch({
      before: query.before,
      size: query.size ?? 30,
    })}`
  );
}

export function markChatRoomRead(
  chatRoomUuid: string,
  lastReadMessageUuid?: string | null
) {
  return apiClient<ChatRoomReadResult>(`/chat-rooms/${chatRoomUuid}/read`, {
    method: "POST",
    body: JSON.stringify(lastReadMessageUuid ? { lastReadMessageUuid } : {}),
  });
}

export function uploadChatFile(chatRoomUuid: string, file: File) {
  const body = new FormData();
  body.append("file", file, file.name || "file");
  return apiClient<ChatFileUploadResult>(`/chat-rooms/${chatRoomUuid}/files`, {
    method: "POST",
    body,
  });
}
