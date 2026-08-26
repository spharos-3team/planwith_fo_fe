import type {
  AiScheduleGeneratePayload,
  AiScheduleGenerateResult,
  AiScheduleReviseResult,
  AiScheduleSaveResult,
  CalendarSchedule,
  CreateSchedulePayload,
  CreateScheduleResult,
  ScheduleDetail,
  UpdateSchedulePayload,
} from "@/features/schedule/types";
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

function jsonBody(body: unknown): RequestInit {
  return {
    body: JSON.stringify(body),
  };
}

export function listCalendarSchedules(startDate: string, endDate: string) {
  return apiClient<CalendarSchedule[]>(
    `/schedules/calendar${toSearch({ startDate, endDate })}`
  );
}

export function getScheduleDetail(scheduleUuid: string) {
  return apiClient<ScheduleDetail>(`/schedules/${scheduleUuid}`);
}

export function createSchedule(payload: CreateSchedulePayload) {
  return apiClient<CreateScheduleResult>("/schedules", {
    method: "POST",
    ...jsonBody(payload),
  });
}

export function updateSchedule(
  scheduleUuid: string,
  payload: UpdateSchedulePayload
) {
  return apiClient<ScheduleDetail["schedule"]>(`/schedules/${scheduleUuid}`, {
    method: "PATCH",
    ...jsonBody(payload),
  });
}

export function deleteSchedule(scheduleUuid: string) {
  return apiClient<unknown>(
    `/schedules/${scheduleUuid}`,
    { method: "DELETE" },
    { allowEmpty: true }
  );
}

export function reviseScheduleWithAi(
  scheduleUuid: string,
  additionalRequest: string
) {
  return apiClient<AiScheduleReviseResult>(
    `/schedules/${scheduleUuid}/ai/revise`,
    {
      method: "POST",
      ...jsonBody({ additionalRequest: additionalRequest.slice(0, 2000) }),
    }
  );
}

export function generateAiSchedule(payload: AiScheduleGeneratePayload) {
  return apiClient<AiScheduleGenerateResult>("/schedules/ai/generate", {
    method: "POST",
    ...jsonBody(payload),
  });
}

export function regenerateAiSchedule(payload: AiScheduleGeneratePayload) {
  return apiClient<AiScheduleGenerateResult>("/schedules/ai/regenerate", {
    method: "POST",
    ...jsonBody(payload),
  });
}

export function saveAiSchedule(payload: {
  title: string;
  destination: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  estimatedBudget: number;
  transportation?: string | null;
  travelStyle?: string | null;
  content?: string | null;
  calendarColor?: string;
  items: AiScheduleGenerateResult["items"];
}) {
  return apiClient<AiScheduleSaveResult>("/schedules/ai/save", {
    method: "POST",
    ...jsonBody({
      title: payload.title,
      destination: payload.destination,
      imageUrl: payload.imageUrl,
      startDate: payload.startDate,
      endDate: payload.endDate,
      participantCount: payload.participantCount,
      estimatedBudget: payload.estimatedBudget,
      transportation: payload.transportation,
      travelStyle: payload.travelStyle,
      content: payload.content,
      calendarColor: payload.calendarColor,
      items: payload.items,
    }),
  });
}
