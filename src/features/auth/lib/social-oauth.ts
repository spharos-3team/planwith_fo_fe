import {
  getOAuthRedirectUri,
  setPendingSocialSignup,
  setSignupDraft,
} from "@/features/auth/lib/storage";
import { socialLogin } from "@/services/auth/social";
import type { SocialProvider, TokenResponse } from "@/types/api";

export const OAUTH_POPUP_MESSAGE_TYPE = "planwith:oauth-callback";
export const OAUTH_POPUP_WINDOW_NAME = "planwith-oauth";
export const OAUTH_BROADCAST_CHANNEL = "planwith-oauth";
export const OAUTH_STORAGE_KEY = "planwith.oauthCallback";

export interface OAuthPopupMessage {
  type: typeof OAUTH_POPUP_MESSAGE_TYPE;
  provider: SocialProvider;
  code: string | null;
  state: string | null;
  error: string | null;
}

export function isOAuthPopupMessage(
  value: unknown
): value is OAuthPopupMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as Partial<OAuthPopupMessage>;
  return message.type === OAUTH_POPUP_MESSAGE_TYPE;
}

export function openOAuthPopup(url: string): Window | null {
  const width = 480;
  const height = 720;
  const left = Math.max(
    0,
    Math.round(window.screenX + (window.outerWidth - width) / 2)
  );
  const top = Math.max(
    0,
    Math.round(window.screenY + (window.outerHeight - height) / 2)
  );
  return window.open(
    url,
    OAUTH_POPUP_WINDOW_NAME,
    `popup=yes,width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );
}

export function isOAuthPopupWindow(): boolean {
  return window.name === OAUTH_POPUP_WINDOW_NAME;
}

export function consumeOAuthPopupMessage(): OAuthPopupMessage | null {
  try {
    const raw = window.localStorage.getItem(OAUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    window.localStorage.removeItem(OAUTH_STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw);
    return isOAuthPopupMessage(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function publishOAuthPopupMessage(message: OAuthPopupMessage): void {
  try {
    window.localStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Private mode may block localStorage.
  }

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, window.location.origin);
  }

  try {
    const channel = new BroadcastChannel(OAUTH_BROADCAST_CHANNEL);
    channel.postMessage(message);
  } catch {
    // BroadcastChannel is unavailable in some embedded browsers.
  }

  window.close();
}

export async function completeSocialLogin(
  provider: SocialProvider,
  code: string,
  applySession: (tokens: TokenResponse) => Promise<void>,
  oauthState?: string | null
): Promise<"home" | "signup"> {
  const redirectUri = getOAuthRedirectUri(provider);
  const result = await socialLogin(provider, code, redirectUri, oauthState);

  if (result.isNewMember || !result.accessToken) {
    setSignupDraft(null);
    setPendingSocialSignup({
      provider,
      authorizationCode: code,
      redirectUri,
      oauthState: oauthState ?? null,
    });
    return "signup";
  }

  await applySession({
    tokenType: result.tokenType ?? "Bearer",
    accessToken: result.accessToken,
    accessTokenExpiresIn: result.accessTokenExpiresIn ?? 0,
    user: result.user ?? { userId: "", roles: [], scopes: [] },
  });
  return "home";
}
