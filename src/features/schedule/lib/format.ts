import type {
  ScheduleItemType,
  ScheduleTransportation,
} from "@/features/schedule/types";

export function formatDotDate(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  return iso.replace(/-/g, ".");
}

export function formatSchedulePeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  if (!startDate) {
    return "";
  }

  const start = formatDotDate(startDate);
  if (!endDate || startDate === endDate) {
    return start;
  }

  if (startDate.slice(0, 4) === endDate.slice(0, 4)) {
    return `${start} ~ ${endDate.slice(5).replace("-", ".")}`;
  }

  return `${start} ~ ${formatDotDate(endDate)}`;
}

export function formatDuration(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  if (!startDate || !endDate) {
    return "";
  }

  const start = Date.parse(`${startDate}T00:00:00`);
  const end = Date.parse(`${endDate}T00:00:00`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return "";
  }

  const nights = Math.round((end - start) / 86_400_000);
  if (nights === 0) {
    return "당일";
  }

  return `${nights}박 ${nights + 1}일`;
}

export function formatFigmaDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) {
    return iso;
  }
  return `${year}. ${Number(month)}. ${Number(day)}`;
}

export function formatFigmaPeriod(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): string {
  if (!startDate) {
    return "";
  }

  const start = formatFigmaDate(startDate);
  if (!endDate || startDate === endDate) {
    return start;
  }

  const duration = formatDuration(startDate, endDate);
  const sameYear = startDate.slice(0, 4) === endDate.slice(0, 4);
  const end = sameYear
    ? `${Number(endDate.slice(5, 7))}. ${Number(endDate.slice(8, 10))}`
    : formatFigmaDate(endDate);
  const period = `${start} ~ ${end}`;
  return duration ? `${period} (${duration})` : period;
}

export function formatPeople(headcount: number | null | undefined): string {
  if (!headcount || headcount < 1) {
    return "-";
  }
  return `성인 ${headcount}명`;
}

export function formatCost(amount: number | null | undefined): string {
  if (amount == null || amount < 0) {
    return "-";
  }
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function formatApproxCost(amount: number | null | undefined): string {
  if (amount == null || amount < 0) {
    return "-";
  }
  return `약 ₩${amount.toLocaleString("ko-KR")}`;
}

export function transportationLabel(
  value: ScheduleTransportation | string | null | undefined
): string {
  switch (value) {
    case "TRAIN_PUBLIC_TRANSIT":
      return "대중교통";
    case "SHIP_FERRY":
      return "선박/페리";
    case "RENTAL_CAR":
      return "렌터카";
    case "WALKING":
      return "도보";
    case "OTHER":
      return "기타";
    default:
      return value?.trim() ? value : "-";
  }
}

export function scheduleItemBadge(
  type: ScheduleItemType | string | null | undefined
): string | undefined {
  switch (type) {
    case "MOVE":
      return "이동";
    case "FOOD":
      return "식사";
    case "TOUR":
      return "관광";
    case "STAY":
      return "숙소";
    case "ACTIVITY":
      return "액티비티";
    default:
      return undefined;
  }
}
