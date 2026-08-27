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

interface MyMeetingRowProps {
  meeting: MeetingListItem;
  actionLabel?: string;
  actionHref?: string;
  badgeLabel?: string;
}

export function MyMeetingRow({
  meeting,
  actionLabel,
  actionHref,
  badgeLabel,
}: MyMeetingRowProps) {
  const period = formatMeetingPeriod(meeting.startDate, meeting.endDate);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line-light bg-surface-default sm:flex-row">
      <Link
        className="relative h-48 w-full shrink-0 bg-blue-ice sm:h-[12.5rem] sm:w-[18.75rem]"
        href={`/community/meeting/${meeting.meetingUuid}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/images/meetings/hero-background.png')] bg-cover bg-center"
        />
        <MeetingCoverImage
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          coverImage={meeting.coverImage}
          meetingUuid={meeting.meetingUuid}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="min-w-0"
          href={`/community/meeting/${meeting.meetingUuid}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              size="sm"
              tone={badgeLabel ? "purple" : meetingStatusTone(meeting.status)}
            >
              {badgeLabel ?? meetingStatusLabel(meeting.status)}
            </Badge>
            <h3 className="text-heading-lg text-text-primary">
              {meeting.title}
            </h3>
          </div>
          <p className="mt-2 line-clamp-1 text-body-sm text-text-secondary">
            {meeting.intro ?? ""}
          </p>
          <p className="mt-2 flex flex-wrap gap-4 text-caption text-text-secondary">
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
        </Link>
        {actionLabel && actionHref ? (
          <Link
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand-primary px-5 text-body-md font-bold text-text-inverse transition hover:bg-brand-primary-hover"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
