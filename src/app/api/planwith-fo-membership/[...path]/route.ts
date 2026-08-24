import type { NextRequest } from "next/server";

import { proxyGatewayRequest } from "@/lib/server/proxyGatewayRequest";

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return proxyGatewayRequest(
    request,
    `/api/planwith-fo-membership/${path.join("/")}`
  );
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
