import { redirect } from "next/navigation";

interface LegacyEditMeetingRouteProps {
  params: Promise<{ meetingUuid: string }>;
}

export default async function LegacyEditMeetingRoutePage({
  params,
}: LegacyEditMeetingRouteProps) {
  const { meetingUuid } = await params;

  redirect(`/community/meeting/${meetingUuid}/edit`);
}
