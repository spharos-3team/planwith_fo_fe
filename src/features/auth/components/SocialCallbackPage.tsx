"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { redirectAfterAuth } from "@/features/auth/lib/return-path";
import {
  completeSocialLogin,
  isOAuthPopupMessage,
  isOAuthPopupWindow,
  OAUTH_POPUP_MESSAGE_TYPE,
  type OAuthPopupMessage,
  publishOAuthPopupMessage,
} from "@/features/auth/lib/social-oauth";
import { consumeOAuthState } from "@/features/auth/lib/storage";
import { useApiError } from "@/hooks/useApiError";
import type { SocialProvider } from "@/types/api";

const providers: SocialProvider[] = ["google", "naver", "kakao"];
const publishedPopupCallbacks = new Set<string>();

function isSocialProvider(value: string): value is SocialProvider {
  return providers.includes(value as SocialProvider);
}

export function SocialCallbackPage({ provider }: { provider: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySession } = useAuth();
  const [error, setError] = useState("");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError =
    searchParams.get("error_description") ||
    searchParams.get("error") ||
    searchParams.get("message");
  const providerValid = isSocialProvider(provider);
  const visibleError = error || (!code ? oauthError : "");
  const apiError = useApiError(visibleError ? new Error(visibleError) : null);

  useEffect(() => {
    if (!providerValid) {
      return;
    }

    // Popup must only hand the code to the opener. Exchanging it here as well
    // consumes Google's one-time code and the login page then shows SOCIAL_AUTH_FAILED.
    if (isOAuthPopupWindow() || (window.opener && !window.opener.closed)) {
      const publishKey = `${provider}:${code ?? ""}:${state ?? ""}:${oauthError ?? ""}`;
      if (publishedPopupCallbacks.has(publishKey)) {
        return;
      }
      publishedPopupCallbacks.add(publishKey);

      const message: OAuthPopupMessage = {
        type: OAUTH_POPUP_MESSAGE_TYPE,
        provider,
        code,
        state,
        error: oauthError,
      };
      if (isOAuthPopupMessage(message)) {
        publishOAuthPopupMessage(message);
      }
      return;
    }

    if (!code) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      const expectedState = consumeOAuthState();

      if (!state || state !== expectedState) {
        if (!cancelled) {
          setError("소셜 로그인 검증에 실패했습니다.");
        }
        return;
      }

      try {
        const next = await completeSocialLogin(
          provider,
          code,
          applySession,
          state
        );
        if (cancelled) {
          return;
        }
        redirectAfterAuth(router.replace, next);
      } catch (loginError: unknown) {
        if (!cancelled) {
          setError(
            loginError instanceof Error
              ? loginError.message
              : "소셜 로그인에 실패했습니다."
          );
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [applySession, code, oauthError, provider, providerValid, router, state]);

  if (!providerValid) {
    return (
      <div className="mx-auto max-w-lg px-6 py-section-y">
        <StatusMessage role="alert">
          지원하지 않는 소셜 로그인입니다.
        </StatusMessage>
      </div>
    );
  }

  if (!code || visibleError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-section-y">
        <StatusMessage role="alert">
          {apiError || "인가 코드가 없습니다."}
        </StatusMessage>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-section-y">
      <StatusMessage>소셜 로그인 처리 중입니다.</StatusMessage>
    </div>
  );
}
