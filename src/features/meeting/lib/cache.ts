import type { QueryClient } from "@tanstack/react-query";

import type { MeetingListItem, PagedMeetings } from "@/features/meeting/types";

function isPagedMeetings(value: unknown): value is PagedMeetings {
  if (!value || typeof value !== "object" || !("content" in value)) {
    return false;
  }

  return Array.isArray((value as PagedMeetings).content);
}

function isPublicMeetingListQuery(queryKey: readonly unknown[]): boolean {
  return (
    queryKey[0] === "meetings" &&
    queryKey[1] !== "detail" &&
    queryKey[1] !== "me"
  );
}

export function patchMeetingInCachedLists(
  queryClient: QueryClient,
  meetingUuid: string,
  patch: Partial<MeetingListItem>
): void {
  queryClient.setQueriesData(
    {
      predicate: (query) =>
        query.queryKey[0] === "meetings" && query.queryKey[1] !== "detail",
    },
    (current) => {
      if (!isPagedMeetings(current)) {
        return current;
      }

      let changed = false;
      const content = current.content.map((item: MeetingListItem) => {
        if (item.meetingUuid !== meetingUuid) {
          return item;
        }
        changed = true;
        return { ...item, ...patch };
      });

      return changed ? { ...current, content } : current;
    }
  );
}

export function removeMeetingFromCachedLists(
  queryClient: QueryClient,
  meetingUuid: string,
  scope: "all" | "public" = "all"
): void {
  queryClient.setQueriesData(
    {
      predicate: (query) =>
        scope === "public"
          ? isPublicMeetingListQuery(query.queryKey)
          : query.queryKey[0] === "meetings" && query.queryKey[1] !== "detail",
    },
    (current) => {
      if (!isPagedMeetings(current)) {
        return current;
      }

      const content = current.content.filter(
        (item: MeetingListItem) => item.meetingUuid !== meetingUuid
      );
      if (content.length === current.content.length) {
        return current;
      }

      return {
        ...current,
        content,
        totalElements: Math.max(0, current.totalElements - 1),
      };
    }
  );
}
