import type { Metadata } from "next";

import { MeetingsPage } from "@/features/meeting/components/MeetingsPage";

export const metadata: Metadata = {
  title: "모임",
  description: "함께 떠날 여행 모임을 찾고 참여하세요.",
};

export default function MeetingsRoutePage() {
  return <MeetingsPage />;
}
