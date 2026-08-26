import type { Metadata } from "next";

import { MeetingEditorPage } from "@/features/meeting/components/MeetingEditorPage";

export const metadata: Metadata = {
  title: "모임 수정",
  description: "모임 소개와 일정, 대표 사진을 수정하세요.",
};

interface EditCommunityMeetingRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function EditCommunityMeetingRoutePage({
  params,
}: EditCommunityMeetingRouteProps) {
  const { meetingUuid } = await params;

  return <MeetingEditorPage meetingUuid={meetingUuid} mode="edit" />;
}
