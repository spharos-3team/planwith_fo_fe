import { type NextRequest, NextResponse } from "next/server";

import { stompUrlFromGateway } from "@/features/chat/lib/stomp-url";

export const dynamic = "force-dynamic";

function gatewayUrl(): string {
  return (process.env.GATEWAY_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    ""
  );
}

export function GET(request: NextRequest) {
  const url = stompUrlFromGateway({
    forwardedProto: request.headers.get("x-forwarded-proto"),
    gatewayUrl: gatewayUrl(),
    requestHost:
      request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  });
  return NextResponse.json({ url });
}
