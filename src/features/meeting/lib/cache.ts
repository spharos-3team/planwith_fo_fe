import type { QueryClient } from "@tanstack/react-query";

import type { MeetingListItem, PagedMeetings } from "@/features/meeting/types";

function isPagedMeetings(value: unknown): value is PagedMeetings {
  if (!value || typeof value !== "object" || !("content" in value)) {
    return false;
  }

  return Array.isArray((value as PagedMeetings).content);
}

export function removeMeetingFromCachedLists(
  queryClient: QueryClient,
  meetingUuid: string
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
