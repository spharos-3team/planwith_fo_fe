import { type NextRequest } from "next/server";

import { proxyGatewayRequest } from "@/lib/server/proxyGatewayRequest";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyGatewayRequest(request, "/api/planwith-fo-token", path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
