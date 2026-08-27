import { authenticatedFetch } from "@/utils/apiClient";

export const CHAT_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const CHAT_FILE_MAX_COUNT = 5;

export function isDirectChatFileUrl(url: string | null | undefined): boolean {
  return Boolean(url && /^(https?:|blob:|data:)/i.test(url));
}

export function chatFileRequestPath(
  url: string | null | undefined
): string | null {
  if (!url) {
    return null;
  }

  const match = url.match(/\/chat-rooms\/([^/?]+)\/files\/([^/?]+)/);
  if (!match) {
    return null;
  }

  return `/chat-rooms/${match[1]}/files/${match[2]}`;
}

export async function fetchChatFileObjectUrl(
  url: string
): Promise<string | null> {
  const path = chatFileRequestPath(url);
  if (!path) {
    return isDirectChatFileUrl(url) ? url : null;
  }

  const response = await authenticatedFetch(path);
  if (!response.ok) {
    return null;
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    return null;
  }

  const type = (
    blob.type ||
    response.headers.get("content-type") ||
    ""
  ).toLowerCase();
  if (type.includes("json") || type.includes("html")) {
    return null;
  }

  return URL.createObjectURL(blob);
}

export function previewChatFileLabel(
  fileType: string | null | undefined,
  name: string | null | undefined
): string {
  switch ((fileType ?? "").toUpperCase()) {
    case "IMAGE":
      return "사진";
    case "VIDEO":
      return "동영상";
    case "AUDIO":
      return "음성";
    default:
      return name?.trim() || "파일";
  }
}
