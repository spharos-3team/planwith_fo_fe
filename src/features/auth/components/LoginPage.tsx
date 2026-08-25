"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { AuthCheckbox } from "@/features/auth/components/AuthCheckbox";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";
import { useAuth } from "@/features/auth/context/AuthProvider";
import {
  completeSocialLogin,
  consumeOAuthPopupMessage,
  isOAuthPopupMessage,
  OAUTH_BROADCAST_CHANNEL,
  OAUTH_STORAGE_KEY,
  type OAuthPopupMessage,
  openOAuthPopup,
} from "@/features/auth/lib/social-oauth";
import {
  consumeOAuthState,
  getSavedEmail,
  getSocialAuthUrl,
  setSavedEmail,
} from "@/features/auth/lib/storage";
import {
  type LoginFormValues,
  loginSchema,
} from "@/features/auth/schemas/auth";
import { useApiError } from "@/hooks/useApiError";
import type { SocialProvider } from "@/types/api";

export function LoginPage() {
  const router = useRouter();
  const { login, applySession } = useAuth();
  const [request, setRequest] = useState({ submitting: false, error: "" });
  const [rememberEmail, setRememberEmail] = useState(false);
  const waitingProvider = useRef<SocialProvider | null>(null);
  const onPopupMessageRef = useRef<(message: OAuthPopupMessage) => void>(
    () => undefined
  );
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberEmail: false,
    },
  });

  useEffect(() => {
    const remembered = getSavedEmail();

    if (!remembered) {
      return;
    }

    const timer = window.setTimeout(() => {
      form.setValue("email", remembered);
      form.setValue("rememberEmail", true);
      setRememberEmail(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    const onPopupMessage = (message: OAuthPopupMessage) => {
      try {
        window.localStorage.removeItem(OAUTH_STORAGE_KEY);
      } catch {
        // Private mode may block localStorage.
      }

      const waiting = waitingProvider.current;
      if (!waiting || waiting !== message.provider) {
        return;
      }
      waitingProvider.current = null;

      if (message.error || !message.code) {
        setRequest({
          submitting: false,
          error: message.error || "소셜 로그인이 취소되었습니다.",
        });
        return;
      }

      const expectedState = consumeOAuthState();
      if (!message.state || message.state !== expectedState) {
        setRequest({
          submitting: false,
          error: "소셜 로그인 검증에 실패했습니다.",
        });
        return;
      }

      void completeSocialLogin(
        message.provider,
        message.code,
        applySession,
        message.state
      )
        .then((next) => {
          router.replace(next === "signup" ? "/signup" : "/");
        })
        .catch((loginError: unknown) => {
          setRequest({
            submitting: false,
            error:
              loginError instanceof Error
                ? loginError.message
                : "소셜 로그인에 실패했습니다.",
          });
        });
    };

    const onWindowMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (!isOAuthPopupMessage(event.data)) {
        return;
      }
      onPopupMessage(event.data);
    };

    onPopupMessageRef.current = onPopupMessage;

    window.addEventListener("message", onWindowMessage);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== OAUTH_STORAGE_KEY || !event.newValue) {
        return;
      }
      const pending = consumeOAuthPopupMessage();
      if (pending) {
        onPopupMessage(pending);
      }
    };
    window.addEventListener("storage", onStorage);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(OAUTH_BROADCAST_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        if (isOAuthPopupMessage(event.data)) {
          onPopupMessage(event.data);
        }
      };
    } catch {
      // BroadcastChannel is unavailable in some embedded browsers.
    }

    return () => {
      window.removeEventListener("message", onWindowMessage);
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, [applySession, router]);

  const apiError = useApiError(request.error ? new Error(request.error) : null);

  const onSubmit = form.handleSubmit(async (values) => {
    setRequest({ submitting: true, error: "" });

    try {
      await login(values.email, values.password);
      setSavedEmail(rememberEmail ? values.email : null);
      router.replace("/");
    } catch (error) {
      setRequest({
        submitting: false,
        error:
          error instanceof Error ? error.message : "로그인에 실패했습니다.",
      });
    }
  });

  const handleSocial = (provider: SocialProvider) => {
    const url = getSocialAuthUrl(provider);

    if (!url) {
      setRequest({
        submitting: false,
        error: "소셜 로그인 설정이 되어 있지 않습니다.",
      });
      return;
    }

    const popup = openOAuthPopup(url);
    if (!popup) {
      window.location.href = url;
      return;
    }

    waitingProvider.current = provider;
    try {
      window.localStorage.removeItem(OAUTH_STORAGE_KEY);
    } catch {
      // Private mode may block localStorage.
    }
    setRequest({ submitting: true, error: "" });

    const timer = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }
      window.clearInterval(timer);
      window.setTimeout(() => {
        const pending = consumeOAuthPopupMessage();
        if (pending) {
          onPopupMessageRef.current(pending);
          return;
        }
        if (waitingProvider.current !== provider) {
          return;
        }
        waitingProvider.current = null;
        setRequest((current) =>
          current.submitting
            ? { submitting: false, error: "소셜 로그인이 취소되었습니다." }
            : current
        );
      }, 800);
    }, 400);
  };

  return (
    <section className="flex flex-col items-center bg-surface-default px-6">
      <div className="flex w-full flex-col items-center pb-10">
        <AuthHero
          description="AI 일정 생성 · 여행 기록 · 여행 스토리 · 함께하는 모임"
          eyebrow="BOARDING PASS"
          title="login"
        />

        <form
          className="mt-8 flex w-full max-w-[400px] flex-col items-center gap-6"
          onSubmit={onSubmit}
        >
          <InputField
            autoComplete="email"
            error={form.formState.errors.email?.message}
            label="이메일"
            placeholder="example@planwith.you"
            type="email"
            {...form.register("email")}
          />
          <div className="grid w-full gap-2">
            <InputField
              autoComplete="current-password"
              error={form.formState.errors.password?.message}
              label="비밀번호"
              placeholder="********"
              type="password"
              {...form.register("password")}
            />
            <AuthCheckbox
              checked={rememberEmail}
              label="아이디 저장"
              onChange={(checked) => {
                setRememberEmail(checked);
                form.setValue("rememberEmail", checked);
              }}
            />
          </div>

          {request.error ? (
            <p
              className="w-full text-center text-caption text-status-error"
              role="alert"
            >
              {apiError}
            </p>
          ) : null}

          <Button
            className="w-[200px] tracking-[1.5px]"
            disabled={request.submitting}
            type="submit"
          >
            탑승 하기
          </Button>
        </form>

        <div className="mt-8 flex w-full max-w-[464px] items-center gap-4 py-8">
          <span className="h-px flex-1 bg-line-light" />
          <p className="text-body-sm text-text-tertiary/50">또는 간편 로그인</p>
          <span className="h-px flex-1 bg-line-light" />
        </div>

        <SocialLoginButtons
          disabled={request.submitting}
          onSelect={handleSocial}
        />

        <div className="mt-4 flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-2 text-body-md text-text-disabled">
            <Link className="p-2" href="/find-email">
              아이디 찾기
            </Link>
            <Link className="p-2" href="/reset-password">
              비밀번호 찾기
            </Link>
          </div>
          <p className="text-body-sm text-text-disabled">
            아직 회원이 아니신가요?{" "}
            <Link className="text-body-md font-bold underline" href="/signup">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
