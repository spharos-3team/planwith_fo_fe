import type { Metadata } from "next";

import { ScheduleEditorPage } from "@/features/schedule/components/ScheduleEditorPage";

export const metadata: Metadata = {
  title: "일정 수정",
  description: "PLAN&WITH 여행 일정 수정",
};

interface EditScheduleRoutePageProps {
  params: Promise<{ scheduleId: string }>;
}

export default async function EditScheduleRoutePage({
  params,
}: EditScheduleRoutePageProps) {
  const { scheduleId } = await params;

  return <ScheduleEditorPage mode="edit" scheduleId={scheduleId} />;
}
