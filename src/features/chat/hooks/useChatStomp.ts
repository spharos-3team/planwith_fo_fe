"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";

import { mapChatMessage } from "@/features/chat/lib/map-message";
import {
  adaptStompUrlForBrowser,
  resolveChatStompBrokerUrl,
} from "@/features/chat/lib/stomp-url";
import type { ChatMessage } from "@/features/chat/types";
import { getAccessToken } from "@/lib/auth/access-token";

function ensureGlobalThis(): void {
  const runtime = globalThis as typeof globalThis & {
    global?: typeof globalThis;
  };
  if (runtime.global === undefined) {
    runtime.global = globalThis;
  }
}

interface UseChatStompOptions {
  chatRoomUuid: string | null;
  memberUuid: string | null;
  enabled: boolean;
  onMessage: (message: ChatMessage) => void;
}

export function useChatStomp({
  chatRoomUuid,
  memberUuid,
  enabled,
  onMessage,
}: UseChatStompOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const onMessageRef = useRef(onMessage);
  const chatRoomUuidRef = useRef(chatRoomUuid);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    chatRoomUuidRef.current = chatRoomUuid;
  }, [chatRoomUuid]);

  const subscribe = useCallback((client: Client, roomUuid: string) => {
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = client.subscribe(
      `/chat/room/${roomUuid}`,
      (frame: IMessage) => {
        try {
          const payload: unknown = JSON.parse(frame.body);
          const message = mapChatMessage(payload);
          if (message) {
            onMessageRef.current(message);
          }
        } catch {
          setError("실시간 메시지를 읽지 못했습니다.");
        }
      }
    );
  }, []);

  useEffect(() => {
    if (!enabled || !memberUuid) {
      return;
    }

    let cancelled = false;
    const client = new Client({
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: () => {
        const token = getAccessToken();
        const headers: Record<string, string> = {
          "X-Auth-User-Id": memberUuid,
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          headers["X-Planwith-Access-Token"] = token;
        }
        client.connectHeaders = headers;
      },
      onConnect: () => {
        setConnected(true);
        setError(null);
        const roomUuid = chatRoomUuidRef.current;
        if (roomUuid) {
          subscribe(client, roomUuid);
        }
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        setConnected(false);
        setError(frame.headers["message"] || "채팅 서버 오류가 발생했습니다.");
      },
      onWebSocketError: () => {
        if (cancelled) {
          return;
        }
        setConnected(false);
        setError(
          typeof window !== "undefined" && window.location.protocol === "https:"
            ? "실시간 연결에 실패했습니다. HTTPS 사이트는 wss 게이트웨이가 필요합니다."
            : "실시간 연결에 실패했습니다."
        );
      },
      onWebSocketClose: () => {
        if (cancelled) {
          return;
        }
        setConnected(false);
        setError((prev) => prev ?? "실시간 연결에 실패했습니다.");
      },
    });

    clientRef.current = client;
    void resolveChatStompBrokerUrl().then((rawUrl) => {
      if (cancelled) {
        return;
      }
      const adapted = adaptStompUrlForBrowser(rawUrl);
      if (adapted.blockedReason) {
        setError(adapted.blockedReason);
        return;
      }
      ensureGlobalThis();
      client.brokerURL = adapted.url;
      client.activate();
    });

    return () => {
      cancelled = true;
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      void client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [enabled, memberUuid, subscribe]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected || !chatRoomUuid) {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      return;
    }
    subscribe(client, chatRoomUuid);
  }, [chatRoomUuid, connected, subscribe]);

  const sendText = useCallback((content: string) => {
    const client = clientRef.current;
    const roomUuid = chatRoomUuidRef.current;
    const trimmed = content.trim();
    if (!client?.connected || !roomUuid || !trimmed) {
      return false;
    }
    client.publish({
      destination: `/app/chat/${roomUuid}/messages`,
      body: JSON.stringify({
        messageType: "TEXT",
        content: trimmed,
        files: [],
      }),
      headers: { "content-type": "application/json" },
    });
    return true;
  }, []);

  return { connected, error, sendText };
}
