"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { Modal } from "@/components/common/Modal";
import { AuthLoginLink } from "@/features/auth/components/AuthHero";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import {
  completePhoneVerification,
  hasPhoneVerificationRedirect,
  peekExpectedIdentity,
  preloadPortOneSdk,
  resumePhoneVerificationIfRedirected,
} from "@/features/auth/lib/phone-verification";
import { verifiedUntilFromExpiresIn } from "@/features/auth/lib/verified-ttl";
import {
  nameSchema,
  passwordSchema,
  phoneSchema,
} from "@/features/auth/schemas/auth";
import { useApiError } from "@/hooks/useApiError";
import {
  confirmEmailVerification,
  sendEmailVerification,
} from "@/services/auth/member";

interface VerificationStepProps {
  name: string;
  phoneNumber: string;
  email: string;
  verificationCode: string;
  password: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  requireLocalCredentials: boolean;
  error?: string;
  onChange: (patch: {
    name?: string;
    phoneNumber?: string;
    email?: string;
    verificationCode?: string;
    password?: string;
    phoneVerified?: boolean;
    phoneVerifiedUntil?: number | null;
    emailVerified?: boolean;
    emailVerifiedUntil?: number | null;
    identityVerificationId?: string;
  }) => void;
  onNext: () => void;
}

