import { redirect } from "next/navigation";

interface LegacyMeetingDetailRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function LegacyMeetingDetailRoute({
  params,
}: LegacyMeetingDetailRouteProps) {
  const { meetingUuid } = await params;

  redirect(`/community/meeting/${meetingUuid}`);
}
