export function isChatRoomReadonly(
  roomStatus: string | null | undefined,
  forceReadonly: boolean
): boolean {
  return forceReadonly || roomStatus === "ENDED" || roomStatus === "DISBANDED";
}

export function formatChatClock(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatChatListTime(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  if (isSameDay(date, now)) {
    return formatChatClock(iso);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return "어제";
  }

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function formatChatDayLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function previewChatContent(
  content: string | null | undefined,
  deleted = false
): string {
  if (deleted) {
    return "삭제된 메시지입니다.";
  }

  const trimmed = content?.trim() ?? "";
  return trimmed || "아직 메시지가 없습니다";
}
