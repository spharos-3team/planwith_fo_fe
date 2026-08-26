import { NextResponse } from "next/server";

import { gatewayHttpToStompUrl } from "@/features/chat/lib/stomp-url";

export const dynamic = "force-dynamic";

function gatewayUrl(): string {
  return (process.env.GATEWAY_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    ""
  );
}

export function GET() {
  return NextResponse.json({ url: gatewayHttpToStompUrl(gatewayUrl()) });
}
