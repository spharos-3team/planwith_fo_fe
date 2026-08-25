import { type NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_HEADER = "x-planwith-access-token";

function hasBearer(value: string | null): boolean {
  return Boolean(value?.toLowerCase().startsWith("bearer "));
}

/**
 * Next.js rewrite/proxy가 Authorization을 빼는 경우가 있어,
 * apiClient가 같이 보내는 X-Planwith-Access-Token으로 Bearer를 복구한다.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const authorization = requestHeaders.get("authorization");
  const fallback = requestHeaders.get(ACCESS_TOKEN_HEADER);

  if (fallback && !hasBearer(authorization)) {
    requestHeaders.set(
      "authorization",
      hasBearer(fallback) ? fallback : `Bearer ${fallback}`
    );
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/api/v1/:path*",
    "/api/planwith-fo-grade/:path*",
    "/api/planwith-fo-membership/:path*",
  ],
};
