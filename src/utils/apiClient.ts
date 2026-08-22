import { getAccessToken, setAccessToken } from "@/lib/auth/access-token";
import type { ApiResponse, TokenResponse } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api/v1";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface ApiClientOptions {
  skipAuthRefresh?: boolean;
  allowEmpty?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function parseJson<T>(
  response: Response
): Promise<ApiResponse<T> | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const body = await parseJson<TokenResponse>(response);

    if (!response.ok || !body?.success || !body.data?.accessToken) {
      setAccessToken(null);
      return null;
    }

    setAccessToken(body.data.accessToken);
    return body.data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {}
): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && !options.skipAuthRefresh) {
    const nextToken = await refreshAccessToken();

    if (nextToken) {
      return apiClient<T>(path, init, { ...options, skipAuthRefresh: true });
    }
  }

  if (response.status === 204 || options.allowEmpty) {
    if (response.ok) {
      return undefined as T;
    }
  }

  const body = await parseJson<T>(response);

  if (!response.ok || !body?.success || body.data === null) {
    const fallbackMessage =
      response.status >= 500 || response.status === 0
        ? "게이트웨이에 연결할 수 없습니다. .env의 GATEWAY_URL과 개발 서버 재시작을 확인하세요."
        : `요청 처리 중 오류가 발생했습니다. (HTTP ${response.status}${
            body?.error?.code ? ` ${body.error.code}` : ""
          })`;

    console.error(
      "[apiClient]",
      `${API_BASE_URL}${path}`,
      response.status,
      body
    );

    throw new ApiClientError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? fallbackMessage,
      body?.error?.fieldErrors
    );
  }

  return body.data;
}

export { refreshAccessToken };
