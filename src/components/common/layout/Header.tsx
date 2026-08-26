"use client";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  Coins,
  Home,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useOptionalAuth } from "@/features/auth/context/AuthProvider";
import { useTokenBalance } from "@/features/payment/hooks/usePaymentSummary";

import { BrandLogo } from "./BrandLogo";
import { ContentContainer, HeroContentContainer } from "./ContentContainer";

interface HeaderProps {
  authenticated?: boolean;
  variant?: "solid" | "overlay";
  activeHref?: string;
}

const scheduleNavItems = [
  {
    href: "/schedules",
    label: "일정관리",
    icon: Sparkles,
  },
  { href: "/meetings", label: "커뮤니티", hasDropdown: true, icon: Users },
  {
    href: "/mypage",
    label: "마이페이지",
    hasDropdown: true,
    icon: UserRound,
    protected: true,
  },
  { href: "/search", label: "검색", icon: Search },
];

const scheduleSubmenuItems = [
  {
    href: "/schedules/calendar",
    label: "내 일정 캘린더",
    description: "일·주·월 일정 모아보기",
    icon: CalendarDays,
  },
  {
    href: "/schedules/ai/new",
    label: "AI 일정 만들기",
    description: "여행 조건으로 AI 일정 생성",
    icon: Sparkles,
  },
] as const;

const headerAssets = {
  chevron: "/images/header/chevron-down.svg",
  chevronActive: "/images/header/chevron-down-active.svg",
  message: "/images/header/message.svg",
  notification: "/images/header/notification.svg",
  profile: "/images/header/profile.svg",
  token: "/images/header/token.svg",
} as const;

function ScheduleDesktopMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative isolate flex h-10 items-center justify-center px-4 text-body-md transition ${
          active ? "text-text-inverse" : "text-white/80 hover:text-text-inverse"
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute -inset-x-1 inset-y-0 -z-10 rounded-full border border-brand-primary/40 bg-header-nav-active"
          />
        ) : null}
        일정관리
        <Image
          alt=""
          className={`size-6 transition ${open ? "rotate-180" : ""}`}
          height={24}
          src={active ? headerAssets.chevronActive : headerAssets.chevron}
          width={24}
        />
      </button>

      {open ? (
        <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-72 -translate-x-1/2 rounded-lg border border-white/20 bg-header-branded/95 p-2 shadow-landmark backdrop-blur-md">
          {scheduleSubmenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-start gap-3 rounded-md px-3 py-3 transition hover:bg-white/12"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-circle bg-white/10">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-body-sm font-semibold text-text-inverse">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-caption text-white/65">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

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
      : current === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={`relative isolate flex h-10 items-center justify-center px-4 text-body-md transition ${
        isActive ? "text-text-inverse" : "text-white/80 hover:text-text-inverse"
      }`}
      href={href}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute -inset-x-1 inset-y-0 -z-10 rounded-full border border-brand-primary/40 bg-header-nav-active"
        />
      )}
      <span className="inline-flex items-center">
        {label}
        {hasDropdown ? (
          <Image
            alt=""
            className="size-6"
            height={24}
            src={isActive ? headerAssets.chevronActive : headerAssets.chevron}
            width={24}
          />
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
  const pathname = usePathname();
  const isAuthenticated = authenticated ?? auth?.isAuthenticated ?? false;
  const nickname = auth?.profile?.nickname;
  const memberUuid = isAuthenticated ? (auth?.profile?.memberUuid ?? "") : "";
  const tokenBalanceQuery = useTokenBalance(memberUuid);
  const tokenBalance = tokenBalanceQuery.data?.totalBalance;
  const formattedTokenBalance =
    tokenBalance === undefined ? "—" : tokenBalance.toLocaleString("ko-KR");
  const tokenBalanceLabel = tokenBalanceQuery.isError
    ? "보유 토큰 조회 실패"
    : tokenBalance === undefined
      ? "보유 토큰 조회 중"
      : `보유 토큰 ${formattedTokenBalance}개`;
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
      <HeroContentContainer>
        <div className="relative flex h-[4.75rem] items-center justify-between xl:h-20 min-[1680px]:px-[5px]">
          <BrandLogo inverse />

          <nav
            aria-label="주요 메뉴"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-[15px] xl:flex"
          >
            <NavLink activeHref={activeHref} href="/" label="홈" />
            {visibleNavItems.map((item) => {
              if (item.href === "/schedules") {
                return isAuthenticated ? (
                  <ScheduleDesktopMenu
                    active={pathname.startsWith("/schedules")}
                    key={item.href}
                  />
                ) : (
                  <NavLink
                    activeHref={activeHref}
                    href="/schedules/ai/new"
                    key={item.href}
                    label="AI 일정생성"
                  />
                );
              }

              return (
                <NavLink
                  activeHref={activeHref}
                  hasDropdown={item.hasDropdown}
                  href={item.href}
                  key={item.href}
                  label={item.label}
                />
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 xl:flex">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4">
                  <Link
                    aria-current={
                      pathname.startsWith("/chat") ? "page" : undefined
                    }
                    aria-label="채팅"
                    href="/chat"
                  >
                    <Image
                      alt=""
                      className="size-[30px]"
                      height={30}
                      src={headerAssets.message}
                      width={30}
                    />
                  </Link>
                  <Link aria-label="알림" href="/notifications">
                    <Image
                      alt=""
                      className="size-[30px]"
                      height={30}
                      src={headerAssets.notification}
                      width={30}
                    />
                  </Link>
                </div>
                <span
                  aria-label={tokenBalanceLabel}
                  className="inline-flex items-center gap-[7px] text-label-sm text-text-inverse"
                >
                  <Image
                    alt=""
                    className="size-6"
                    height={24}
                    src={headerAssets.token}
                    width={24}
                  />
                  {formattedTokenBalance}
                </span>
                <Link
                  aria-label="사용자 프로필"
                  className="flex items-center"
                  href="/mypage"
                >
                  <span className="p-2.5 text-label-sm text-text-inverse">
                    {nickname ? `${nickname}님` : "회원님"}
                  </span>
                  <Image
                    alt=""
                    className="size-9"
                    height={36}
                    src={headerAssets.profile}
                    width={36}
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
                  className="header-glass-cta group block h-[46px] w-[129px] overflow-hidden rounded-[333px] font-sans text-[15px] font-medium leading-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href="/schedules/ai/new"
                >
                  <span className="header-cta-slider relative z-[2] block h-[86px] w-full">
                    <span className="absolute left-0 top-0 flex h-[45px] w-full items-center justify-center px-6 py-3 uppercase text-white">
                      <span className="translate-y-px">여행 하기</span>
                    </span>
                    <span className="absolute left-0 top-[44px] flex h-[42px] w-full items-center justify-center text-center text-[rgb(47_47_47_/_0.7)]">
                      Login
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          <button
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 xl:hidden"
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
      </HeroContentContainer>

      {mobileMenuOpen && (
        <nav
          aria-label="모바일 메뉴"
          className={`border-t px-5 py-5 xl:hidden ${mobileMenuSurfaceClass}`}
        >
          <ContentContainer className="grid gap-1 px-0 sm:px-0 xl:px-0 min-[1440px]:px-0">
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/10"
              href="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home aria-hidden="true" className="h-4 w-4" />홈
            </Link>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              if (item.href === "/schedules" && isAuthenticated) {
                return (
                  <details className="group" key={item.href}>
                    <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      일정관리
                      <ChevronDown
                        aria-hidden="true"
                        className="ml-auto h-4 w-4 transition group-open:rotate-180"
                      />
                    </summary>
                    <div className="ml-7 grid gap-1 border-l border-white/15 pl-3">
                      {scheduleSubmenuItems.map((subitem) => (
                        <Link
                          className="rounded-md px-3 py-2 text-body-sm text-white/80 hover:bg-white/10 hover:text-white"
                          href={subitem.href}
                          key={subitem.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                );
              }

              return (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/10"
                  href={
                    item.href === "/schedules" ? "/schedules/ai/new" : item.href
                  }
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
                  토큰 {formattedTokenBalance}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    aria-current={
                      pathname.startsWith("/chat") ? "page" : undefined
                    }
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
                  href="/schedules/ai/new"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  여행 하기
                </Link>
              </>
            )}
          </ContentContainer>
        </nav>
      )}
    </header>
  );
}
