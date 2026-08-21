import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <SiteLayout authenticated={false} headerVariant="solid" showFooter={false}>
      {children}
    </SiteLayout>
  );
}
