"use client";

import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Coins,
  Home,
  MapPinned,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useOptionalAuth } from "@/features/auth/context/AuthProvider";

import { BrandLogo } from "./BrandLogo";

interface HeaderProps {
  authenticated?: boolean;
  variant?: "solid" | "overlay";
  activeHref?: string;
}

const scheduleNavItems = [
  {
    href: "/schedules",
    label: "일정관리",
    hasDropdown: true,
    icon: Sparkles,
  },
  { href: "/meetings", label: "모임", icon: MapPinned },
  { href: "/community", label: "커뮤니티", hasDropdown: true, icon: Users },
  {
    href: "/mypage",
    label: "마이페이지",
    hasDropdown: true,
    icon: UserRound,
    protected: true,
  },
  { href: "/search", label: "검색", icon: Search },
];

function NavLink({
  activeHref,
  href,
  label,
  hasDropdown,
}: {
  activeHref?: string;
  href: string;
  label: string;
  hasDropdown?: boolean;
}) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const isActive =
    href === "/"
      ? current === "/"
      : current === href || current.startsWith(`${href}/`);

  return (
    <Link
      className={`relative px-4 py-2 transition ${
        isActive ? "text-text-inverse" : "text-white/80 hover:text-text-inverse"
      }`}
      href={href}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute inset-x-1 inset-y-0 -z-10 rounded-full bg-header-nav-active"
        />
      )}
      <span className="inline-flex items-center gap-1">
        {label}
        {hasDropdown ? (
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        ) : null}
      </span>
    </Link>
  );
}

export function Header({
  authenticated,
  variant = "solid",
  activeHref,
}: HeaderProps) {
  const auth = useOptionalAuth();
  const isAuthenticated = authenticated ?? auth?.isAuthenticated ?? false;
  const nickname = auth?.profile?.nickname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isOverlay = variant === "overlay";
  const positionClass = isOverlay ? "absolute left-0 top-0" : "sticky top-0";
  const surfaceClass = isOverlay ? "bg-transparent" : "bg-header-branded";
  const mobileMenuSurfaceClass = isOverlay
    ? "border-white/10 bg-black"
    : "border-white/20 bg-header-branded";

  const visibleNavItems = scheduleNavItems.filter(
    (item) => !item.protected || isAuthenticated
  );

  return (
    <header
      className={`${positionClass} ${surfaceClass} z-50 w-full text-white`}
    >
      <div className="mx-auto flex h-[4.75rem] w-full items-center justify-between px-6 sm:px-10 lg:h-24 lg:px-16 xl:px-20">
        <BrandLogo inverse />

        <nav
          aria-label="주요 메뉴"
          className="relative hidden items-center gap-0 text-base lg:flex"
        >
          <NavLink activeHref={activeHref} href="/" label="홈" />
          {visibleNavItems.map((item) => (
            <NavLink
              activeHref={activeHref}
              hasDropdown={item.hasDropdown}
              href={item.href}
              key={item.href}
              label={item.label}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link aria-label="채팅" href="/chat">
                <MessageCircle
                  aria-hidden="true"
                  className="h-5 w-5 text-white/85 transition hover:text-white"
                />
              </Link>
              <Link aria-label="알림" href="/notifications">
                <Bell
                  aria-hidden="true"
                  className="h-5 w-5 text-white/85 transition hover:text-white"
                />
              </Link>
              <span
                aria-label="보유 토큰 500개"
                className="inline-flex items-center gap-1.5 text-xs text-white/85"
              >
                <Coins aria-hidden="true" className="h-4 w-4 text-amber-300" />
                500
              </span>
              <span className="text-xs font-semibold">
                {nickname ? `${nickname}님` : "회원님"}
              </span>
              <Link aria-label="사용자 프로필" href="/mypage">
                <CircleUserRound
                  aria-hidden="true"
                  className="h-7 w-7 text-white"
                />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                className="px-3 py-2 text-body-md text-white/90 transition hover:text-white"
                href="/login"
              >
                로그인
              </Link>
              <Link
                className="rounded-full border border-white/35 bg-white/18 px-8 py-3 text-base font-medium transition hover:bg-white/28"
                href="/schedules"
              >
                여행 하기
              </Link>
            </div>
          )}
        </div>

        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/20 lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          {mobileMenuOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="모바일 메뉴"
          className={`border-t px-5 py-5 lg:hidden ${mobileMenuSurfaceClass}`}
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/10"
              href="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home aria-hidden="true" className="h-4 w-4" />홈
            </Link>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/10"
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <div className="mt-3 flex items-center justify-between border-t border-white/10 px-3 pt-4">
                <span className="inline-flex items-center gap-2 text-sm">
                  <Coins
                    aria-hidden="true"
                    className="h-4 w-4 text-amber-300"
                  />
                  토큰 500
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    aria-label="채팅"
                    href="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle aria-hidden="true" className="h-5 w-5" />
                  </Link>
                  <Link
                    aria-label="알림"
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bell aria-hidden="true" className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link
                  className="mt-3 rounded-full border border-white/35 px-5 py-3 text-center font-semibold"
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  className="mt-2 rounded-full bg-white px-5 py-3 text-center font-semibold text-black"
                  href="/schedules"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  여행 하기
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
