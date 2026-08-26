"use client";

import { useEffect, useState } from "react";

import {
  fetchMeetingCoverObjectUrl,
  isDirectCoverUrl,
  meetingCoverRequestPath,
  rememberedMeetingCover,
} from "@/features/meeting/lib/cover-src";

export function useMeetingCoverSrc(
  meetingUuid: string,
  coverImage: string | null | undefined
): string | null {
  const requestPath = meetingCoverRequestPath(meetingUuid, coverImage);
  const remembered = rememberedMeetingCover(meetingUuid);
  const [fetched, setFetched] = useState<{
    path: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (!requestPath) {
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void fetchMeetingCoverObjectUrl(meetingUuid).then((next) => {
      if (cancelled) {
        if (next?.startsWith("blob:")) {
          URL.revokeObjectURL(next);
        }
        return;
      }
      if (!next) {
        return;
      }
      objectUrl = next.startsWith("blob:") ? next : null;
      setFetched({ path: requestPath, url: next });
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [meetingUuid, requestPath]);

  if (isDirectCoverUrl(coverImage) && coverImage) {
    return coverImage;
  }

  if (requestPath && fetched?.path === requestPath) {
    return fetched.url;
  }

  return remembered;
}
