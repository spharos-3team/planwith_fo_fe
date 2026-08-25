import type { Metadata } from "next";

import { MeetingMembersPage } from "@/features/meeting/components/MeetingMembersPage";

export const metadata: Metadata = {
  title: "모임 구성원",
  description: "여행 모임 구성원을 확인하고 관리하세요.",
};

interface MeetingMembersRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function MeetingMembersRoute({
  params,
}: MeetingMembersRouteProps) {
  const { meetingUuid } = await params;

  return <MeetingMembersPage meetingUuid={meetingUuid} />;
}
