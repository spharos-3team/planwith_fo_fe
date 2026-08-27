export type ChatRoomStatus = "ACTIVE" | "ENDED" | "DISBANDED";

export interface ChatLastMessage {
  messageUuid: string;
  content: string;
  senderUuid: string;
  createdAt: string;
}

export interface ChatRoomListItem {
  chatRoomUuid: string;
  meetingUuid: string;
  roomName: string;
  roomStatus: ChatRoomStatus | string;
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
}

export interface ChatRoomListPage {
  content: ChatRoomListItem[];
  nextCursorAt: string | null;
  nextCursorChatRoomUuid: string | null;
}

export interface ChatRoomByMeeting {
  chatRoomUuid: string;
  meetingUuid: string;
  roomName: string;
  roomStatus: ChatRoomStatus | string;
}

export type ChatFileType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "ETC";

export interface ChatFileAttachment {
  fileType: ChatFileType | string;
  url: string;
  name: string | null;
}

export interface ChatMessage {
  messageUuid: string;
  chatRoomUuid: string;
  senderUuid: string;
  messageType: string;
  content: string | null;
  files: ChatFileAttachment[];
  modified: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageListPage {
  content: ChatMessage[];
  nextBefore: string | null;
}

export interface ChatRoomReadResult {
  chatRoomUuid: string;
  lastMessageUuid: string | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ListChatRoomsQuery {
  cursorAt?: string;
  cursorChatRoomUuid?: string;
  size?: number;
}

export interface ListChatMessagesQuery {
  before?: string;
  size?: number;
}

export interface ChatFileUploadResult {
  fileUuid: string;
  fileType: ChatFileType | string;
  url: string;
  name: string | null;
}

export interface ChatSendPayload {
  content: string;
  files: File[];
}
