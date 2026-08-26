import { Calendar, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/common/Badge";
import { MeetingCoverImage } from "@/features/meeting/components/MeetingCoverImage";
import {
  formatMeetingPeriod,
  meetingStatusLabel,
  meetingStatusTone,
} from "@/features/meeting/lib/format";
import type { MeetingListItem } from "@/features/meeting/types";

interface MeetingGridCardProps {
  meeting: MeetingListItem;
  wide?: boolean;
}

export function MeetingGridCard({
  meeting,
  wide = false,
}: MeetingGridCardProps) {
  const period = formatMeetingPeriod(meeting.startDate, meeting.endDate);

  return (
    <Link
      className={`group flex h-full min-h-[28.5rem] flex-col overflow-hidden rounded-lg bg-white shadow-[0_8px_24px_rgb(15_23_42/0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgb(15_23_42/0.1)] ${
        wide ? "md:col-span-2" : "md:col-span-1"
      }`}
      href={`/meetings/${meeting.meetingUuid}`}
    >
      <div className="relative h-[18.75rem] w-full overflow-hidden bg-blue-ice">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/meetings/hero-background.png')] bg-cover bg-center"
        />
        <MeetingCoverImage
          className="relative z-[1] h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.03]"
          coverImage={meeting.coverImage}
          meetingUuid={meeting.meetingUuid}
        />
        {meeting.status === "RECRUITING" ||
        meeting.status === "FULL" ||
        meeting.status === "COMPLETED" ? (
          <Badge
            className="absolute left-4 top-4"
            size="sm"
            tone={meetingStatusTone(meeting.status)}
            variant="solid"
          >
            {meetingStatusLabel(meeting.status)}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-4 py-3.5">
        <h3 className="text-heading-lg text-text-primary">{meeting.title}</h3>
        <p className="mt-2 line-clamp-1 text-body-sm text-text-secondary">
          {meeting.intro ?? ""}
        </p>
        <p className="mt-auto flex flex-wrap gap-4 pt-5 text-caption text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Users aria-hidden="true" className="size-4" />
            {meeting.currentMemberCount}/{meeting.maxMemberCount}명
          </span>
          {period ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar aria-hidden="true" className="size-4" />
              {period}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
