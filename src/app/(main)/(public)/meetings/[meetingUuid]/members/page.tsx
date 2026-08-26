import { redirect } from "next/navigation";

interface LegacyMeetingMembersRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function LegacyMeetingMembersRoute({
  params,
}: LegacyMeetingMembersRouteProps) {
  const { meetingUuid } = await params;

  redirect(`/community/meeting/${meetingUuid}/members`);
}
