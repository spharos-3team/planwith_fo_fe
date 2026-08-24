import type { MeetingStatus } from "@/features/meeting/types";

export function formatMeetingPeriod(
  startDate: string | null,
  endDate: string | null
): string {
  if (!startDate) {
    return "";
  }

  const start = toDotDate(startDate);

  if (!endDate) {
    return start;
  }

  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);

  if (startYear === endYear) {
    return `${start} ~ ${endDate.slice(5).replace("-", ".")}`;
  }

  return `${start} ~ ${toDotDate(endDate)}`;
}

export function meetingStatusLabel(status: MeetingStatus | string): string {
  switch (status) {
    case "RECRUITING":
      return "모집중";
    case "FULL":
      return "모집완료";
    case "COMPLETED":
      return "완료";
    default:
      return status;
  }
}

export function meetingStatusTone(
  status: MeetingStatus | string
): "blue" | "gray" | "green" {
  switch (status) {
    case "RECRUITING":
      return "blue";
    case "FULL":
      return "gray";
    case "COMPLETED":
      return "green";
    default:
      return "gray";
  }
}

export function isHttpUrl(value: string | null): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function toDotDate(isoDate: string): string {
  return isoDate.replace(/-/g, ".");
}
