"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

interface MainAuthenticatedLayoutProps {
  children: ReactNode;
}

export default function MainAuthenticatedLayout({
  children,
}: Readonly<MainAuthenticatedLayoutProps>) {
  const pathname = usePathname();
  const activeHref = pathname.startsWith("/mypage")
    ? "/mypage"
    : pathname.startsWith("/chat")
      ? "/chat"
      : pathname.startsWith("/community")
        ? "/community"
        : "/schedules";

  return (
    <SiteLayout
      activeHref={activeHref}
      headerVariant="solid"
      showFooter={!pathname.startsWith("/chat")}
    >
      <AuthGuard>{children}</AuthGuard>
    </SiteLayout>
  );
}
