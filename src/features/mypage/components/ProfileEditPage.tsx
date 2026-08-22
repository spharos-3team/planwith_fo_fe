"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Dialog } from "@/components/common/Dialog";
import { InputField } from "@/components/common/InputField";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { nicknameSchema } from "@/features/auth/schemas/auth";
import type { MemberMe } from "@/features/auth/types";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { toProfileImageFile } from "@/features/mypage/lib/profile-image";
import { useApiError } from "@/hooks/useApiError";
import {
  checkNicknameAvailability,
  getMyMember,
  uploadProfileImage,
} from "@/services/auth/member";
import {
  changePassword,
  updateMyPage,
  withdrawMember,
} from "@/services/member/mypage";

const fieldClass =
  "h-11 rounded-[10px] border-[1.5px] border-[#E6EBF2] bg-white/55 px-4 text-[14px] leading-[18px] text-[#1A1A1A] placeholder:text-[#848484] focus:border-[#002BFF]";

function passwordStrength(password: string): "weak" | "medium" | "strong" {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [password.length >= 8, hasLetter, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  if (score >= 4) {
    return "strong";
  }

  return score >= 2 ? "medium" : "weak";
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) {
    return null;
  }

  const level = passwordStrength(password);
  const fillClass =
    level === "strong"
      ? "w-full bg-[#5FA37F]"
      : level === "medium"
        ? "w-2/3 bg-[#FFA600]"
        : "w-1/3 bg-[#FF4B4B]";
  const labelClass =
    level === "strong"
      ? "text-[#5FA37F]"
      : level === "medium"
        ? "text-[#FFA600]"
        : "text-[#FF4B4B]";
  const label =
    level === "strong" ? "강함" : level === "medium" ? "보통" : "약함";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-[#E6EBF2]">
        <div className={`h-full rounded-[3px] ${fillClass}`} />
      </div>
      <span
        className={`text-[11px] font-semibold leading-[14px] ${labelClass}`}
      >
        {label}
      </span>
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="text-[14px] font-semibold leading-[18px] tracking-[0.3px] text-[#1A1A1A]">
      {children}
    </p>
  );
}

function SaveButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex h-11 w-[119px] items-center justify-center rounded-[10px] border-[1.5px] border-[#002BFF] bg-[#002BFF] text-[14px] font-semibold leading-[18px] text-white disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      변경사항 저장
    </button>
  );
}

