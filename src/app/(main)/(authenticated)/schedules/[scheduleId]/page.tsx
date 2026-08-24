import type { Metadata } from "next";

import { ScheduleDetailPage } from "@/features/schedule/components/ScheduleDetailPage";

export const metadata: Metadata = {
  title: "일정 상세",
  description: "PLAN&WITH 여행 일정 상세",
};

interface ScheduleDetailRoutePageProps {
  params: Promise<{ scheduleId: string }>;
}

export default async function ScheduleDetailRoutePage({
  params,
}: ScheduleDetailRoutePageProps) {
  const { scheduleId } = await params;

  return <ScheduleDetailPage scheduleId={scheduleId} />;
}
