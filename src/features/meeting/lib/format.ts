import type { MeetingRole, MeetingStatus } from "@/features/meeting/types";

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
      return "모집 중단";
    case "COMPLETED":
      return "모집 완료";
    case "DISBANDED":
      return "모임 해체";
    default:
      return status;
  }
}

export function meetingStatusTone(
  status: MeetingStatus | string
): "blue" | "orange" | "green" | "gray" {
  switch (status) {
    case "RECRUITING":
      return "blue";
    case "FULL":
      return "orange";
    case "COMPLETED":
      return "green";
    default:
      return "gray";
  }
}

export function isHttpUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function meetingRoleLabel(role: MeetingRole | string): string {
  switch (role) {
    case "HOST":
      return "방장";
    case "VICE_HOST":
      return "부방장";
    case "MEMBER":
      return "멤버";
    default:
      return role;
  }
}

export function meetingRoleTone(
  role: MeetingRole | string
): "orange" | "blue" | "gray" {
  switch (role) {
    case "HOST":
      return "orange";
    case "VICE_HOST":
      return "blue";
    default:
      return "gray";
  }
}

export const MY_MEETING_STATUS_ORDER: MeetingStatus[] = [
  "RECRUITING",
  "FULL",
  "COMPLETED",
];

export function canBumpByGrade(grade: string | null | undefined): boolean {
  return grade === "ADVENTURE" || grade === "PLANWITH";
}

export function groupMeetingsByStatus<
  T extends { status: MeetingStatus | string },
>(items: T[]): { status: MeetingStatus | string; items: T[] }[] {
  const groups: { status: MeetingStatus | string; items: T[] }[] =
    MY_MEETING_STATUS_ORDER.map((status) => ({
      status,
      items: items.filter((item) => item.status === status),
    })).filter((group) => group.items.length > 0);

  const known = new Set<string>(MY_MEETING_STATUS_ORDER);
  const rest = items.filter((item) => !known.has(item.status));

  if (rest.length > 0) {
    groups.push({ status: rest[0].status, items: rest });
  }

  return groups;
}

function toDotDate(isoDate: string): string {
  return isoDate.replace(/-/g, ".");
}
