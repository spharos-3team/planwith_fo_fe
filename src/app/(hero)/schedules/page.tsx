import type { Metadata } from "next";

import { ScheduleApplicationForm } from "@/features/schedule/components/ScheduleApplicationForm";

export const metadata: Metadata = {
  title: "AI 일정생성",
  description: "PLAN&WITH AI 여행 일정 신청",
};

export default function SchedulesPage() {
  return <ScheduleApplicationForm />;
}
