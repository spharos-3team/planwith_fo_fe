import { type NextRequest, NextResponse } from "next/server";

const gatewayUrl = (process.env.GATEWAY_URL ?? "http://localhost:8000").replace(
  /\/$/,
  ""
);

const hopByHop = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  "origin",
  "referer",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "sec-fetch-user",
]);

export async function proxyGatewayRequest(
  request: NextRequest,
  upstreamPath: string
) {
  const incoming = new URL(request.url);
  const target = `${gatewayUrl}${upstreamPath}${incoming.search}`;
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!hopByHop.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    signal: request.signal,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}
