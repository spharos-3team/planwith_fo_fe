"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { Modal } from "@/components/common/Modal";
import { AuthHero, AuthLoginLink } from "@/features/auth/components/AuthHero";
import { useApiError } from "@/hooks/useApiError";
import {
  requestPasswordReset,
  resetPassword,
} from "@/services/auth/account-recovery";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sentModal, setSentModal] = useState(false);
  const [done, setDone] = useState(false);
  const apiError = useApiError(error ? new Error(error) : null);
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const codeValid = /^\d{4,10}$/.test(code.trim());
  const passwordReady =
    newPassword.length >= 8 &&
    newPassword.length <= 64 &&
    newPassword === confirmPassword;
  const canReset = codeSent && codeValid && passwordReady;

  useEffect(() => {
    if (!codeSent) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [codeSent]);

  const sendCode = async () => {
    setSubmitting(true);
    setError("");

    try {
      const sent = await requestPasswordReset(email);
      setEmail(sent.email);
      setCodeSent(true);
      setRemainingSeconds(sent.expiresInSeconds);
      setSentModal(true);
    } catch (sendError) {
      setCodeSent(false);
      setError(
        sendError instanceof Error
          ? sendError.message
          : "인증번호 발송에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    setSubmitting(true);
    setError("");

    try {
      if (!canReset) {
        throw new Error("인증번호와 새 비밀번호를 확인해 주세요.");
      }

      await resetPassword(email, code, newPassword);
      setDone(true);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "비밀번호 재설정에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="flex flex-col items-center bg-surface-default px-6 pb-16">
        <AuthHero
          description="새 비밀번호로 다시 로그인해 주세요"
          title="비밀번호 찾기"
        />
        <p className="mt-10 text-heading-sm text-status-success">
          비밀번호가 변경되었습니다
        </p>
        <Button
          className="mt-8 w-[200px] tracking-[1.5px]"
          onClick={() => router.replace("/login")}
        >
          로그인
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center bg-surface-default px-6 pb-16">
      <AuthHero
        description="가입한 이메일로 인증번호를 받아 새 비밀번호를 설정합니다"
        title="비밀번호 찾기"
      />

      <form
        className="mt-8 flex w-full max-w-[400px] flex-col items-center gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleReset();
        }}
      >
        <div className="grid w-full gap-1.5">
          <p className="text-label-sm text-text-primary">이메일</p>
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <InputField
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setCodeSent(false);
                  setCode("");
                }}
                placeholder="example@planwith.you"
                showLabel={false}
                type="email"
                value={email}
              />
            </div>
            <Button
              className="h-12 w-20 shrink-0 rounded-[10px] px-0 text-label-sm"
              disabled={!emailValid || submitting}
              onClick={() => void sendCode()}
              size="sm"
              type="button"
            >
              {codeSent ? "재발송" : "인증"}
            </Button>
          </div>
          {codeSent ? (
            <p className="text-caption text-text-tertiary">
              메일함의 인증번호를 입력해 주세요.
              {remainingSeconds > 0
                ? ` 남은 시간 ${Math.floor(remainingSeconds / 60)}:${String(
                    remainingSeconds % 60
                  ).padStart(2, "0")}`
                : " 인증번호가 만료되었습니다. 다시 발송해 주세요."}
            </p>
          ) : (
            <p className="text-caption text-text-tertiary">
              로컬 가입 계정만 비밀번호를 재설정할 수 있습니다.
            </p>
          )}
        </div>

        <InputField
          disabled={!codeSent}
          inputMode="numeric"
          label="인증번호"
          maxLength={10}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          placeholder="인증번호 입력"
          value={code}
        />

        <InputField
          autoComplete="new-password"
          disabled={!codeSent}
          label="새 비밀번호"
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="8자 이상, 영문·숫자·특수문자 조합"
          type="password"
          value={newPassword}
        />

        <div className="grid w-full gap-1.5">
          <InputField
            autoComplete="new-password"
            disabled={!codeSent}
            label="새 비밀번호 확인"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="새 비밀번호 재입력"
            type="password"
            value={confirmPassword}
          />
          {confirmPassword && confirmPassword !== newPassword ? (
            <p className="text-caption text-status-error">
              새 비밀번호가 일치하지 않습니다.
            </p>
          ) : null}
        </div>

        {error ? (
          <p
            className="w-full text-center text-caption text-status-error"
            role="alert"
          >
            {apiError}
          </p>
        ) : null}

        <Button
          className="w-[200px] tracking-[1.5px]"
          disabled={!canReset || submitting}
          type="submit"
        >
          비밀번호 변경
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link className="text-body-md text-text-disabled" href="/find-email">
          아이디 찾기
        </Link>
        <AuthLoginLink />
      </div>

      <Modal
        onClose={() => setSentModal(false)}
        open={sentModal}
        primaryAction={{
          label: "확인",
          onClick: () => setSentModal(false),
        }}
        title="인증번호를 발송했습니다"
        variant="success"
      />
    </section>
  );
}
