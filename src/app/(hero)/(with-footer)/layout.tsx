import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";

interface HeroWithFooterLayoutProps {
  children: ReactNode;
}

export default function HeroWithFooterLayout({
  children,
}: Readonly<HeroWithFooterLayoutProps>) {
  return (
    <SiteLayout
      footerVariant="overlay"
      headerVariant="overlay"
      showFooter={false}
    >
      {children}
    </SiteLayout>
  );
}
