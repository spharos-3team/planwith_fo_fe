"use client";

import { BellOff, KeyRound, Monitor, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";

const notices = [
  {
    icon: ShieldCheck,
    title: "계정 정보 보관",
    description:
      "로그아웃 후에도 계정 정보와 여행 스토리는 안전하게 보관됩니다.",
  },
  {
    icon: Monitor,
    title: "공용 기기 주의",
    description: "공용 기기에서는 반드시 로그아웃 후 브라우저를 종료해주세요.",
  },
  {
    icon: KeyRound,
    title: "자동 로그인 해제",
    description: "로그아웃 시 현재 브라우저의 로그인 세션이 종료됩니다.",
  },
  {
    icon: BellOff,
    title: "알림 수신 중단",
    description: "로그아웃 후 알림 수신이 중단되며 재로그인 시 복원됩니다.",
  },
];

export function LogoutPage() {
  const { logout } = useAuth();
  const [request, setRequest] = useState({ submitting: false, error: "" });

  const handleLogout = async () => {
    setRequest({ submitting: true, error: "" });

    try {
      await logout();
      window.location.replace("/logout/completed");
    } catch (error) {
      setRequest({
        submitting: false,
        error:
          error instanceof Error ? error.message : "로그아웃에 실패했습니다.",
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <MyPageCard>
        <h1 className="text-heading-lg text-text-primary">로그아웃</h1>
        <div className="flex w-full flex-col items-center rounded-lg bg-blue-ice/60 px-6 py-8 text-center">
          <h2 className="text-heading-md text-text-primary">
            정말 로그아웃 하시겠습니까?
          </h2>
          <p className="mt-2 text-caption text-text-secondary">
            로그아웃 시 저장된 세션이 종료되며 다시 로그인해야 서비스를 이용할
            수 있습니다.
          </p>
          <Button
            className="mt-6 min-w-40"
            disabled={request.submitting}
            onClick={() => void handleLogout()}
            size="sm"
          >
            로그아웃
          </Button>
          {request.error ? (
            <p className="mt-3 text-caption text-status-error" role="alert">
              {request.error}
            </p>
          ) : null}
        </div>
      </MyPageCard>

      <MyPageCard>
        <div>
          <h2 className="text-heading-lg text-text-primary">로그아웃 안내</h2>
          <p className="mt-1 text-caption text-text-secondary">
            로그아웃 전 아래 사항을 확인해주세요.
          </p>
        </div>
        <ul className="grid w-full gap-3">
          {notices.map(({ icon: Icon, title, description }) => (
            <li
              className="flex gap-3 rounded-lg bg-surface-page px-5 py-4"
              key={title}
            >
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-text-secondary"
              />
              <div>
                <p className="text-label-sm text-text-primary">{title}</p>
                <p className="mt-1 text-caption text-text-secondary">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </MyPageCard>
    </div>
  );
}
