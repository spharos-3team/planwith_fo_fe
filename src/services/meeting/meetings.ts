import type {
  ListMeetingsQuery,
  ListMyMeetingsQuery,
  MyMeetings,
  PagedMeetings,
} from "@/features/meeting/types";
import { apiClient } from "@/utils/apiClient";

function toSearch(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function listMeetings(query: ListMeetingsQuery = {}) {
  return apiClient<PagedMeetings>(
    `/meetings${toSearch({
      destination: query.destination,
      from: query.from,
      to: query.to,
      status: query.status,
      page: query.page,
      size: query.size,
    })}`
  );
}

export function listMyMeetings(query: ListMyMeetingsQuery) {
  return apiClient<MyMeetings>(
    `/meetings/me${toSearch({
      scope: query.scope,
      status: query.status,
      page: query.page,
      size: query.size,
    })}`
  );
}
