import type { Metadata } from "next";

import { MeetingMembersPage } from "@/features/meeting/components/MeetingMembersPage";

export const metadata: Metadata = {
  title: "모임 구성원",
  description: "여행 모임 구성원을 확인하고 관리하세요.",
};

interface CommunityMeetingMembersRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function CommunityMeetingMembersRoute({
  params,
}: CommunityMeetingMembersRouteProps) {
  const { meetingUuid } = await params;

  return <MeetingMembersPage meetingUuid={meetingUuid} />;
}
