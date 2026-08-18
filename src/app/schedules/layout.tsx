import type { ReactNode } from "react";

import { ScheduleLayout } from "@/components/common/layout/ScheduleLayout";

interface SchedulesLayoutProps {
  children: ReactNode;
}

export default function SchedulesLayout({
  children,
}: Readonly<SchedulesLayoutProps>) {
  return <ScheduleLayout>{children}</ScheduleLayout>;
}
