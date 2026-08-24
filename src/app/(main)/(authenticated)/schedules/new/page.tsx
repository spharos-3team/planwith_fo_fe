import type { Metadata } from "next";

import { ScheduleEditorPage } from "@/features/schedule/components/ScheduleEditorPage";

export const metadata: Metadata = {
  title: "일정 직접 만들기",
  description: "PLAN&WITH 여행 일정 직접 생성",
};

export default function NewSchedulePage() {
  return <ScheduleEditorPage mode="create" />;
}
