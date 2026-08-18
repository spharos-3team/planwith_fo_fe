import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";

interface HeroSchedulesLayoutProps {
  children: ReactNode;
}

export default function HeroSchedulesLayout({
  children,
}: Readonly<HeroSchedulesLayoutProps>) {
  return (
    <SiteLayout
      activeHref="/schedules"
      authenticated={false}
      footerVariant="overlay"
      headerVariant="overlay"
      showFooter={false}
    >
      {children}
    </SiteLayout>
  );
}
