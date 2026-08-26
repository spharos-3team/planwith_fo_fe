"use client";

import { useMeetingCoverSrc } from "@/features/meeting/hooks/useMeetingCoverSrc";

export function MeetingCoverImage({
  alt = "",
  className,
  coverImage,
  meetingUuid,
}: {
  alt?: string;
  className?: string;
  coverImage: string | null | undefined;
  meetingUuid: string;
}) {
  const src = useMeetingCoverSrc(meetingUuid, coverImage);
  if (!src) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={className} src={src} />
  );
}
