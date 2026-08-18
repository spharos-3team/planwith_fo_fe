import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";

interface MainPublicLayoutProps {
  children: ReactNode;
}

export default function MainPublicLayout({
  children,
}: Readonly<MainPublicLayoutProps>) {
  return (
    <SiteLayout
      authenticated={false}
      footerVariant="solid"
      headerVariant="solid"
    >
      {children}
    </SiteLayout>
  );
}
