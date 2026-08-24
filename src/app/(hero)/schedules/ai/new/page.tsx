import type { Metadata } from "next";

import { ScheduleApplicationForm } from "@/features/schedule/components/ScheduleApplicationForm";

export const metadata: Metadata = {
  title: "AI 일정 정보 입력",
  description: "PLAN&WITH AI 여행 일정 신청 정보 입력",
};

export default function NewAiSchedulePage() {
  return <ScheduleApplicationForm />;
}
