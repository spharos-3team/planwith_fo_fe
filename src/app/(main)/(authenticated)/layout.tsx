import type { ReactNode } from "react";

import { SiteLayout } from "@/components/common/layout/SiteLayout";

interface MainAuthenticatedLayoutProps {
  children: ReactNode;
}

export default function MainAuthenticatedLayout({
  children,
}: Readonly<MainAuthenticatedLayoutProps>) {
  return (
    <SiteLayout activeHref="/schedules" authenticated headerVariant="solid">
      {children}
    </SiteLayout>
  );
}
