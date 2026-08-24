export type DatePreset =
  | "all"
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "withinWeek"
  | "withinMonth"
  | "within3Months"
  | "custom";

export interface DateRange {
  from: string;
  to: string;
}

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "전체 날짜" },
  { value: "today", label: "오늘" },
  { value: "thisWeek", label: "이번 주" },
  { value: "thisMonth", label: "이번 달" },
  { value: "withinWeek", label: "1주일 이내" },
  { value: "withinMonth", label: "1개월 이내" },
  { value: "within3Months", label: "3개월 이내" },
  { value: "custom", label: "직접 입력" },
];

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function addCalendarMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function startOfWeekMonday(date: Date): Date {
  const day = date.getDay();
  const offset = day === 0 ? 6 : day - 1;
  return addDays(date, -offset);
}

export function rangeForPreset(
  preset: DatePreset,
  custom: DateRange = { from: "", to: "" }
): DateRange {
  const today = startOfToday();

  switch (preset) {
    case "all":
      return { from: "", to: "" };
    case "today":
      return { from: isoDate(today), to: isoDate(today) };
    case "thisWeek": {
      const start = startOfWeekMonday(today);
      return { from: isoDate(start), to: isoDate(addDays(start, 6)) };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: isoDate(start), to: isoDate(end) };
    }
    case "withinWeek":
      return { from: isoDate(today), to: isoDate(addDays(today, 6)) };
    case "withinMonth":
      return { from: isoDate(today), to: isoDate(addCalendarMonths(today, 1)) };
    case "within3Months":
      return { from: isoDate(today), to: isoDate(addCalendarMonths(today, 3)) };
    case "custom":
      return custom;
    default:
      return { from: "", to: "" };
  }
}

export function presetLabel(preset: DatePreset): string {
  return (
    DATE_PRESET_OPTIONS.find((option) => option.value === preset)?.label ??
    "날짜 선택"
  );
}
