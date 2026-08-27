"use client";

import {
  CircleDollarSign,
  CreditCard,
  Heart,
  LogOut,
  type LucideIcon,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { useDismissibleOpen } from "@/components/common/layout/useDismissibleOpen";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";

const menuItems: ReadonlyArray<{
  href: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
}> = [
  { href: "/mypage", label: "프로필", icon: UserRound },
  { href: "/mypage/profile", label: "개인정보 수정", icon: Settings },
  { href: "/mypage/followers", label: "팔로워/팔로우 관리", icon: Users },
  { href: "/mypage/likes", label: "좋아요", icon: Heart },
  { href: "/mypage/membership", label: "멤버십 관리", icon: CreditCard },
  { href: "/mypage/payments", label: "결제수단", icon: CircleDollarSign },
  { href: "/mypage/logout", label: "로그아웃", icon: LogOut, danger: true },
];

export function HeaderProfileMenu({
  memberUuid,
  nickname,
  profileImage,
  trigger,
  onNavigate,
}: {
  memberUuid: string;
  nickname: string;
  profileImage: string | null;
  trigger: ReactNode;
  onNavigate?: () => void;
}) {
  const { open, setOpen, ref } = useDismissibleOpen();
  const displayName = nickname.trim() || "회원";

  const closeAndNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="사용자 메뉴"
        className="flex items-center"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {trigger}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[260px] overflow-hidden rounded-[16px] border border-blue-ice bg-surface-default text-text-primary shadow-landmark"
          role="menu"
        >
          <div className="flex items-center gap-3 border-b border-blue-ice px-4 py-3">
            <ProfileAvatar
              memberUuid={memberUuid}
              nickname={displayName}
              size={40}
              src={profileImage}
            />
            <p className="min-w-0 truncate text-[15px] font-bold leading-5">
              {displayName}님
            </p>
          </div>
          <nav aria-label="마이페이지 메뉴" className="py-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={`flex items-center gap-3 px-4 py-2.5 text-[14px] leading-[18px] hover:bg-surface-page ${
                    item.danger ? "text-status-error" : "text-text-primary"
                  }`}
                  href={item.href}
                  key={item.href}
                  onClick={closeAndNavigate}
                  role="menuitem"
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
