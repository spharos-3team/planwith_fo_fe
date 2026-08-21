import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

interface MainAuthenticatedLayoutProps {
  children: ReactNode;
}

export default function MainAuthenticatedLayout({
  children,
}: Readonly<MainAuthenticatedLayoutProps>) {
  return (
    <SiteLayout activeHref="/schedules" headerVariant="solid">
      <AuthGuard>{children}</AuthGuard>
    </SiteLayout>
  );
}