export function ProfileEditPage() {
  const router = useRouter();
  const { profile, refreshProfile, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [member, setMember] = useState<MemberMe | null>(null);
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [profileIntro, setProfileIntro] = useState(profile?.profileIntro ?? "");
  const [preview, setPreview] = useState<string | null>(
    profile?.profileImage ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [nicknameAvailable, setNicknameAvailable] = useState(true);
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [appliedProfileId, setAppliedProfileId] = useState(
    profile?.memberUuid ?? ""
  );
  const apiError = useApiError(error ? new Error(error) : null);
  const passwordApiError = useApiError(
    passwordError ? new Error(passwordError) : null
  );
  const isLocal = member?.loginType === "LOCAL";
  const originalNickname = profile?.nickname ?? "";
  const originalIntro = profile?.profileIntro?.trim() ?? "";
  const nicknameChanged = nickname.trim() !== originalNickname;
  const introChanged = profileIntro.trim() !== originalIntro;
  const nicknameValid = nicknameSchema.safeParse(nickname).success;
  const profileDirty = nicknameChanged || introChanged || imageFile !== null;
  const canSaveProfile =
    profileDirty &&
    nicknameValid &&
    (!nicknameChanged || nicknameAvailable) &&
    !savingProfile;
  const passwordReady =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword.length <= 64 &&
    newPassword === confirmPassword;
  const displayNickname = nickname.trim() || profile?.nickname || "회원";
  const displayIntro = profileIntro.trim() || "소개글을 입력해주세요";

  if (profile && profile.memberUuid !== appliedProfileId) {
    setAppliedProfileId(profile.memberUuid);
    setNickname(profile.nickname);
    setProfileIntro(profile.profileIntro ?? "");
    setPreview((current) => current ?? profile.profileImage);
    setNicknameAvailable(true);
  }

  useEffect(() => {
    let cancelled = false;

    getMyMember()
      .then((nextMember) => {
        if (!cancelled) {
          setMember(nextMember);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "회원정보를 불러오지 못했습니다."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const checkNickname = async () => {
    setChecking(true);
    setNicknameMessage("");
    setNicknameAvailable(false);

    try {
      const result = await checkNicknameAvailability(nickname);
      setNicknameAvailable(result.available);
      setNicknameMessage(
        result.available ? "사용할 수 있는 닉네임이에요" : "중복된 닉네임입니다"
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

  const handleImage = async (file: File | null) => {
    if (!file) {
      setImageFile(null);
      setPreview(profile?.profileImage ?? null);
      return;
    }

    try {
      const normalized = await toProfileImageFile(file);
      setImageFile(normalized);
      setPreview(URL.createObjectURL(normalized));
      setProfileSuccess("");
      setError("");
    } catch (imageError) {
      setError(
        imageError instanceof Error
          ? imageError.message
          : "프로필 이미지를 처리할 수 없습니다."
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!canSaveProfile) {
      return;
    }

    setSavingProfile(true);
    setError("");
    setProfileSuccess("");

    try {
      if (nicknameChanged && !nicknameAvailable) {
        throw new Error("닉네임 중복 확인을 진행해주세요.");
      }

      let profileImage = profile?.profileImage ?? undefined;

      if (imageFile) {
        const uploaded = await uploadProfileImage(imageFile);
        profileImage = uploaded.profileImage;
      }

      const saved = await updateMyPage({
        ...(nicknameChanged ? { nickname: nickname.trim() } : {}),
        ...(introChanged || imageFile
          ? { profileIntro: profileIntro.trim() || null }
          : {}),
        ...(imageFile ? { profileImage } : {}),
      });

      setMember(saved.member);
      setImageFile(null);
      await refreshProfile();
      setProfileSuccess("저장되었습니다");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "저장에 실패했습니다."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordReady) {
      return;
    }

    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      if (!isLocal) {
        throw new Error("소셜 계정은 비밀번호를 변경할 수 없습니다.");
      }

      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("저장되었습니다");
    } catch (saveError) {
      setPasswordError(
        saveError instanceof Error
          ? saveError.message
          : "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setError("");

    try {
      await withdrawMember();
      await logout();
      router.replace("/");
    } catch (withdrawError) {
      setError(
        withdrawError instanceof Error
          ? withdrawError.message
          : "회원 탈퇴에 실패했습니다."
      );
      setWithdrawing(false);
      setWithdrawOpen(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <MyPageCard>
        <h1 className="text-[18px] font-bold leading-[22px] text-[#1F1F1F]">
          프로필 정보
        </h1>

        <div className="flex w-full flex-col items-center justify-center gap-5">
          <ProfileAvatar nickname={displayNickname} size={120} src={preview} />
          <div className="flex flex-col items-center gap-2">
            <p className="text-[24px] font-bold leading-[30px] text-[#1F1F1F]">
              {displayNickname}님
            </p>
            <p className="text-[14px] leading-[18px] text-[#615E5B]">
              {displayIntro}
            </p>
          </div>
          <button
            className="flex h-[34px] w-[140px] items-center justify-center rounded-lg border-[1.5px] border-[#B0B0B0] text-[14px] font-semibold leading-[18px] text-[#615E5B]"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            프로필 변경
          </button>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) =>
              void handleImage(event.target.files?.[0] ?? null)
            }
            ref={fileInputRef}
            type="file"
          />
        </div>

        <div className="flex w-full max-w-[440px] flex-col gap-6">
          <div className="grid gap-2">
            <FieldLabel>닉네임(10자 이내)</FieldLabel>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <InputField
                  className={fieldClass}
                  maxLength={10}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setNicknameAvailable(false);
                    setNicknameMessage("");
                    setProfileSuccess("");
                  }}
                  showLabel={false}
                  value={nickname}
                />
              </div>
              <button
                className="flex h-11 w-20 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E5E5] text-[14px] font-semibold leading-[18px] text-[#1A1A1A] disabled:cursor-not-allowed disabled:text-[#D9D9D9]"
                disabled={!nicknameValid || !nicknameChanged || checking}
                onClick={() => void checkNickname()}
                type="button"
              >
                중복 확인
              </button>
            </div>
            {nicknameMessage ? (
              <p
                className={`text-[11px] leading-[14px] ${
                  nicknameAvailable ? "text-[#5FA37F]" : "text-[#FF4B4B]"
                }`}
              >
                {nicknameMessage}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel>프로필 소개글(20자 이내)</FieldLabel>
            <InputField
              className={fieldClass}
              maxLength={20}
              onChange={(event) => {
                setProfileIntro(event.target.value);
                setProfileSuccess("");
              }}
              showLabel={false}
              value={profileIntro}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3.5 pt-3.5">
          <div className="h-px w-full bg-[#EAF0F6]" />
          <div className="flex items-center justify-end gap-2.5">
            {profileSuccess ? (
              <p className="text-[14px] leading-[18px] text-[#5FA37F]">
                {profileSuccess}
              </p>
            ) : null}
            <SaveButton
              disabled={!canSaveProfile}
              onClick={() => void handleSaveProfile()}
            />
          </div>
        </div>
      </MyPageCard>

      {isLocal ? (
        <MyPageCard>
          <div className="grid gap-[3px]">
            <h2 className="text-[18px] font-bold leading-[22px] text-[#1F1F1F]">
              비밀번호 변경
            </h2>
            <p className="text-[12px] leading-[15px] tracking-[0.3px] text-[#848484]">
              영문, 숫자, 특수문자를 조합해 8자 이상으로 설정해주세요
            </p>
          </div>

          <div className="flex w-full max-w-[440px] flex-col gap-6">
            <div className="grid gap-2">
              <FieldLabel>현재 비밀번호</FieldLabel>
              <InputField
                autoComplete="current-password"
                className={fieldClass}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="현재 비밀번호 입력"
                showLabel={false}
                type="password"
                value={currentPassword}
              />
            </div>

            <div className="grid gap-2">
              <FieldLabel>신규 비밀번호</FieldLabel>
              <InputField
                autoComplete="new-password"
                className={fieldClass}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="신규 비밀번호 입력"
                showLabel={false}
                type="password"
                value={newPassword}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <div className="grid gap-2">
              <FieldLabel>신규 비밀번호 확인</FieldLabel>
              <InputField
                autoComplete="new-password"
                className={fieldClass}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                placeholder="신규 비밀번호 재입력"
                showLabel={false}
                type="password"
                value={confirmPassword}
              />
              {confirmPassword && confirmPassword !== newPassword ? (
                <p className="text-[11px] leading-[14px] text-[#FF4B4B]">
                  새 비밀번호가 일치하지 않습니다.
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3.5 pt-3.5">
            <div className="h-px w-full bg-[#EAF0F6]" />
            <div className="flex items-center justify-end gap-2.5">
              {passwordApiError ? (
                <p className="text-[14px] leading-[18px] text-[#FF4B4B]">
                  {passwordApiError}
                </p>
              ) : null}
              {passwordSuccess ? (
                <p className="text-[14px] leading-[18px] text-[#5FA37F]">
                  {passwordSuccess}
                </p>
              ) : null}
              <SaveButton
                disabled={savingPassword || !passwordReady}
                onClick={() => void handleSavePassword()}
              />
            </div>
          </div>
        </MyPageCard>
      ) : null}

      <section className="flex w-full flex-col items-start gap-5 rounded-[24px] border-[1.5px] border-[rgba(255,75,75,0.25)] bg-[#FFF2F2] px-8 py-[25px]">
        <h2 className="text-[18px] font-bold leading-[22px] text-[#FF4B4B]">
          회원 탈퇴
        </h2>
        <p className="w-full text-[14px] leading-[18px] text-[#615E5B]">
          탈퇴 시 여행 스토리, 일정, 팔로우 정보가 모두 삭제되며 복구할 수
          없어요. 신중하게 선택해 주세요.
        </p>
        <button
          className="w-full text-right text-[14px] font-bold leading-[18px] text-[#FF4B4B] underline"
          onClick={() => setWithdrawOpen(true)}
          type="button"
        >
          회원 탈퇴하기
        </button>
      </section>

      {apiError ? (
        <p className="text-[14px] text-[#FF4B4B]" role="alert">
          {apiError}
        </p>
      ) : null}

      <Dialog
        description="탈퇴하면 여행 스토리, 일정, 팔로우 정보가 모두 삭제되며 복구할 수 없습니다."
        onClose={() => setWithdrawOpen(false)}
        open={withdrawOpen}
        title="회원 탈퇴할까요?"
      >
        <div className="flex justify-end gap-3">
          <button
            className="rounded-md border border-[#E5E5E5] px-5 py-2.5 text-[14px] font-semibold text-[#1F1F1F]"
            disabled={withdrawing}
            onClick={() => setWithdrawOpen(false)}
            type="button"
          >
            취소
          </button>
          <button
            className="rounded-md bg-[#FF4B4B] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40"
            disabled={withdrawing}
            onClick={() => void handleWithdraw()}
            type="button"
          >
            회원 탈퇴하기
          </button>
        </div>
      </Dialog>
    </div>
  );
}
