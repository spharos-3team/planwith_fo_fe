import type { Metadata } from "next";

import { MeetingDetailPage } from "@/features/meeting/components/MeetingDetailPage";

export const metadata: Metadata = {
  title: "모임상세",
  description: "여행 모임의 소개를 보고 신청하거나 참여하세요.",
};

interface CommunityMeetingDetailRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function CommunityMeetingDetailRoute({
  params,
}: CommunityMeetingDetailRouteProps) {
  const { meetingUuid } = await params;

  return <MeetingDetailPage meetingUuid={meetingUuid} />;
}
