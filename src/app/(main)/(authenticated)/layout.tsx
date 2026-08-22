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
  const activeHref = pathname.startsWith("/mypage") ? "/mypage" : "/schedules";

  return (
    <SiteLayout activeHref={activeHref} headerVariant="solid">
      <AuthGuard>{children}</AuthGuard>
    </SiteLayout>
  );
}
