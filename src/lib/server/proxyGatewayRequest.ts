import { type NextRequest, NextResponse } from "next/server";

import type { ApiResponse } from "@/types/api";

const HOP_BY_HOP = new Set([
  "accept-encoding",
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

function gatewayOrigin(): string {
  const raw = (process.env.GATEWAY_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    ""
  );

  try {
    const url = new URL(raw);
    if (url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

function bearerAuthorization(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization;
  }

  const token = request.headers.get("x-planwith-access-token");
  if (!token) {
    return null;
  }

  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}

function cookieHeader(request: NextRequest): string | null {
  const header = request.headers.get("cookie");
  if (header) {
    return header;
  }

  const cookies = request.cookies.getAll();
  if (cookies.length === 0) {
    return null;
  }

  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

function proxyErrorResponse(error: unknown): NextResponse {
  const name = error instanceof Error ? error.name : "Error";
  const timedOut = name === "TimeoutError" || name === "AbortError";
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: {
      code: timedOut ? "GATEWAY_TIMEOUT" : "GATEWAY_UNREACHABLE",
      message: timedOut
        ? "Gateway 응답이 너무 오래 걸립니다."
        : "게이트웨이에 연결할 수 없습니다. Gateway가 8000에서 실행 중인지 확인하세요.",
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: timedOut ? 504 : 502 });
}

export async function proxyGatewayRequest(
  request: NextRequest,
  prefix: string,
  segments: string[]
): Promise<Response> {
  const target = `${gatewayOrigin()}${prefix}/${segments.join("/")}${
    new URL(request.url).search
  }`;
  const started = Date.now();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      HOP_BY_HOP.has(key.toLowerCase()) ||
      key.toLowerCase() === "authorization"
    ) {
      return;
    }
    headers.set(key, value);
  });

  const cookie = cookieHeader(request);
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const authorization = bearerAuthorization(request);
  if (authorization) {
    headers.set("Authorization", authorization);
  } else {
    headers.delete("Authorization");
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, init);
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const name = key.toLowerCase();
      if (HOP_BY_HOP.has(name) || name === "set-cookie") {
        return;
      }
      responseHeaders.set(key, value);
    });

    const responseBody =
      request.method === "HEAD" || NULL_BODY_STATUSES.has(upstream.status)
        ? null
        : await upstream.arrayBuffer();
    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: responseHeaders,
    });

    if (typeof upstream.headers.getSetCookie === "function") {
      upstream.headers.getSetCookie().forEach((cookie) => {
        response.headers.append("set-cookie", cookie);
      });
    }

    console.info(
      `[gateway-proxy] ${request.method} ${target} ${upstream.status} ${Date.now() - started}ms auth=${authorization ? "yes" : "no"}`
    );

    return response;
  } catch (error) {
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
    console.error(
      `[gateway-proxy] ${request.method} ${target} FAIL ${Date.now() - started}ms ${detail}`
    );
    return proxyErrorResponse(error);
  }
}
