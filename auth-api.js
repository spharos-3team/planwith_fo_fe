const ACCESS_KEY = "planwith_access_token";

function readStoredAccessToken() {
  try {
    const fromLocal = localStorage.getItem(ACCESS_KEY);
    if (fromLocal) return fromLocal;
    const fromSession = sessionStorage.getItem(ACCESS_KEY);
    if (fromSession) {
      localStorage.setItem(ACCESS_KEY, fromSession);
      sessionStorage.removeItem(ACCESS_KEY);
      return fromSession;
    }
  } catch (_) { /* ignore */ }
  return null;
}

export function getAccessToken() {
  return readStoredAccessToken();
}

export function setAccessToken(token) {
  try {
    if (token) {
      localStorage.setItem(ACCESS_KEY, token);
      sessionStorage.removeItem(ACCESS_KEY);
    } else {
      localStorage.removeItem(ACCESS_KEY);
      sessionStorage.removeItem(ACCESS_KEY);
    }
  } catch (_) { /* ignore */ }
}

/** 로그인 전 public API — 만료/재기동된 JWT를 붙이면 Gateway가 401을 낸다 */
const PUBLIC_AUTH_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/signup",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/api/v1/auth/social-login",
  "/api/v1/auth/social-signup",
  "/api/v1/auth/email/",
  "/api/v1/auth/check-email",
  "/api/v1/auth/check-nickname",
  "/api/v1/auth/password/reset",
  "/api/v1/auth/find-email",
  "/api/v1/auth/profile-image",
  "/api/v1/terms",
];

function isPublicAuthPath(path) {
  const p = path.split("?")[0];
  return PUBLIC_AUTH_PATHS.some((prefix) => p === prefix || p.startsWith(prefix));
}

let refreshInFlight = null;

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const res = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.success === false) {
      setAccessToken(null);
      const err = new Error(json?.error?.message || `요청 실패 (${res.status})`);
      err.status = res.status;
      err.code = json?.error?.code;
      throw err;
    }
    const accessToken = json?.data?.accessToken;
    if (!accessToken) {
      setAccessToken(null);
      throw new Error("세션을 갱신하지 못했습니다.");
    }
    setAccessToken(accessToken);
    return accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** refresh 쿠키가 있으면 access token을 복구한다 (로그아웃 전까지 유지) */
export async function ensureSession() {
  if (getAccessToken()) return true;
  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token && !isPublicAuthPath(path) && options.auth !== false) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json().catch(() => null);
  const failed = !res.ok || (json && json.success === false);

  if (
    failed
    && res.status === 401
    && !isPublicAuthPath(path)
    && options.auth !== false
    && !options._retried
  ) {
    try {
      await refreshAccessToken();
      return api(path, { ...options, _retried: true });
    } catch {
      /* fall through with original error */
    }
  }

  if (failed) {
    const err = new Error(json?.error?.message || `요청 실패 (${res.status})`);
    err.code = json?.error?.code;
    err.fieldErrors = json?.error?.fieldErrors;
    err.status = res.status;
    throw err;
  }
  return json?.data;
}
