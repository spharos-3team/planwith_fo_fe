"use client";

import { useEffect, useState } from "react";

import {
  chatFileRequestPath,
  fetchChatFileObjectUrl,
  isDirectChatFileUrl,
} from "@/features/chat/lib/file-src";

export function useChatFileSrc(url: string | null | undefined): string | null {
  const requestPath = chatFileRequestPath(url);
  const [fetched, setFetched] = useState<{ path: string; url: string } | null>(
    null
  );

  useEffect(() => {
    if (!url) {
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void fetchChatFileObjectUrl(url).then((next) => {
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
      setFetched({ path: requestPath ?? url, url: next });
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [requestPath, url]);

  if (isDirectChatFileUrl(url) && !requestPath && url) {
    return url;
  }

  if (fetched && (fetched.path === requestPath || fetched.path === url)) {
    return fetched.url;
  }

  return null;
}