export function VerificationStep({
  name,
  phoneNumber,
  email,
  verificationCode,
  password,
  phoneVerified,
  emailVerified,
  requireLocalCredentials,
  error,
  onChange,
  onNext,
}: VerificationStepProps) {
  const [request, setRequest] = useState({
    submitting: false,
    error: "",
    emailSent: false,
    modal: "" as "" | "phone" | "email",
  });
  const apiError = useApiError(
    request.error || error ? new Error(request.error || error) : null
  );
  const nameValid = nameSchema.safeParse(name).success;
  const phoneValid = phoneSchema.safeParse(phoneNumber).success;

  useEffect(() => {
    preloadPortOneSdk();
  }, []);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const codeValid = /^\d{4,10}$/.test(verificationCode.trim());
  const passwordValid = passwordSchema.safeParse(password).success;
  const canProceed =
    phoneVerified &&
    (!requireLocalCredentials || (emailVerified && passwordValid));

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

        onChange({
          phoneVerified: true,
          phoneVerifiedUntil: verifiedUntilFromExpiresIn(),
          name: confirmed.name,
          phoneNumber: confirmed.phoneNumber,
        });
        setRequest((current) => ({
          ...current,
          error: "",
          modal: "phone",
        }));
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setRequest((current) => ({
          ...current,
          error:
            error instanceof Error ? error.message : "본인인증에 실패했습니다.",
        }));
        const expected = peekExpectedIdentity();
        if (expected.name) {
          onChange({
            name: expected.name,
            phoneNumber: expected.phone || undefined,
            phoneVerified: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // 포트원 리다이렉트 복귀는 마운트 시 1회만 처리한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (
    task: () => Promise<{ modal?: "phone" | "email" } | void>
  ) => {
    setRequest((current) => ({ ...current, submitting: true, error: "" }));

    try {
      const patch = await task();
      setRequest((current) => ({
        ...current,
        submitting: false,
        error: "",
        modal: patch?.modal ?? current.modal,
        emailSent: patch?.modal === "email" ? true : current.emailSent,
      }));
    } catch (error) {
      setRequest((current) => ({
        ...current,
        submitting: false,
        error: error instanceof Error ? error.message : "요청에 실패했습니다.",
        modal: "",
      }));
    }
  };

  const verifyPhone = () =>
    run(async () => {
      if (!nameValid) {
        throw new Error("본인인증에 사용할 실명을 입력해주세요.");
      }
      if (!phoneValid) {
        throw new Error("휴대폰 번호는 01012345678 형식으로 입력해주세요.");
      }

      const confirmed = await completePhoneVerification(phoneNumber, name);
      if (!confirmed.verified) {
        throw new Error("휴대폰 본인인증에 실패했습니다.");
      }

      onChange({
        phoneVerified: true,
        phoneVerifiedUntil: verifiedUntilFromExpiresIn(),
        name,
        phoneNumber: confirmed.phoneNumber || phoneNumber,
      });
      return { modal: "phone" as const };
    });

  const sendEmailCode = () =>
    run(async () => {
      const sent = await sendEmailVerification(email);
      onChange({
        email: sent.email,
        emailVerified: false,
        emailVerifiedUntil: null,
      });
      return { modal: "email" as const };
    });

  const verifyEmailCode = () =>
    run(async () => {
      const confirmed = await confirmEmailVerification(email, verificationCode);
      if (!confirmed.verified) {
        throw new Error("이메일 인증에 실패했습니다.");
      }
      onChange({
        email: confirmed.email,
        emailVerified: true,
        emailVerifiedUntil: verifiedUntilFromExpiresIn(
          confirmed.verifiedExpiresInSeconds
        ),
      });
    });

  const handleNext = () =>
    run(async () => {
      if (requireLocalCredentials && !emailVerified) {
        const confirmed = await confirmEmailVerification(
          email,
          verificationCode
        );
        if (!confirmed.verified) {
          throw new Error("이메일 인증에 실패했습니다.");
        }
        onChange({
          email: confirmed.email,
          emailVerified: true,
          emailVerifiedUntil: verifiedUntilFromExpiresIn(
            confirmed.verifiedExpiresInSeconds
          ),
        });
      }
      onNext();
    });

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center">
      <SignupStepper currentStep={2} />
      <h1 className="mt-8 text-[29px] font-extrabold text-gray-900">
        인증 절차
      </h1>
      <p className="mt-2 text-body-sm text-text-tertiary">
        {requireLocalCredentials
          ? "안전한 서비스 이용을 위해 본인 인증을 진행해 주세요"
          : "소셜 회원가입도 실명과 휴대폰 본인인증이 필요합니다"}
      </p>

      <div className="mt-10 w-full max-w-[440px]">
        <div className="grid gap-1.5">
          <p className="text-label-sm text-text-tertiary">이름</p>
          <InputField
            autoComplete="name"
            disabled={phoneVerified}
            maxLength={20}
            onChange={(event) =>
              onChange({
                name: event.target.value,
                phoneVerified: false,
              })
            }
            placeholder="본인인증에 사용할 실명을 입력해주세요"
            showLabel={false}
            value={name}
          />
        </div>

        <div className="mt-5 grid gap-1.5">
          <p className="text-label-sm text-text-tertiary">휴대폰 번호</p>
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <InputField
                disabled={phoneVerified}
                inputMode="numeric"
                onChange={(event) =>
                  onChange({
                    phoneNumber: event.target.value.replace(/\D/g, ""),
                    phoneVerified: false,
                  })
                }
                placeholder="사용하시는 휴대전화 번호를 적어주세요"
                showLabel={false}
                value={phoneNumber}
              />
            </div>
            <Button
              className="h-12 w-20 shrink-0 rounded-[10px] px-0 text-label-sm"
              disabled={
                !nameValid || !phoneValid || phoneVerified || request.submitting
              }
              onClick={verifyPhone}
              size="sm"
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
              인증을 누르면 포트원 본인인증 창이 열립니다. 입력한 이름이
              본인인증 실명과 같아야 합니다.
            </p>
          )}
        </div>

        {requireLocalCredentials ? (
          <>
            <div className="mt-5 grid gap-1.5">
              <p className="text-label-sm text-text-tertiary">이메일</p>
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <InputField
                    disabled={emailVerified}
                    onChange={(event) =>
                      onChange({
                        email: event.target.value,
                        emailVerified: false,
                      })
                    }
                    placeholder="이메일을 입력해주세요"
                    showLabel={false}
                    type="email"
                    value={email}
                  />
                </div>
                <Button
                  className="h-12 w-20 shrink-0 rounded-[10px] px-0 text-label-sm"
                  disabled={
                    !emailValid ||
                    !phoneVerified ||
                    emailVerified ||
                    request.submitting
                  }
                  onClick={sendEmailCode}
                  size="sm"
                >
                  {emailVerified ? "완료" : "인증"}
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-1.5">
              <p className="text-label-sm text-text-primary">인증번호</p>
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <InputField
                    disabled={emailVerified}
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(event) =>
                      onChange({
                        verificationCode: event.target.value.replace(/\D/g, ""),
                        emailVerified: false,
                      })
                    }
                    placeholder="인증번호를 입력해주세요"
                    showLabel={false}
                    value={verificationCode}
                  />
                </div>
                <Button
                  className="h-12 w-20 shrink-0 rounded-[10px] px-0 text-label-sm"
                  disabled={
                    !request.emailSent ||
                    !codeValid ||
                    emailVerified ||
                    request.submitting
                  }
                  onClick={verifyEmailCode}
                  size="sm"
                >
                  {emailVerified ? "완료" : "확인"}
                </Button>
              </div>
              {emailVerified ? (
                <p className="text-caption text-status-success">
                  이메일 인증이 완료되었습니다
                </p>
              ) : request.emailSent ? (
                <p className="text-caption text-text-tertiary">
                  메일함의 6자리 인증번호를 입력한 뒤 확인을 눌러주세요. 스텁
                  환경이면 서버 로그에서 코드를 확인합니다.
                </p>
              ) : null}
            </div>
            <div className="mt-5">
              <InputField
                error={
                  password && !passwordValid
                    ? "소/대문자, 특수 문자 포함 8~20자로 입력하세요"
                    : undefined
                }
                label="비밀번호"
                onChange={(event) => onChange({ password: event.target.value })}
                placeholder="소/대문자,특수 문자 포함8~20자로 입력하세요"
                type="password"
                value={password}
              />
            </div>
          </>
        ) : null}
      </div>

      {request.error ? (
        <p className="mt-4 text-caption text-status-error" role="alert">
          {apiError}
        </p>
      ) : null}

      <Button
        className="mt-6 w-[200px] tracking-[1.5px]"
        disabled={!canProceed || request.submitting}
        onClick={handleNext}
      >
        다음
      </Button>
      <div className="mt-4">
        <AuthLoginLink />
      </div>

      <Modal
        onClose={() => setRequest((current) => ({ ...current, modal: "" }))}
        open={request.modal === "phone"}
        primaryAction={{
          label: "확인",
          onClick: () => setRequest((current) => ({ ...current, modal: "" })),
        }}
        title="본인인증이 완료되었습니다"
        variant="success"
      />
      <Modal
        onClose={() => setRequest((current) => ({ ...current, modal: "" }))}
        open={request.modal === "email"}
        primaryAction={{
          label: "확인",
          onClick: () => setRequest((current) => ({ ...current, modal: "" })),
        }}
        title="인증번호를 발송했습니다"
        variant="success"
      />
    </div>
  );
}
