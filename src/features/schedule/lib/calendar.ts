import type { BadgeTone } from "@/components/common/Badge";
import type {
  CalendarSchedule,
  ScheduleCategoryId,
  ScheduleCreatorType,
  ScheduleDetail,
} from "@/features/schedule/types";

export const WEEKDAY_LABELS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
] as const;

export const SCHEDULE_COLORS = [
  { swatch: "bg-brand-primary", value: "#387BFF" },
  { swatch: "bg-accent-gold", value: "#E39A2E" },
  { swatch: "bg-accent-ai", value: "#8B5CF6" },
  { swatch: "bg-status-error", value: "#FF4B4B" },
  { swatch: "bg-status-success", value: "#8FD790" },
  { swatch: "bg-footer-bar", value: "#78B7F3" },
] as const;

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function startOfWeekSunday(date: Date): Date {
  return addDays(date, -date.getDay());
}

export function isSameDay(left: Date, right: Date): boolean {
  return isoDate(left) === isoDate(right);
}

export function dateInRange(
  date: Date,
  startDate: string,
  endDate: string
): boolean {
  const key = isoDate(date);
  return key >= startDate && key <= endDate;
}

export function monthGrid(
  year: number,
  month: number
): { date: Date; outside: boolean }[] {
  const first = new Date(year, month, 1);
  const gridStart = startOfWeekSunday(first);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      outside: date.getMonth() !== month,
    };
  });
}

export function queryRangeForMonth(cursor: Date): {
  startDate: string;
  endDate: string;
} {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  return {
    startDate: isoDate(addDays(first, -7)),
    endDate: isoDate(addDays(last, 7)),
  };
}

export function creatorCategory(
  creatorType: ScheduleCreatorType | string | null | undefined
): ScheduleCategoryId {
  switch (creatorType) {
    case "AI":
      return "ai";
    case "OTHER":
      return "shared";
    default:
      return "owned";
  }
}

export function categoryTone(category: ScheduleCategoryId): BadgeTone {
  switch (category) {
    case "ai":
      return "blue";
    case "owned":
      return "green";
    case "shared":
      return "purple";
    case "review":
      return "orange";
  }
}

export function categoryLabel(category: ScheduleCategoryId): string {
  switch (category) {
    case "owned":
      return "본인";
    case "ai":
      return "AI 추천";
    case "shared":
      return "공유";
    case "review":
      return "AI 첨삭";
  }
}

export function scheduleOpenPath(
  scheduleUuid: string,
  creatorType: ScheduleCreatorType | string | null | undefined
): string {
  return creatorCategory(creatorType) === "owned"
    ? `/schedules/${scheduleUuid}/edit`
    : `/schedules/${scheduleUuid}`;
}

export function formatKoreanDate(date: Date): string {
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

export function formatMonthTitle(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function formatWeekTitle(start: Date): string {
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`;
  }
  return `${formatMonthTitle(start)} ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

export function formatTimeRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return "종일";
  }
  return `${startDate.slice(5).replace("-", ".")} – ${endDate.slice(5).replace("-", ".")}`;
}

export function schedulesOnDate(
  schedules: CalendarSchedule[],
  date: Date
): CalendarSchedule[] {
  return schedules.filter((item) =>
    dateInRange(date, item.startDate, item.endDate)
  );
}

export const TIMELINE_START_HOUR = 8;
export const TIMELINE_END_HOUR = 21;
export const TIMELINE_HOURS = Array.from(
  { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 },
  (_, index) => TIMELINE_START_HOUR + index
);

export interface CalendarSlotEvent {
  key: string;
  scheduleUuid: string;
  title: string;
  timeLabel: string;
  hour: number | null;
  category: ScheduleCategoryId;
  calendarColor: string | null;
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function parseScheduleHour(
  value: string | null | undefined
): number | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{1,2})/.exec(value.trim());
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return null;
  }

  if (hour < TIMELINE_START_HOUR) {
    return TIMELINE_START_HOUR;
  }
  if (hour > TIMELINE_END_HOUR) {
    return TIMELINE_END_HOUR;
  }
  return hour;
}

export function formatScheduleClock(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const [hour, minute] = value.trim().split(":");
  if (!hour) {
    return value;
  }

  return `${hour.padStart(2, "0")}:${(minute ?? "00").slice(0, 2).padStart(2, "0")}`;
}

export function dayNumberOnDate(startDate: string, date: Date): number {
  const start = parseIsoDate(startDate);
  return Math.round((date.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function slotEventsForDate(
  schedules: CalendarSchedule[],
  details: ReadonlyMap<string, ScheduleDetail>,
  date: Date,
  loaded: ReadonlySet<string>
): CalendarSlotEvent[] {
  const events: CalendarSlotEvent[] = [];

  schedulesOnDate(schedules, date).forEach((schedule) => {
    if (!loaded.has(schedule.scheduleUuid)) {
      return;
    }

    const items = details.get(schedule.scheduleUuid)?.items ?? [];
    const dayItems = items.filter(
      (item) => item.dayNumber === dayNumberOnDate(schedule.startDate, date)
    );
    const category = creatorCategory(schedule.creatorType);

    if (dayItems.length === 0) {
      events.push({
        key: `${schedule.scheduleUuid}-all-day-${isoDate(date)}`,
        scheduleUuid: schedule.scheduleUuid,
        title: schedule.title,
        timeLabel: "종일",
        hour: null,
        category,
        calendarColor: schedule.calendarColor,
      });
      return;
    }

    dayItems.forEach((item) => {
      const hour = parseScheduleHour(item.scheduleTime);
      events.push({
        key: `${schedule.scheduleUuid}-${item.scheduleItemId}`,
        scheduleUuid: schedule.scheduleUuid,
        title: item.subtitle ?? item.placeName ?? schedule.title,
        timeLabel: formatScheduleClock(item.scheduleTime) || "종일",
        hour,
        category,
        calendarColor: schedule.calendarColor,
      });
    });
  });

  return events;
}

export function eventsInHour(
  events: CalendarSlotEvent[],
  hour: number
): CalendarSlotEvent[] {
  return events.filter((event) => event.hour === hour);
}

export function allDayEvents(events: CalendarSlotEvent[]): CalendarSlotEvent[] {
  return events.filter((event) => event.hour == null);
}

export function colorIndex(calendarColor: string | null | undefined): number {
  if (!calendarColor) {
    return 0;
  }
  const index = SCHEDULE_COLORS.findIndex(
    (color) => color.value.toLowerCase() === calendarColor.toLowerCase()
  );
  return index >= 0 ? index : 0;
}
