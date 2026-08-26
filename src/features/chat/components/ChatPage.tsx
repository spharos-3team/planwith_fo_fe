"use client";

import {
  type InfiniteData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { ChatThread } from "@/features/chat/components/ChatThread";
import {
  flattenChatMessages,
  useChatMessages,
} from "@/features/chat/hooks/useChatMessages";
import {
  chatRoomsQueryKey,
  useChatRooms,
} from "@/features/chat/hooks/useChatRooms";
import { useChatStomp } from "@/features/chat/hooks/useChatStomp";
import {
  applyIncomingToRoom,
  flattenChatRooms,
  mergeUniqueMessages,
  patchChatRoomPages,
} from "@/features/chat/lib/cache";
import {
  getHiddenChatRoomsServerSnapshot,
  getHiddenChatRoomsSnapshot,
  parseHiddenChatRoomIds,
  persistHiddenChatRoomIds,
  subscribeHiddenChatRooms,
} from "@/features/chat/lib/hidden-rooms";
import { mapChatRoomFromMeeting } from "@/features/chat/lib/map-message";
import type {
  ChatMessage,
  ChatRoomListItem,
  ChatRoomListPage,
} from "@/features/chat/types";
import { MeetingToast } from "@/features/meeting/components/MeetingToast";
import {
  getChatRoomByMeeting,
  markChatRoomRead,
} from "@/services/chat/chat-rooms";
import { getMeetingDetail } from "@/services/meeting/meetings";
import { ApiClientError } from "@/utils/apiClient";

export function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const myMemberUuid = profile?.memberUuid ?? "";

  const chatRoomUuidParam = searchParams.get("chatRoomUuid");
  const meetingUuidParam = searchParams.get("meetingUuid");
  const readonlyParam = searchParams.get("readonly") === "1";

  const hiddenRaw = useSyncExternalStore(
    subscribeHiddenChatRooms,
    getHiddenChatRoomsSnapshot,
    getHiddenChatRoomsServerSnapshot
  );
  const hiddenIds = useMemo(
    () => parseHiddenChatRoomIds(hiddenRaw),
    [hiddenRaw]
  );
  const [liveByRoom, setLiveByRoom] = useState<Record<string, ChatMessage[]>>(
    {}
  );
  const [showThread, setShowThread] = useState(
    Boolean(chatRoomUuidParam || meetingUuidParam)
  );
  const [deleteTarget, setDeleteTarget] = useState<ChatRoomListItem | null>(
    null
  );
  const [reportMemberUuid, setReportMemberUuid] = useState<string | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  const roomsQuery = useChatRooms();
  const roomsFromList = useMemo(
    () =>
      flattenChatRooms(roomsQuery.data).filter(
        (room) => !hiddenIds.has(room.chatRoomUuid)
      ),
    [hiddenIds, roomsQuery.data]
  );
  const matchedFromList = meetingUuidParam
    ? roomsFromList.find((room) => room.meetingUuid === meetingUuidParam)
    : undefined;
  const byMeetingQuery = useQuery({
    queryKey: ["chat-rooms", "by-meeting", meetingUuidParam],
    queryFn: async () => {
      try {
        return await getChatRoomByMeeting(meetingUuidParam as string);
      } catch (error) {
        if (isMissingChatRoomError(error)) {
          return null;
        }
        throw error;
      }
    },
    enabled:
      Boolean(meetingUuidParam) &&
      !chatRoomUuidParam &&
      !matchedFromList &&
      roomsQuery.isFetched,
    retry: false,
  });

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const listedRooms = useMemo(() => {
    const extra = byMeetingQuery.data
      ? mapChatRoomFromMeeting(byMeetingQuery.data)
      : null;
    if (!extra) {
      return roomsFromList;
    }
    if (
      roomsFromList.some((room) => room.chatRoomUuid === extra.chatRoomUuid)
    ) {
      return roomsFromList;
    }
    return [extra, ...roomsFromList];
  }, [byMeetingQuery.data, roomsFromList]);

  const resolvedFromMeeting =
    matchedFromList?.chatRoomUuid ?? byMeetingQuery.data?.chatRoomUuid ?? null;

  const selectedRoomUuid =
    chatRoomUuidParam ??
    resolvedFromMeeting ??
    (meetingUuidParam ? null : listedRooms[0]?.chatRoomUuid) ??
    null;

  useEffect(() => {
    selectedRef.current = selectedRoomUuid;
  }, [selectedRoomUuid]);

  const selectedRoom =
    listedRooms.find((room) => room.chatRoomUuid === selectedRoomUuid) ??
    (byMeetingQuery.data ? mapChatRoomFromMeeting(byMeetingQuery.data) : null);

  const messagesQuery = useChatMessages(selectedRoomUuid);
  const meetingQuery = useQuery({
    queryKey: ["meetings", "detail", selectedRoom?.meetingUuid],
    queryFn: () => getMeetingDetail(selectedRoom?.meetingUuid as string),
    enabled: Boolean(selectedRoom?.meetingUuid),
    retry: false,
  });

  const history = flattenChatMessages(messagesQuery.data?.pages);
  const messages = mergeUniqueMessages(
    history,
    selectedRoomUuid ? (liveByRoom[selectedRoomUuid] ?? []) : []
  );

  const handleIncoming = useCallback(
    (message: ChatMessage) => {
      setLiveByRoom((current) => {
        const existing = current[message.chatRoomUuid] ?? [];
        if (existing.some((item) => item.messageUuid === message.messageUuid)) {
          return current;
        }
        return {
          ...current,
          [message.chatRoomUuid]: [...existing, message],
        };
      });
      queryClient.setQueryData(
        chatRoomsQueryKey,
        (data: InfiniteData<ChatRoomListPage> | undefined) =>
          patchChatRoomPages(data, message.chatRoomUuid, (room) =>
            applyIncomingToRoom(
              room,
              message,
              message.chatRoomUuid === selectedRef.current
            )
          )
      );
    },
    [queryClient]
  );

  const stomp = useChatStomp({
    chatRoomUuid: selectedRoomUuid,
    memberUuid: myMemberUuid || null,
    enabled: Boolean(myMemberUuid),
    onMessage: handleIncoming,
  });

  useEffect(() => {
    if (!resolvedFromMeeting || !meetingUuidParam || chatRoomUuidParam) {
      return;
    }
    const params = new URLSearchParams();
    params.set("chatRoomUuid", resolvedFromMeeting);
    if (readonlyParam) {
      params.set("readonly", "1");
    }
    router.replace(`/chat?${params.toString()}`);
  }, [
    resolvedFromMeeting,
    meetingUuidParam,
    chatRoomUuidParam,
    readonlyParam,
    router,
  ]);

  const lastMessageUuid = messages.at(-1)?.messageUuid;
  useEffect(() => {
    if (!selectedRoomUuid || !lastMessageUuid) {
      return;
    }
    void markChatRoomRead(selectedRoomUuid, lastMessageUuid)
      .then(() => {
        queryClient.setQueryData(
          chatRoomsQueryKey,
          (data: InfiniteData<ChatRoomListPage> | undefined) =>
            patchChatRoomPages(data, selectedRoomUuid, (room) => ({
              ...room,
              unreadCount: 0,
            }))
        );
      })
      .catch(() => {
        // 읽음 실패는 목록 배지만 남을 수 있다.
      });
  }, [lastMessageUuid, queryClient, selectedRoomUuid]);

  const selectRoom = (chatRoomUuid: string) => {
    const params = new URLSearchParams();
    params.set("chatRoomUuid", chatRoomUuid);
    if (readonlyParam) {
      params.set("readonly", "1");
    }
    router.replace(`/chat?${params.toString()}`);
    setShowThread(true);
  };

  const hideRoom = (room: ChatRoomListItem) => {
    const next = new Set(hiddenIds);
    next.add(room.chatRoomUuid);
    persistHiddenChatRoomIds(next);
    const remaining = listedRooms.filter(
      (item) => item.chatRoomUuid !== room.chatRoomUuid
    );
    if (remaining[0]) {
      selectRoom(remaining[0].chatRoomUuid);
    } else {
      router.replace("/chat");
      setShowThread(false);
    }
    setToast("채팅방을 목록에서 삭제했습니다.");
  };

  const forceReadonly =
    readonlyParam || meetingQuery.data?.status === "COMPLETED";

  const missingMeetingRoom =
    Boolean(meetingUuidParam) &&
    !chatRoomUuidParam &&
    !matchedFromList &&
    roomsQuery.isFetched &&
    byMeetingQuery.isFetched &&
    !byMeetingQuery.data &&
    !byMeetingQuery.isError;

  const enterError = missingMeetingRoom
    ? "이 모임의 채팅방이 아직 없습니다. 모임 생성 후 채팅 서비스와 동기화되지 않았거나, 해체된 모임일 수 있습니다."
    : meetingUuidParam && byMeetingQuery.isError
      ? byMeetingQuery.error instanceof ApiClientError
        ? byMeetingQuery.error.message
        : "채팅방에 입장할 수 없습니다."
      : null;

  return (
    <div className="flex h-[calc(100dvh-4.75rem)] min-h-[32rem] overflow-hidden bg-surface-page xl:h-[calc(100dvh-5rem)]">
      <aside
        className={`${
          showThread ? "hidden md:flex" : "flex"
        } w-full shrink-0 flex-col border-r border-line-light bg-surface-default md:w-[22.5rem]`}
      >
        <ChatRoomList
          hasMore={Boolean(roomsQuery.hasNextPage)}
          isLoading={roomsQuery.isLoading}
          onLoadMore={() => {
            void roomsQuery.fetchNextPage();
          }}
          onSelect={selectRoom}
          rooms={listedRooms}
          selectedRoomUuid={selectedRoomUuid}
        />
      </aside>

      {enterError ? (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6">
          <StatusMessage role="alert">{enterError}</StatusMessage>
          <button
            className="text-body-sm font-bold text-brand-primary hover:underline"
            onClick={() => {
              router.replace("/chat");
              setShowThread(false);
            }}
            type="button"
          >
            채팅 목록으로
          </button>
        </div>
      ) : selectedRoom ? (
        <div
          className={`${showThread ? "flex" : "hidden md:flex"} min-w-0 flex-1`}
        >
          <ChatThread
            connected={stomp.connected}
            forceReadonly={forceReadonly}
            hasOlder={Boolean(messagesQuery.hasNextPage)}
            loadingMessages={messagesQuery.isLoading}
            loadingOlder={messagesQuery.isFetchingNextPage}
            meeting={meetingQuery.data ?? null}
            messages={messages}
            myMemberUuid={myMemberUuid}
            onBack={() => setShowThread(false)}
            onDeleteRoom={() => setDeleteTarget(selectedRoom)}
            onLoadOlder={() => {
              void messagesQuery.fetchNextPage();
            }}
            onReport={setReportMemberUuid}
            onSend={(content) => {
              if (!stomp.sendText(content)) {
                setToast(stomp.error ?? "메시지를 보내지 못했습니다.");
                return false;
              }
              return true;
            }}
            room={selectedRoom}
          />
        </div>
      ) : meetingUuidParam &&
        (roomsQuery.isLoading || byMeetingQuery.isFetching) ? (
        <div className="flex min-w-0 flex-1 items-center justify-center p-6">
          <StatusMessage>채팅방을 찾는 중입니다.</StatusMessage>
        </div>
      ) : (
        <div className="hidden min-w-0 flex-1 items-center justify-center p-6 md:flex">
          <StatusMessage>왼쪽에서 채팅방을 선택하세요.</StatusMessage>
        </div>
      )}

      <Modal
        cancelAction={{
          label: "취소",
          onClick: () => setDeleteTarget(null),
        }}
        confirmAction={{
          label: "삭제",
          onClick: () => {
            if (deleteTarget) {
              hideRoom(deleteTarget);
            }
            setDeleteTarget(null);
          },
        }}
        description="목록에서만 사라집니다. 실제 대화 내용은 유지됩니다."
        onClose={() => setDeleteTarget(null)}
        open={deleteTarget !== null}
        title="채팅방을 삭제할까요?"
        variant="confirm"
      />
      <Modal
        cancelAction={{
          label: "취소",
          onClick: () => setReportMemberUuid(null),
        }}
        confirmAction={{
          label: "신고",
          onClick: () => {
            setReportMemberUuid(null);
            setReportDone(true);
          },
        }}
        description="허위 신고는 제재될 수 있습니다. 이 화면에서는 신고 UI만 동작합니다."
        onClose={() => setReportMemberUuid(null)}
        open={reportMemberUuid !== null}
        title="이 사용자를 신고할까요?"
        variant="confirm"
      />
      <Modal
        onClose={() => setReportDone(false)}
        open={reportDone}
        primaryAction={{
          label: "확인",
          onClick: () => setReportDone(false),
        }}
        title="신고가 접수되었습니다"
        variant="success"
      />
      <MeetingToast message={toast} />
    </div>
  );
}

function isMissingChatRoomError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.status === 404 ||
      error.code === "CHAT_ROOM_NOT_FOUND" ||
      error.code === "CHAT_ROOM_NOT_READY")
  );
}
