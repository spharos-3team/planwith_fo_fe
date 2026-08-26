const STORAGE_KEY = "planwith.chat.hidden-rooms";

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function parseIds(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function subscribeHiddenChatRooms(
  onStoreChange: () => void
): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getHiddenChatRoomsSnapshot(): string {
  if (typeof window === "undefined") {
    return "[]";
  }
  return sessionStorage.getItem(STORAGE_KEY) ?? "[]";
}

export function getHiddenChatRoomsServerSnapshot(): string {
  return "[]";
}

export function parseHiddenChatRoomIds(raw: string): Set<string> {
  return new Set(parseIds(raw));
}

export function persistHiddenChatRoomIds(ids: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  emit();
}
