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
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { useAuth } from "@/features/auth/context/AuthProvider";
import type { MyPageSection } from "@/features/mypage/types";

const itemClass =
  "flex h-[43px] w-full items-center gap-3 rounded-xl px-4 text-[15px] leading-[19px] transition";

type MenuItem =
  | {
      kind: "link";
      href: string;
      section: MyPageSection;
      label: string;
      icon: LucideIcon;
    }
  | { kind: "soon"; label: string; icon: LucideIcon }
  | { kind: "logout"; label: string; icon: LucideIcon };

const menuItems: MenuItem[] = [
  { kind: "soon", label: "프로필", icon: UserRound },
  {
    kind: "link",
    href: "/mypage/profile",
    section: "profile",
    label: "개인정보 수정",
    icon: Settings,
  },
  {
    kind: "link",
    href: "/mypage/followers",
    section: "followers",
    label: "팔로워/팔로우 관리",
    icon: Users,
  },
  { kind: "soon", label: "좋아요", icon: Heart },
  { kind: "soon", label: "멤버십 관리", icon: CreditCard },
  {
    kind: "link",
    href: "/mypage/payments",
    section: "payments",
    label: "결제수단",
    icon: CircleDollarSign,
  },
  { kind: "logout", label: "로그아웃", icon: LogOut },
];

function sectionFromPath(pathname: string): MyPageSection {
  if (pathname.startsWith("/mypage/followers")) {
    return "followers";
  }

  if (pathname.startsWith("/mypage/payments")) {
    return "payments";
  }

  return "profile";
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
        className={`size-[18px] shrink-0 ${active ? "text-white" : "text-[#615E5B]"}`}
        strokeWidth={2}
      />
      <span className="flex-1 text-left">{label}</span>
    </>
  );
}

export function MyPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const active = sectionFromPath(pathname);
  const mobileLinks = menuItems.filter((item) => item.kind === "link");

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      router.replace("/");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto flex w-full max-w-[1562px] justify-center gap-8 px-6 py-10 pb-[60px] lg:px-10">
        <aside className="hidden h-fit w-[340px] shrink-0 flex-col items-start gap-3 rounded-[24px] border-[1.5px] border-[#EAF0F6] bg-white p-6 lg:flex">
          <p className="text-[18px] font-semibold leading-[22px] text-[#1F1F1F]">
            마이페이지 메뉴
          </p>

          <nav aria-label="마이페이지 메뉴" className="grid w-full gap-3">
            {menuItems.map((item) => {
              if (item.kind === "soon") {
                return (
                  <span
                    aria-disabled="true"
                    className={`${itemClass} cursor-not-allowed font-medium text-[#1F1F1F] opacity-60`}
                    key={item.label}
                  >
                    <MenuLabel icon={item.icon} label={item.label} />
                  </span>
                );
              }

              if (item.kind === "logout") {
                return (
                  <button
                    className={`${itemClass} font-medium text-[#1F1F1F] hover:bg-[#F6F8FB]`}
                    key={item.label}
                    onClick={() => setLogoutOpen(true)}
                    type="button"
                  >
                    <MenuLabel icon={item.icon} label={item.label} />
                  </button>
                );
              }

              const isActive = active === item.section;

              return (
                <Link
                  className={`${itemClass} ${
                    isActive
                      ? "bg-[#002BFF] font-semibold text-white"
                      : "font-medium text-[#1F1F1F] hover:bg-[#F6F8FB]"
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
            {mobileLinks.map((item) => {
              const isActive = active === item.section;

              return (
                <Link
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-[14px] ${
                    isActive
                      ? "bg-[#002BFF] font-semibold text-white"
                      : "border border-[#EAF0F6] font-medium text-[#1F1F1F]"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              className="shrink-0 rounded-xl border border-[#EAF0F6] px-4 py-2.5 text-[14px] font-medium text-[#1F1F1F]"
              onClick={() => setLogoutOpen(true)}
              type="button"
            >
              로그아웃
            </button>
          </nav>
          {children}
        </div>
      </div>

      <Dialog
        description="현재 기기에서 로그아웃합니다. Refresh Cookie는 서버에서 폐기됩니다."
        onClose={() => setLogoutOpen(false)}
        open={logoutOpen}
        title="로그아웃할까요?"
      >
        <div className="flex justify-end gap-3">
          <Button
            buttonStyle="secondary"
            disabled={loggingOut}
            onClick={() => setLogoutOpen(false)}
          >
            취소
          </Button>
          <Button
            buttonStyle="danger"
            disabled={loggingOut}
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
