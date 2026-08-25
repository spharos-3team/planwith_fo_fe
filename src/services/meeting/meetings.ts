import type {
  ApplyMeetingPayload,
  ListMeetingsQuery,
  ListMyMeetingsQuery,
  MeetingApplication,
  MeetingDetail,
  MeetingParticipation,
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

export function getMeetingDetail(meetingUuid: string) {
  return apiClient<MeetingDetail>(`/meetings/${meetingUuid}`);
}

export function getMeetingParticipation(meetingUuid: string) {
  return apiClient<MeetingParticipation>(
    `/meetings/${meetingUuid}/participation`
  );
}

export function applyToMeeting(
  meetingUuid: string,
  payload: ApplyMeetingPayload = {}
) {
  return apiClient<MeetingApplication>(
    `/meetings/${meetingUuid}/applications`,
    {
      method: "POST",
      body: JSON.stringify({ message: payload.message ?? null }),
    }
  );
}

export function leaveMeeting(meetingUuid: string) {
  return apiClient<unknown>(`/meetings/${meetingUuid}/members/me`, {
    method: "DELETE",
  });
}

export function completeMeeting(meetingUuid: string) {
  return apiClient<unknown>(`/meetings/${meetingUuid}/complete`, {
    method: "POST",
  });
}

export function disbandMeeting(meetingUuid: string) {
  return apiClient<unknown>(`/meetings/${meetingUuid}/disband`, {
    method: "POST",
  });
}
