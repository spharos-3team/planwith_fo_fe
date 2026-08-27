"use client";

import Link from "next/link";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { useDismissibleOpen } from "@/components/common/layout/useDismissibleOpen";
import { useChatRooms } from "@/features/chat/hooks/useChatRooms";
import { flattenChatRooms } from "@/features/chat/lib/cache";
import {
  formatChatListTime,
  previewChatContent,
} from "@/features/chat/lib/format";
import {
  getHiddenChatRoomsServerSnapshot,
  getHiddenChatRoomsSnapshot,
  parseHiddenChatRoomIds,
  subscribeHiddenChatRooms,
} from "@/features/chat/lib/hidden-rooms";

const INBOX_LIMIT = 8;

export function HeaderChatInbox({
  children,
  onNavigate,
}: {
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const { open, setOpen, ref } = useDismissibleOpen();
  const { data, isLoading, isError, refetch } = useChatRooms({ enabled: true });
  const hiddenRaw = useSyncExternalStore(
    subscribeHiddenChatRooms,
    getHiddenChatRoomsSnapshot,
    getHiddenChatRoomsServerSnapshot
  );
  const hiddenIds = useMemo(
    () => parseHiddenChatRoomIds(hiddenRaw),
    [hiddenRaw]
  );
  const rooms = useMemo(
    () =>
      flattenChatRooms(data).filter(
        (room) => !hiddenIds.has(room.chatRoomUuid)
      ),
    [data, hiddenIds]
  );
  const inboxRooms = rooms.slice(0, INBOX_LIMIT);
  const totalUnread = rooms.reduce((sum, room) => sum + room.unreadCount, 0);
  const unreadLabel = totalUnread > 99 ? "99+" : String(totalUnread);

  useEffect(() => {
    if (!open) {
      return;
    }
    void refetch();
  }, [open, refetch]);

  const closeAndNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          totalUnread > 0
            ? `채팅 모아보기, 안 읽은 메시지 ${unreadLabel}`
            : "채팅 모아보기"
        }
        className="relative grid place-items-center"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {children}
        {totalUnread > 0 ? (
          <span className="absolute -right-1.5 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-[10px] font-bold leading-4 text-text-inverse">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[360px] overflow-hidden rounded-[16px] border border-blue-ice bg-surface-default text-text-primary shadow-landmark"
          role="dialog"
        >
          <div className="flex items-center justify-between border-b border-blue-ice px-4 py-3">
            <p className="text-[16px] font-bold leading-5 text-text-primary">
              채팅 모아보기
            </p>
            <Link
              className="text-[13px] font-semibold text-brand-primary"
              href="/chat"
              onClick={closeAndNavigate}
            >
              전체보기
            </Link>
          </div>
          {isLoading && inboxRooms.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-text-secondary">
              채팅방을 불러오는 중입니다.
            </p>
          ) : null}
          {isError ? (
            <p className="px-4 py-6 text-[13px] text-status-error">
              채팅 목록을 불러오지 못했습니다.
            </p>
          ) : null}
          {!isLoading && !isError && inboxRooms.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-text-secondary">
              참여 중인 채팅방이 없습니다.
            </p>
          ) : null}
          {inboxRooms.length > 0 ? (
            <ul className="max-h-[360px] overflow-y-auto">
              {inboxRooms.map((room) => {
                const unread = room.unreadCount > 0;
                return (
                  <li key={room.chatRoomUuid}>
                    <Link
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-page"
                      href={`/chat?chatRoomUuid=${room.chatRoomUuid}`}
                      onClick={closeAndNavigate}
                    >
                      <div className="grid size-11 shrink-0 place-items-center rounded-circle bg-brand-primary/15 text-[15px] font-bold text-brand-primary">
                        {room.roomName.trim().slice(0, 1) || "모"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[14px] font-bold text-text-primary">
                            {room.roomName}
                          </p>
                          <time className="shrink-0 text-[11px] text-text-disabled">
                            {formatChatListTime(room.lastMessage?.createdAt)}
                          </time>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] text-text-secondary">
                            {previewChatContent(
                              room.lastMessage?.content,
                              false
                            )}
                          </p>
                          {unread ? (
                            <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-status-error px-1.5 text-[11px] font-bold text-text-inverse">
                              {room.unreadCount > 99 ? "99+" : room.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
