"use client";

import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Coins,
  Home,
  Menu,
  Search,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BrandLogo } from "./BrandLogo";

interface HeaderProps {
  authenticated?: boolean;
  variant?: "solid" | "overlay";
}

const primaryNavigation = [
  { href: "/schedules", label: "AI 일정생성", icon: Sparkles },
  { href: "/community", label: "커뮤니티", icon: Users },
  { href: "/mypage", label: "마이페이지", icon: UserRound, protected: true },
  { href: "/search", label: "검색", icon: Search },
];

export function Header({
  authenticated = true,
  variant = "solid",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const positionClass =
    variant === "overlay" ? "absolute left-0 top-0" : "sticky top-0";
  const surfaceClass =
    variant === "overlay"
      ? "bg-transparent"
      : "bg-black/88 backdrop-blur-sm";

  return (
    <header
      className={`${positionClass} ${surfaceClass} z-50 w-full text-white`}
    >
      <div className="mx-auto flex h-[4.75rem] w-full items-center justify-between px-6 sm:px-10 lg:h-24 lg:px-16 xl:px-20">
        <BrandLogo inverse />

        <nav
          aria-label="주요 메뉴"
          className="hidden items-center gap-9 text-base lg:flex"
        >
          <Link
            aria-label="홈"
            className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 transition hover:bg-blue-500"
            href="/"
          >
            <Home aria-hidden="true" className="h-5 w-5" />
          </Link>

          {primaryNavigation.map((item) => {
            if (item.protected && !authenticated) {
              return null;
            }

            return (
              <Link
                className="inline-flex items-center gap-1.5 text-white/82 transition hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
                {(item.label === "AI 일정생성" ||
                  item.label === "커뮤니티" ||
                  item.label === "마이페이지") && (
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {authenticated ? (
            <>
              <span
                aria-label="보유 토큰 500개"
                className="inline-flex items-center gap-1.5 text-xs text-white/85"
              >
                <Coins aria-hidden="true" className="h-4 w-4 text-amber-300" />
                500
              </span>
              <span className="text-xs font-semibold">배고팡님</span>
              <Link aria-label="사용자 프로필" href="/mypage">
                <CircleUserRound
                  aria-hidden="true"
                  className="h-7 w-7 text-white"
                />
              </Link>
              <Link aria-label="알림" href="/notifications">
                <Bell
                  aria-hidden="true"
                  className="h-5 w-5 text-white/85 transition hover:text-white"
                />
              </Link>
            </>
          ) : (
            <Link
              className="rounded-full border border-white/35 bg-white/18 px-8 py-3 text-base font-medium transition hover:bg-white/28"
              href="/schedules"
            >
              여행 하기
            </Link>
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
          className="border-t border-white/10 bg-black px-5 py-5 lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/10"
              href="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home aria-hidden="true" className="h-4 w-4" />
              홈
            </Link>
            {primaryNavigation.map((item) => {
              if (item.protected && !authenticated) {
                return null;
              }

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

            {authenticated ? (
              <div className="mt-3 flex items-center justify-between border-t border-white/10 px-3 pt-4">
                <span className="inline-flex items-center gap-2 text-sm">
                  <Coins
                    aria-hidden="true"
                    className="h-4 w-4 text-amber-300"
                  />
                  토큰 500
                </span>
                <Link
                  aria-label="알림"
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell aria-hidden="true" className="h-5 w-5" />
                </Link>
              </div>
            ) : (
              <Link
                className="mt-3 rounded-full bg-white px-5 py-3 text-center font-semibold text-black"
                href="/schedules"
                onClick={() => setMobileMenuOpen(false)}
              >
                여행 하기
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
