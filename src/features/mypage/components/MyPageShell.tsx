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
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import type { MyPageSection } from "@/features/mypage/types";

const itemClass =
  "flex h-[43px] w-full items-center gap-3 rounded-xl px-4 text-[15px] leading-[19px] transition";

type MenuItem = {
  href: string;
  section: MyPageSection;
  label: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  {
    href: "/mypage",
    section: "overview",
    label: "프로필",
    icon: UserRound,
  },
  {
    href: "/mypage/profile",
    section: "profile",
    label: "개인정보 수정",
    icon: Settings,
  },
  {
    href: "/mypage/followers",
    section: "followers",
    label: "팔로워/팔로우 관리",
    icon: Users,
  },
  {
    href: "/mypage/likes",
    section: "likes",
    label: "좋아요",
    icon: Heart,
  },
  {
    href: "/mypage/membership",
    section: "membership",
    label: "멤버십 관리",
    icon: CreditCard,
  },
  {
    href: "/mypage/payments",
    section: "payments",
    label: "결제수단",
    icon: CircleDollarSign,
  },
  {
    href: "/mypage/logout",
    section: "logout",
    label: "로그아웃",
    icon: LogOut,
  },
];

function sectionFromPath(pathname: string): MyPageSection {
  if (pathname.startsWith("/mypage/stories")) {
    return "overview";
  }

  if (pathname.startsWith("/mypage/followers")) {
    return "followers";
  }

  if (pathname.startsWith("/mypage/payments")) {
    return "payments";
  }

  if (pathname.startsWith("/mypage/likes")) {
    return "likes";
  }

  if (pathname.startsWith("/mypage/membership")) {
    return "membership";
  }

  if (pathname.startsWith("/mypage/logout")) {
    return "logout";
  }

  if (pathname.startsWith("/mypage/profile")) {
    return "profile";
  }

  return "overview";
}

function MenuLabel({
  icon: Icon,
  label,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <>
      <Icon
        aria-hidden="true"
        className={`size-[18px] shrink-0 ${active ? "text-text-inverse" : "text-text-secondary"}`}
        strokeWidth={2}
      />
      <span className="flex-1 text-left">{label}</span>
    </>
  );
}

export function MyPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = sectionFromPath(pathname);

  return (
    <div className="bg-surface-default">
      <div className="mx-auto flex w-full max-w-[1562px] justify-center gap-8 px-6 py-10 pb-[60px] lg:px-10">
        <aside className="hidden h-fit w-[340px] shrink-0 flex-col items-start gap-3 rounded-[24px] border-[1.5px] border-blue-ice bg-surface-default p-6 lg:flex">
          <p className="text-heading-lg text-text-primary">마이페이지 메뉴</p>

          <nav aria-label="마이페이지 메뉴" className="grid w-full gap-3">
            {menuItems.map((item) => {
              const isActive = active === item.section;

              return (
                <Link
                  className={`${itemClass} ${
                    isActive
                      ? "bg-blue-700 font-semibold text-text-inverse"
                      : "font-medium text-text-primary hover:bg-surface-page"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <MenuLabel
                    active={isActive}
                    icon={item.icon}
                    label={item.label}
                  />
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 w-full max-w-[1190px] flex-col gap-6">
          <nav
            aria-label="마이페이지 메뉴"
            className="flex gap-2 overflow-x-auto lg:hidden"
          >
            {menuItems.map((item) => {
              const isActive = active === item.section;

              return (
                <Link
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-[14px] ${
                    isActive
                      ? "bg-blue-700 font-semibold text-text-inverse"
                      : "border border-blue-ice font-medium text-text-primary"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
