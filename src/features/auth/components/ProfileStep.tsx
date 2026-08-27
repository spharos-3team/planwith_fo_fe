"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { StatusMessage } from "@/components/common/StatusMessage";
import { AuthLoginLink } from "@/features/auth/components/AuthHero";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import {
  formatVerifiedRemaining,
  remainingVerifiedSeconds,
} from "@/features/auth/lib/verified-ttl";
import { nicknameSchema } from "@/features/auth/schemas/auth";
import { toProfileImageFile } from "@/features/mypage/lib/profile-image";
import { useApiError } from "@/hooks/useApiError";
import { checkNicknameAvailability } from "@/services/auth/member";

interface ProfileStepProps {
  email: string;
  nickname: string;
  profileIntro: string;
  nicknameAvailable: boolean;
  profilePreview: string | null;
  submitting: boolean;
  error: string;
  submitLabel: string;
  emailVerifiedUntil: number | null;
  phoneVerifiedUntil: number | null;
  onGoToVerification: () => void;
  onNicknameChange: (value: string) => void;
  onIntroChange: (value: string) => void;
  onNicknameChecked: (available: boolean) => void;
  onImageChange: (file: File | null, preview: string | null) => void;
  onSubmit: () => void;
}

export function ProfileStep({
  email,
  nickname,
  profileIntro,
  nicknameAvailable,
  profilePreview,
  submitting,
  error,
  submitLabel,
  emailVerifiedUntil,
  phoneVerifiedUntil,
  onGoToVerification,
  onNicknameChange,
  onIntroChange,
  onNicknameChecked,
  onImageChange,
  onSubmit,
}: ProfileStepProps) {
  const [now, setNow] = useState(() => Date.now());
  const emailRemaining = remainingVerifiedSeconds(emailVerifiedUntil, now);
  const phoneRemaining = remainingVerifiedSeconds(phoneVerifiedUntil, now);
  const emailExpired = Boolean(emailVerifiedUntil) && emailRemaining === 0;
  const phoneExpired = Boolean(phoneVerifiedUntil) && phoneRemaining === 0;
  const verificationExpired = emailExpired || phoneExpired;

  useEffect(() => {
    if (!emailVerifiedUntil && !phoneVerifiedUntil) {
      return;
    }
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [emailVerifiedUntil, phoneVerifiedUntil]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const apiError = useApiError(error ? new Error(error) : null);
  const nicknameValid = nicknameSchema.safeParse(nickname).success;

  const checkNickname = async () => {
    setChecking(true);
    setNicknameMessage("");
    onNicknameChecked(false);

    try {
      const result = await checkNicknameAvailability(nickname);
      onNicknameChecked(result.available);
      setNicknameMessage(
        result.available ? "사용 가능한 닉네임입니다" : "중복된 닉네임입니다"
      );
    } catch (checkError) {
      setNicknameMessage(
        checkError instanceof Error
          ? checkError.message
          : "닉네임 확인에 실패했습니다."
      );
    } finally {
      setChecking(false);
    }
  };

  const handleImage = (file: File | null) => {
    if (!file) {
      setImageError("");
      onImageChange(null, null);
      return;
    }

    setImageError("");
    void toProfileImageFile(file)
      .then((normalized) => {
        const preview = URL.createObjectURL(normalized);
        onImageChange(normalized, preview);
      })
      .catch((imageErr: unknown) => {
        setImageError(
          imageErr instanceof Error
            ? imageErr.message
            : "프로필 이미지를 처리할 수 없습니다."
        );
      });
  };

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center">
      <SignupStepper currentStep={3} />
      <h1 className="mt-8 text-[29px] font-extrabold text-gray-900">
        비행 준비
      </h1>
      <p className="mt-2 text-body-sm text-text-tertiary">
        함께 떠날 프로필 정보를 입력하고 출발 준비를 마쳐주세요
      </p>

      <div className="relative mt-10">
        <div className="size-20 overflow-hidden rounded-circle bg-line-light">
          {profilePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="프로필 미리보기"
              className="size-full object-cover"
              src={profilePreview}
            />
          ) : null}
        </div>
        <button
          aria-label="프로필 이미지 선택"
          className="absolute -bottom-1 -right-1 grid size-[30px] place-items-center rounded-circle bg-header-nav-active text-text-inverse"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Camera aria-hidden="true" className="size-3.5" />
        </button>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => handleImage(event.target.files?.[0] ?? null)}
          ref={fileInputRef}
          type="file"
        />
      </div>

      <div className="mt-6 w-full max-w-[440px]">
        {email ? <InputField disabled label="이메일" value={email} /> : null}

        <div className={`${email ? "mt-5" : ""} grid gap-1.5`}>
          <p className="text-label-sm text-text-primary">
            닉네임
            <span className="text-[10px] font-semibold">(10자 이내)</span>
          </p>
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <InputField
                maxLength={10}
                onChange={(event) => {
                  onNicknameChange(event.target.value);
                  onNicknameChecked(false);
                  setNicknameMessage("");
                }}
                placeholder="닉네임을 입력해주세요"
                showLabel={false}
                value={nickname}
              />
            </div>
            <Button
              className="h-12 w-20 shrink-0 rounded-[10px] px-0 text-label-sm"
              disabled={!nicknameValid || checking}
              onClick={checkNickname}
              size="sm"
            >
              중복 확인
            </Button>
          </div>
          {nicknameMessage ? (
            <p
              className={`text-caption ${
                nicknameAvailable ? "text-status-success" : "text-status-error"
              }`}
              role="alert"
            >
              {nicknameMessage}
            </p>
          ) : null}
        </div>

        <InputField
          className="mt-5"
          label="프로필 소개글(20자 이내)"
          maxLength={20}
          onChange={(event) => onIntroChange(event.target.value)}
          placeholder="나를 알리는 한줄 소개를 해주세요"
          value={profileIntro}
        />
      </div>

      {emailVerifiedUntil && !emailExpired ? (
        <p className="mt-4 text-caption text-text-tertiary" role="timer">
          이메일 인증 유효시간 {formatVerifiedRemaining(emailRemaining)}
        </p>
      ) : null}
      {phoneVerifiedUntil && !phoneExpired ? (
        <p className="mt-1 text-caption text-text-tertiary" role="timer">
          본인인증 유효시간 {formatVerifiedRemaining(phoneRemaining)}
        </p>
      ) : null}

      {verificationExpired ? (
        <div className="mt-4 w-full max-w-[440px]">
          <StatusMessage role="alert">
            {emailExpired
              ? "이메일 인증 유효시간이 지났습니다. 다시 인증해 주세요."
              : "본인인증 유효시간이 지났습니다. 다시 인증해 주세요."}
          </StatusMessage>
          <Button
            buttonStyle="secondary"
            className="mt-3 w-full"
            onClick={onGoToVerification}
            type="button"
          >
            인증 단계로
          </Button>
        </div>
      ) : null}

      {imageError || error ? (
        <p className="mt-4 text-caption text-status-error" role="alert">
          {imageError || apiError}
        </p>
      ) : null}

      <Button
        className="mt-6 w-[200px] tracking-[1.5px]"
        disabled={!nicknameAvailable || submitting || verificationExpired}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
      <div className="mt-4">
        <AuthLoginLink />
      </div>
    </div>
  );
}
