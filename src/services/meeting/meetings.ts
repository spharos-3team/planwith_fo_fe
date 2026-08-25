import type {
  ApplyMeetingPayload,
  ListMeetingsQuery,
  ListMyMeetingsQuery,
  MeetingApplication,
  MeetingDetail,
  MeetingMember,
  MeetingParticipation,
  MyMeetings,
  PagedMeetings,
} from "@/features/meeting/types";
import { apiClient } from "@/utils/apiClient";

function jsonBody(body: unknown): RequestInit {
  return {
    body: JSON.stringify(body),
  };
}

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
      ...jsonBody({ message: payload.message ?? null }),
    }
  );
}

export function leaveMeeting(meetingUuid: string) {
  return apiClient<unknown>(
    `/meetings/${meetingUuid}/members/me`,
    { method: "DELETE" },
    { allowEmpty: true }
  );
}

export function completeMeeting(meetingUuid: string) {
  return apiClient<unknown>(
    `/meetings/${meetingUuid}/complete`,
    { method: "POST", ...jsonBody({}) },
    { allowEmpty: true }
  );
}

export function disbandMeeting(meetingUuid: string) {
  return apiClient<unknown>(
    `/meetings/${meetingUuid}/disband`,
    { method: "POST", ...jsonBody({}) },
    { allowEmpty: true }
  );
}

export function listMeetingMembers(meetingUuid: string) {
  return apiClient<MeetingMember[]>(`/meetings/${meetingUuid}/members`);
}

export function assignViceHost(meetingUuid: string, memberUuid: string) {
  return apiClient<MeetingMember>(`/meetings/${meetingUuid}/vice-host`, {
    method: "PUT",
    ...jsonBody({ memberUuid }),
  });
}

export function clearViceHost(meetingUuid: string) {
  return apiClient<MeetingMember>(
    `/meetings/${meetingUuid}/vice-host`,
    { method: "DELETE" },
    { allowEmpty: true }
  );
}

export function kickMeetingMember(meetingUuid: string, memberUuid: string) {
  return apiClient<MeetingMember>(
    `/meetings/${meetingUuid}/members/${memberUuid}`,
    { method: "DELETE" },
    { allowEmpty: true }
  );
}

export function listMeetingApplications(meetingUuid: string) {
  return apiClient<MeetingApplication[]>(
    `/meetings/${meetingUuid}/applications`
  );
}

export function approveMeetingApplication(
  meetingUuid: string,
  memberUuid: string
) {
  return apiClient<MeetingApplication>(
    `/meetings/${meetingUuid}/applications/${memberUuid}/approve`,
    { method: "POST", ...jsonBody({}) }
  );
}

export function rejectMeetingApplication(
  meetingUuid: string,
  memberUuid: string
) {
  return apiClient<MeetingApplication>(
    `/meetings/${meetingUuid}/applications/${memberUuid}/reject`,
    { method: "POST", ...jsonBody({}) }
  );
}
