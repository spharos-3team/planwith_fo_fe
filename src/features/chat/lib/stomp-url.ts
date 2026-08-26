function stripSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export function gatewayHttpToStompUrl(gatewayUrl: string): string {
  const origin = stripSlash(gatewayUrl.trim());
  if (!origin) {
    return "ws://127.0.0.1:8000/api/v1/chat/ws";
  }
  const wsOrigin = origin.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
  if (wsOrigin.endsWith("/api/v1")) {
    return `${wsOrigin}/chat/ws`;
  }
  return `${wsOrigin}/api/v1/chat/ws`;
}

/**
 * STOMP는 브라우저 WebSocket이라 Next.js HTTP 프록시를 타지 못한다.
 * Access Token은 URL에 넣지 않는다.
 */
export function chatStompBrokerUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL?.trim();
  if (explicit) {
    return stripSlash(explicit);
  }

  const httpBase = stripSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1"
  );

  if (/^https:\/\//i.test(httpBase)) {
    return gatewayHttpToStompUrl(httpBase);
  }

  if (/^http:\/\//i.test(httpBase)) {
    return gatewayHttpToStompUrl(httpBase);
  }

  if (typeof window === "undefined") {
    return "ws://127.0.0.1:8000/api/v1/chat/ws";
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "ws://127.0.0.1:8000/api/v1/chat/ws";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const path = httpBase.startsWith("/") ? httpBase : `/${httpBase}`;
  return `${protocol}//${window.location.host}${path}/chat/ws`;
}

export async function resolveChatStompBrokerUrl(): Promise<string> {
  try {
    const response = await fetch("/api/chat-stomp-url", { cache: "no-store" });
    if (response.ok) {
      const body: unknown = await response.json();
      if (
        typeof body === "object" &&
        body !== null &&
        "url" in body &&
        typeof body.url === "string" &&
        body.url.trim()
      ) {
        return stripSlash(body.url);
      }
    }
  } catch {
    // fall through
  }
  const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL?.trim();
  if (explicit) {
    return stripSlash(explicit);
  }
  return chatStompBrokerUrl();
}
