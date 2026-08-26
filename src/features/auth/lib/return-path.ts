const RETURN_PATH_KEY = "planwith.returnPath";

export function isSafeReturnPath(path: string): boolean {
  return (
    path.startsWith("/") && !path.startsWith("//") && !path.includes("://")
  );
}

export function setReturnPath(path: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!path || !isSafeReturnPath(path)) {
    window.sessionStorage.removeItem(RETURN_PATH_KEY);
    return;
  }

  window.sessionStorage.setItem(RETURN_PATH_KEY, path);
}

export function consumeReturnPath(fallback = "/"): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.sessionStorage.getItem(RETURN_PATH_KEY);
  window.sessionStorage.removeItem(RETURN_PATH_KEY);

  if (stored && isSafeReturnPath(stored)) {
    return stored;
  }

  return fallback;
}

export function captureReturnPathFromLocation(): void {
  if (typeof window === "undefined") {
    return;
  }

  const next = new URLSearchParams(window.location.search).get("next");
  if (next && isSafeReturnPath(next)) {
    setReturnPath(next);
  }
}

export function redirectAfterAuth(
  replace: (href: string) => void,
  destination: "home" | "signup"
): void {
  if (destination === "signup") {
    replace("/signup");
    return;
  }

  replace(consumeReturnPath("/"));
}
