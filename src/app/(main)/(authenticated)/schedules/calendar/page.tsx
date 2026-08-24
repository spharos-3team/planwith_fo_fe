import type { Metadata } from "next";

import {
  type CalendarView,
  ScheduleCalendarPage,
} from "@/features/schedule/components/ScheduleCalendarPage";

export const metadata: Metadata = {
  title: "여행 일정",
  description: "PLAN&WITH AI 여행 일정 캘린더",
};

interface ScheduleCalendarRoutePageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function ScheduleCalendarRoutePage({
  searchParams,
}: ScheduleCalendarRoutePageProps) {
  const { view } = await searchParams;
  const initialView: CalendarView =
    view === "week" || view === "month" ? view : "day";

  return <ScheduleCalendarPage initialView={initialView} />;
}
