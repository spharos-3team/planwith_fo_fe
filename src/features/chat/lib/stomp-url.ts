function stripSlash(value: string): string {
  return value.replace(/\/$/, "");
}

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function parseHttpish(url: string): URL | null {
  try {
    const normalized = url
      .trim()
      .replace(/^wss:/i, "https:")
      .replace(/^ws:/i, "http:");
    return new URL(normalized);
  } catch {
    return null;
  }
}

export function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname.toLowerCase());
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

function requestLooksLikeHostedFrontend(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.endsWith(".vercel.app") ||
    host === "planwith.store" ||
    host.endsWith(".planwith.store")
  );
}

/**
 * STOMP URL for the browser.
 * NEXT_PUBLIC_WS_BASE_URL wins (Vercel runtime on this Route Handler).
 * Loopback GATEWAY_URL is rewritten to the request host only for LAN Next+Gateway
 * on the same machine — never for Vercel, which cannot proxy WebSocket.
 */
export function stompUrlFromGateway(options: {
  gatewayUrl: string;
  requestHost: string | null;
  forwardedProto: string | null;
}): string {
  const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL?.trim();
  if (explicit) {
    return stripSlash(explicit);
  }

  const gatewayRaw = options.gatewayUrl.trim() || "http://127.0.0.1:8000";
  const gateway = parseHttpish(gatewayRaw) ?? new URL("http://127.0.0.1:8000");
  const requestHost = (options.requestHost ?? "").split(",")[0]?.trim() ?? "";
  const requestHostname = requestHost.split(":")[0] ?? "";

  if (
    isLoopbackHostname(gateway.hostname) &&
    requestHostname &&
    !isLoopbackHostname(requestHostname) &&
    !requestLooksLikeHostedFrontend(requestHostname)
  ) {
    const https =
      options.forwardedProto === "https" || gateway.protocol === "https:";
    const port = gateway.port || (https ? "443" : "8000");
    const scheme = https ? "wss" : "ws";
    return `${scheme}://${requestHostname}:${port}/api/v1/chat/ws`;
  }

  return gatewayHttpToStompUrl(gatewayRaw);
}

/**
 * HTTPS pages cannot open ws:// (mixed content). Loopback on a remote page
 * is the user's own machine, not the Gateway.
 */
export function adaptStompUrlForBrowser(url: string): {
  url: string;
  blockedReason: string | null;
} {
  const trimmed = stripSlash(url.trim());
  const parsed = parseHttpish(trimmed);
  if (
    parsed &&
    isLoopbackHostname(parsed.hostname) &&
    typeof window !== "undefined" &&
    !isLoopbackHostname(window.location.hostname)
  ) {
    return {
      url: trimmed,
      blockedReason:
        "채팅 서버가 localhost로 잡혀 연결할 수 없습니다. NEXT_PUBLIC_WS_BASE_URL에 게이트웨이 주소를 넣으세요.",
    };
  }

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    trimmed.startsWith("ws://")
  ) {
    return {
      url: `wss://${trimmed.slice("ws://".length)}`,
      blockedReason: null,
    };
  }

  return { url: trimmed, blockedReason: null };
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
