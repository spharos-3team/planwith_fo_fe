import type { SocialProvider } from "@/types/api";

const SAVED_EMAIL_KEY = "planwith.savedEmail";
const SOCIAL_SIGNUP_KEY = "planwith.socialSignup";
const SIGNUP_DRAFT_KEY = "planwith.signupDraft";
const OAUTH_STATE_KEY = "planwith.oauthState";

export interface PendingSocialSignup {
  provider: SocialProvider;
  authorizationCode: string;
  redirectUri: string;
  oauthState?: string | null;
}

export function getSavedEmail(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SAVED_EMAIL_KEY) ?? "";
}

export function setSavedEmail(email: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (email) {
    window.localStorage.setItem(SAVED_EMAIL_KEY, email);
    return;
  }

  window.localStorage.removeItem(SAVED_EMAIL_KEY);
}

export function getPendingSocialSignup(): PendingSocialSignup | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(SOCIAL_SIGNUP_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingSocialSignup;
  } catch {
    return null;
  }
}

export function setPendingSocialSignup(
  value: PendingSocialSignup | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(SOCIAL_SIGNUP_KEY);
    return;
  }

  window.sessionStorage.setItem(SOCIAL_SIGNUP_KEY, JSON.stringify(value));
}

export interface SignupDraft {
  step: 1 | 2 | 3;
  over14: boolean;
  agreements: Record<string, boolean>;
  marketingEmail: boolean;
  marketingSms: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  name: string;
  email: string;
  emailVerified: boolean;
  verificationCode: string;
  password: string;
  nickname: string;
  nicknameAvailable: boolean;
  profileIntro: string;
}

export function getSignupDraft(): SignupDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(SIGNUP_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SignupDraft;
  } catch {
    return null;
  }
}

export function setSignupDraft(value: SignupDraft | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
    return;
  }

  window.sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(value));
}

export function createOAuthState(): string {
  const state = crypto.randomUUID();
  window.sessionStorage.setItem(OAUTH_STATE_KEY, state);
  return state;
}

export function consumeOAuthState(): string | null {
  const state = window.sessionStorage.getItem(OAUTH_STATE_KEY);
  window.sessionStorage.removeItem(OAUTH_STATE_KEY);
  return state;
}

export function getOAuthRedirectUri(provider: SocialProvider): string {
  return `${window.location.origin}/auth/callback/${provider}`;
}

export function getSocialAuthUrl(provider: SocialProvider): string | null {
  const redirectUri = getOAuthRedirectUri(provider);
  const state = createOAuthState();

  if (provider === "google") {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return null;
    }

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  }

  if (provider === "naver") {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    if (!clientId) {
      return null;
    }

    const url = new URL("https://nid.naver.com/oauth2.0/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    return url.toString();
  }

  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  if (!clientId) {
    return null;
  }

  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}
