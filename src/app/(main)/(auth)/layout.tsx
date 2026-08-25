import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <SiteLayout authenticated={false} headerVariant="solid" showFooter={false}>
      <div className="flex min-h-[calc(100dvh-4.75rem)] flex-col bg-surface-default [&>section]:my-auto [&>section]:w-full xl:min-h-[calc(100dvh-5rem)]">
        {children}
      </div>
    </SiteLayout>
  );
}
