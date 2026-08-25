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

interface RawApiError {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

let refreshPromise: Promise<string | null> | null = null;

function resolveApiUrl(path: string): string {
  return path.startsWith("/api/") ? path : `${API_BASE_URL}${path}`;
}

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

async function parseRawJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
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

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-Planwith-Access-Token", token);
  } else {
    headers.delete("Authorization");
    headers.delete("X-Planwith-Access-Token");
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    credentials: "include",
    keepalive: false,
    headers,
  });

  if (response.status === 401 && !options.skipAuthRefresh) {
    const nextToken = await refreshAccessToken();

    if (nextToken) {
      await response.arrayBuffer();
      const retryHeaders = new Headers(init.headers);
      retryHeaders.delete("Authorization");
      retryHeaders.delete("X-Planwith-Access-Token");
      return authenticatedFetch(
        path,
        { ...init, headers: retryHeaders },
        {
          ...options,
          skipAuthRefresh: true,
        }
      );
    }
  }

  return response;
}

export async function apiClient<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {}
): Promise<T> {
  const requestUrl = resolveApiUrl(path);
  const isFormData = init.body instanceof FormData;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const started = Date.now();
  const response = await authenticatedFetch(
    path,
    {
      ...init,
      headers,
    },
    options
  );
  console.info(
    `[apiClient] ${init.method ?? "GET"} ${requestUrl} ${response.status} ${Date.now() - started}ms`
  );

  if (response.status === 204 || options.allowEmpty) {
    if (response.ok) {
      return undefined as T;
    }
  }

  const body = await parseJson<T>(response);

  if (!response.ok || !body?.success) {
    const fallbackMessage =
      response.status === 0 || body?.error?.code === "GATEWAY_UNREACHABLE"
        ? "게이트웨이에 연결할 수 없습니다. Gateway가 8000에서 실행 중인지 확인하세요."
        : `요청 처리 중 오류가 발생했습니다. (HTTP ${response.status}${
            body?.error?.code ? ` ${body.error.code}` : ""
          })`;

    console.error("[apiClient]", requestUrl, response.status, body);

    throw new ApiClientError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? fallbackMessage,
      body?.error?.fieldErrors
    );
  }

  if (body.data === null) {
    if (options.allowEmpty || response.status === 204) {
      return undefined as T;
    }

    throw new ApiClientError(
      response.status,
      "INVALID_RESPONSE",
      "서버 응답을 읽을 수 없습니다."
    );
  }

  return body.data;
}

export async function rawApiClient<T>(
  path: string,
  init: RequestInit = {},
  options: ApiClientOptions = {}
): Promise<T> {
  const requestUrl = resolveApiUrl(path);
  const isFormData = init.body instanceof FormData;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await authenticatedFetch(
    path,
    { ...init, headers },
    options
  );
  const body = await parseRawJson<T | RawApiError>(response);

  if (!response.ok) {
    const errorBody = body as RawApiError | null;
    const fallbackMessage =
      response.status >= 500 || response.status === 0
        ? "게이트웨이에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
        : `요청 처리 중 오류가 발생했습니다. (HTTP ${response.status})`;

    console.error("[rawApiClient]", requestUrl, response.status, errorBody);

    throw new ApiClientError(
      response.status,
      errorBody?.code ?? "UNKNOWN_ERROR",
      errorBody?.message ?? fallbackMessage,
      errorBody?.fieldErrors
    );
  }

  if (body === null) {
    if (response.status === 204 || options.allowEmpty) {
      return undefined as T;
    }

    throw new ApiClientError(
      response.status,
      "INVALID_RESPONSE",
      "서버 응답을 읽을 수 없습니다."
    );
  }

  return body as T;
}

export { refreshAccessToken };
