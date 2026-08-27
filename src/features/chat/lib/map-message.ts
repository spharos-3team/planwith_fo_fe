import { previewChatFileLabel } from "@/features/chat/lib/file-src";
import type {
  ChatFileAttachment,
  ChatLastMessage,
  ChatMessage,
  ChatRoomListItem,
} from "@/features/chat/types";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function asStringOrNull(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const text = asString(value);
  return text ? text : null;
}

function asFiles(value: unknown): ChatFileAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const file = item as Record<string, unknown>;
    const url = asString(file.url);
    if (!url) {
      return [];
    }
    return [
      {
        fileType: asString(file.fileType, "ETC"),
        url,
        name: asStringOrNull(file.name),
      },
    ];
  });
}

export function mapChatMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const messageUuid = asString(record.messageUuid);
  const chatRoomUuid = asString(record.chatRoomUuid);
  const senderUuid = asString(record.senderUuid);
  const createdAt = asString(record.createdAt);

  if (!messageUuid || !chatRoomUuid || !senderUuid || !createdAt) {
    return null;
  }

  return {
    messageUuid,
    chatRoomUuid,
    senderUuid,
    messageType: asString(record.messageType, "TEXT"),
    content: asStringOrNull(record.content),
    files: asFiles(record.files),
    modified: Boolean(record.modified ?? record.isModified),
    deleted: Boolean(record.deleted ?? record.isDeleted),
    createdAt,
    updatedAt: asString(record.updatedAt, createdAt),
  };
}

export function mapChatRoomFromMeeting(room: {
  chatRoomUuid: string;
  meetingUuid: string;
  roomName: string;
  roomStatus: string;
}): ChatRoomListItem {
  return {
    chatRoomUuid: room.chatRoomUuid,
    meetingUuid: room.meetingUuid,
    roomName: room.roomName,
    roomStatus: room.roomStatus,
    lastMessage: null,
    unreadCount: 0,
  };
}

export function toLastMessage(message: ChatMessage): ChatLastMessage {
  return {
    messageUuid: message.messageUuid,
    content: previewOrEmpty(message),
    senderUuid: message.senderUuid,
    createdAt: message.createdAt,
  };
}

function previewOrEmpty(message: ChatMessage): string {
  if (message.deleted) {
    return "삭제된 메시지입니다.";
  }
  const text = message.content?.trim() ?? "";
  if (text) {
    return text;
  }
  if (message.files[0]) {
    return previewChatFileLabel(
      message.files[0].fileType,
      message.files[0].name
    );
  }
  return "";
}
