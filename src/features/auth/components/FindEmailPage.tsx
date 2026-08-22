"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { Modal } from "@/components/common/Modal";
import { AuthHero, AuthLoginLink } from "@/features/auth/components/AuthHero";
import {
  completePhoneVerification,
  hasPhoneVerificationRedirect,
  peekExpectedIdentity,
  resumePhoneVerificationIfRedirected,
} from "@/features/auth/lib/phone-verification";
import { nameSchema, phoneSchema } from "@/features/auth/schemas/auth";
import { useApiError } from "@/hooks/useApiError";
import {
  findEmailByPhone,
  type FindEmailResult,
} from "@/services/auth/account-recovery";

function loginTypeLabel(loginType: string): string {
  if (loginType === "GOOGLE") {
    return "Google";
  }

  if (loginType === "NAVER") {
    return "네이버";
  }

  if (loginType === "KAKAO") {
    return "카카오";
  }

  return "이메일";
}

export function FindEmailPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FindEmailResult | null>(null);
  const [verifiedModal, setVerifiedModal] = useState(false);
  const apiError = useApiError(error ? new Error(error) : null);
  const nameValid = nameSchema.safeParse(name).success;
  const phoneValid = phoneSchema.safeParse(phoneNumber).success;

  useEffect(() => {
    if (!hasPhoneVerificationRedirect()) {
      return;
    }

    let cancelled = false;

    resumePhoneVerificationIfRedirected()
      .then((confirmed) => {
        if (cancelled || !confirmed?.verified) {
          return;
        }

        setName(confirmed.name);
        setPhoneNumber(confirmed.phoneNumber);
        setPhoneVerified(true);
        setVerifiedModal(true);
        setError("");
      })
      .catch((resumeError: unknown) => {
        if (cancelled) {
          return;
        }

        setPhoneVerified(false);
        setError(
          resumeError instanceof Error
            ? resumeError.message
            : "본인인증에 실패했습니다."
        );
        const expected = peekExpectedIdentity();
        if (expected.name) {
          setName(expected.name);
          setPhoneNumber(expected.phone);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const verifyPhone = async () => {
    setSubmitting(true);
    setError("");

    try {
      const confirmed = await completePhoneVerification(
        phoneNumber,
        name,
        "/find-email"
      );

      if (!confirmed.verified) {
        throw new Error("휴대폰 본인인증에 실패했습니다.");
      }

      setName(confirmed.name);
      setPhoneNumber(confirmed.phoneNumber || phoneNumber);
      setPhoneVerified(true);
      setVerifiedModal(true);
    } catch (verifyError) {
      setPhoneVerified(false);
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "본인인증에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFind = async () => {
    setSubmitting(true);
    setError("");

    try {
      if (!phoneVerified) {
        throw new Error("휴대폰 본인인증을 먼저 완료해주세요.");
      }

      const found = await findEmailByPhone(phoneNumber);
      setResult(found);
    } catch (findError) {
      setError(
        findError instanceof Error
          ? findError.message
          : "아이디를 찾지 못했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const isLocal = result.loginType === "LOCAL";

    return (
      <section className="flex flex-col items-center bg-surface-default px-6 pb-16">
        <AuthHero
          description="본인인증이 완료된 계정의 이메일을 안내합니다"
          title="아이디 찾기"
        />

        <div className="mt-10 w-full max-w-[400px] rounded-2xl border border-line-light bg-surface-default p-6 text-center">
          <p className="text-caption text-text-tertiary">가입된 이메일</p>
          <p className="mt-2 text-heading-md text-text-primary">
            {result.email}
          </p>
          <p className="mt-2 text-body-sm text-text-secondary">
            {loginTypeLabel(result.loginType)} 계정으로 가입되어 있습니다
          </p>
        </div>

        <div className="mt-8 flex w-full max-w-[400px] flex-col items-center gap-3">
          {isLocal ? (
            <Link
              className="text-body-md font-bold text-brand-primary underline"
              href="/reset-password"
            >
              비밀번호 찾기
            </Link>
          ) : (
            <p className="text-center text-body-sm text-text-secondary">
              소셜 계정은 해당 서비스로 로그인해 주세요.
            </p>
          )}
          <Button
            className="w-[200px] tracking-[1.5px]"
            onClick={() => router.push("/login")}
          >
            로그인
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center bg-surface-default px-6 pb-16">
      <AuthHero
        description="가입 시 본인인증한 이름과 휴대폰 번호로 이메일을 찾습니다"
        title="아이디 찾기"
      />

      <form
        className="mt-8 flex w-full max-w-[400px] flex-col items-center gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleFind();
        }}
      >
        <InputField
          autoComplete="name"
          disabled={phoneVerified}
          label="이름"
          maxLength={20}
          onChange={(event) => {
            setName(event.target.value);
            setPhoneVerified(false);
          }}
          placeholder="본인인증에 사용한 실명"
          value={name}
        />

        <div className="grid w-full gap-1.5">
          <p className="text-label-sm text-text-primary">휴대폰 번호</p>
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <InputField
                disabled={phoneVerified}
                inputMode="numeric"
                onChange={(event) => {
                  setPhoneNumber(event.target.value.replace(/\D/g, ""));
                  setPhoneVerified(false);
                }}
                placeholder="01012345678"
                showLabel={false}
                value={phoneNumber}
              />
            </div>
            <Button
              className="h-12 w-20 shrink-0 rounded-[10px] px-0 text-label-sm"
              disabled={
                !nameValid || !phoneValid || phoneVerified || submitting
              }
              onClick={() => void verifyPhone()}
              size="sm"
              type="button"
            >
              {phoneVerified ? "완료" : "인증"}
            </Button>
          </div>
          {phoneVerified ? (
            <p className="text-caption text-status-success">
              휴대폰 본인인증이 완료되었습니다
            </p>
          ) : (
            <p className="text-caption text-text-tertiary">
              인증을 누르면 포트원 본인인증 창이 열립니다.
            </p>
          )}
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
          disabled={!phoneVerified || submitting}
          type="submit"
        >
          아이디 찾기
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link
          className="text-body-md text-text-disabled"
          href="/reset-password"
        >
          비밀번호 찾기
        </Link>
        <AuthLoginLink />
      </div>

      <Modal
        onClose={() => setVerifiedModal(false)}
        open={verifiedModal}
        primaryAction={{
          label: "확인",
          onClick: () => setVerifiedModal(false),
        }}
        title="본인인증이 완료되었습니다"
        variant="success"
      />
    </section>
  );
}
