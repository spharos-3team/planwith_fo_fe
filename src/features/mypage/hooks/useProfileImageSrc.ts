"use client";

import { useEffect, useState } from "react";

import {
  fetchProfileImageObjectUrl,
  isDisplayableImageUrl,
  profileImageRequestPath,
} from "@/features/mypage/lib/profile-image";

export function useProfileImageSrc(
  memberUuid: string | null | undefined,
  src: string | null | undefined,
  revision?: number | string
): string | null {
  const requestPath = profileImageRequestPath(memberUuid, src);
  const [fetched, setFetched] = useState<{
    path: string;
    revision: number | string | undefined;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (!requestPath) {
      return;
    }

    const uuid = requestPath.split("/")[2];
    if (!uuid) {
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void fetchProfileImageObjectUrl(uuid, revision).then((next) => {
      if (cancelled) {
        if (next?.startsWith("blob:")) {
          URL.revokeObjectURL(next);
        }
        return;
      }
      if (!next) {
        setFetched(null);
        return;
      }
      objectUrl = next.startsWith("blob:") ? next : null;
      setFetched({ path: requestPath, revision, url: next });
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [requestPath, revision]);

  if (isDisplayableImageUrl(src) && src) {
    return src;
  }

  if (
    requestPath &&
    fetched?.path === requestPath &&
    fetched.revision === revision
  ) {
    return fetched.url;
  }

  return null;
}
