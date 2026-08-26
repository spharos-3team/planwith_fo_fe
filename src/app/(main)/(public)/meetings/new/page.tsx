import type { Metadata } from "next";

import { MeetingEditorPage } from "@/features/meeting/components/MeetingEditorPage";

export const metadata: Metadata = {
  title: "새 모임 만들기",
  description: "내 일정을 고르고 함께 떠날 모임을 만드세요.",
};

export default function NewMeetingRoutePage() {
  return <MeetingEditorPage mode="create" />;
}
