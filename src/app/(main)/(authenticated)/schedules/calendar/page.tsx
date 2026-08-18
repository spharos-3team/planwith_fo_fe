import type { Metadata } from "next";

import { ScheduleCalendarPage } from "@/features/schedule/components/ScheduleCalendarPage";

export const metadata: Metadata = {
  title: "여행 일정",
  description: "PLAN&WITH AI 여행 일정 캘린더",
};

export default function ScheduleCalendarRoutePage() {
  return <ScheduleCalendarPage />;
}
