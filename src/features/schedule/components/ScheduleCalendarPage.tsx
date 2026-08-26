"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Plus,
  Train,
  Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge, type BadgeTone } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { SelectField } from "@/components/common/SelectField";
import { StatusMessage } from "@/components/common/StatusMessage";
import {
  addDays,
  allDayEvents,
  type CalendarSlotEvent,
  categoryLabel,
  categoryTone,
  creatorCategory,
  eventsInHour,
  formatHourLabel,
  formatKoreanDate,
  formatMonthTitle,
  formatTimeRange,
  formatWeekTitle,
  isoDate,
  monthGrid,
  queryRangeForMonth,
  scheduleOpenPath,
  schedulesOnDate,
  slotEventsForDate,
  startOfToday,
  startOfWeekSunday,
  TIMELINE_HOURS,
  WEEKDAY_LABELS,
} from "@/features/schedule/lib/calendar";
import {
  formatCost,
  formatPeople,
  formatSchedulePeriod,
  transportationLabel,
} from "@/features/schedule/lib/format";
import type {
  CalendarSchedule,
  ScheduleCategoryId,
  ScheduleDetail,
} from "@/features/schedule/types";
import { useApiError } from "@/hooks/useApiError";
import {
  getScheduleDetail,
  listCalendarSchedules,
} from "@/services/schedule/schedules";

export type CalendarView = "day" | "week" | "month";

interface ScheduleCalendarPageProps {
  initialView?: CalendarView;
}

const categoryItems = [
  { id: "owned", label: "본인 생성", tone: "green" },
  { id: "ai", label: "AI 일정 생성", tone: "blue" },
  { id: "shared", label: "공유 받은 일정", tone: "purple" },
  { id: "review", label: "AI 첨삭", tone: "orange" },
] as const satisfies ReadonlyArray<{
  id: ScheduleCategoryId;
  label: string;
  tone: BadgeTone;
}>;

const viewOptions = [
  { value: "day", label: "일별" },
  { value: "week", label: "주별" },
  { value: "month", label: "월별" },
];

const toneSurfaceClasses: Record<BadgeTone, string> = {
  blue: "border-brand-primary bg-badge-blue-bg text-badge-blue-fg",
  green: "border-status-success bg-badge-green-bg text-badge-green-fg",
  purple: "border-accent-ai bg-badge-purple-bg text-badge-purple-fg",
  orange: "border-accent-gold bg-badge-orange-bg text-badge-orange-fg",
  gray: "border-line-default bg-badge-gray-bg text-badge-gray-fg",
};

function ScheduleHero() {
  return (
    <section className="relative h-[clamp(260px,26vw,500px)] overflow-hidden">
      <Image
        alt="야자수가 펼쳐진 바다와 해변"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/images/schedules/calendar-hero.png"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
      <ContentContainer className="absolute inset-x-0 bottom-[16%]">
        <h1 className="text-[clamp(2.25rem,3vw,3.5rem)] font-medium text-text-inverse">
          CALENDAR
        </h1>
        <p className="mt-2 text-body-sm text-white/90">
          손 쉬운 주별부터 AI 자동 계획까지 한번에
        </p>
      </ContentContainer>
    </section>
  );
}

function MiniCalendar({
  cursor,
  onSelect,
}: {
  cursor: Date;
  onSelect: (date: Date) => void;
}) {
  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const today = startOfToday();

  return (
    <section aria-label="미니 캘린더" className="rounded-lg bg-surface-default">
      <div className="flex items-center justify-between">
        <h2 className="text-body-md font-semibold text-text-primary">
          {formatMonthTitle(cursor)}
        </h2>
        <div className="flex gap-2">
          <button
            aria-label="이전 달"
            className="grid size-8 place-items-center rounded-circle border border-line-light text-text-secondary hover:bg-surface-page"
            onClick={() =>
              onSelect(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            aria-label="다음 달"
            className="grid size-8 place-items-center rounded-circle border border-line-light text-text-secondary hover:bg-surface-page"
            onClick={() =>
              onSelect(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            type="button"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 text-center text-caption-sm text-text-disabled">
        {WEEKDAY_LABELS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center text-caption text-text-primary">
        {cells.map((cell) => {
          const selected = isoDate(cell.date) === isoDate(cursor);
          const isToday = isoDate(cell.date) === isoDate(today);
          return (
            <button
              className={`mx-auto grid size-7 place-items-center rounded-circle ${
                selected
                  ? "bg-blue-ice font-bold text-brand-primary"
                  : cell.outside
                    ? "text-text-disabled"
                    : cell.date.getDay() === 0
                      ? "text-status-error"
                      : ""
              } ${isToday && !selected ? "ring-1 ring-brand-primary/40" : ""}`}
              key={isoDate(cell.date)}
              onClick={() => onSelect(cell.date)}
              type="button"
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CategoryFilter({
  selected,
  onChange,
}: {
  selected: ScheduleCategoryId[];
  onChange: (ids: ScheduleCategoryId[]) => void;
}) {
  const allSelected = selected.length === categoryItems.length;
  const toggle = (id: ScheduleCategoryId) => {
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );
  };

  return (
    <section className="rounded-lg border border-line-light bg-surface-default p-6">
      <h2 className="text-heading-sm text-text-primary">카테고리</h2>
      <div className="mt-5 grid gap-4">
        <label className="flex cursor-pointer items-center gap-3 text-body-sm text-text-secondary">
          <input
            checked={allSelected}
            className="size-4 accent-brand-primary"
            onChange={() =>
              onChange(allSelected ? [] : categoryItems.map((item) => item.id))
            }
            type="checkbox"
          />
          전체 선택
        </label>
        {categoryItems.map((item) => (
          <label
            className="flex cursor-pointer items-center gap-3 text-body-sm text-text-secondary"
            key={item.id}
          >
            <input
              checked={selected.includes(item.id)}
              className="size-4 accent-brand-primary"
              onChange={() => toggle(item.id)}
              type="checkbox"
            />
            <Badge tone={item.tone} variant="dot" />
            {item.label}
          </label>
        ))}
      </div>
    </section>
  );
}

function TimelineEvent({
  event,
  selected,
  onSelect,
  compact = false,
}: {
  event: CalendarSchedule;
  selected: boolean;
  onSelect: (scheduleUuid: string) => void;
  compact?: boolean;
}) {
  const category = creatorCategory(event.creatorType);
  const tone = categoryTone(category);
  const color = event.calendarColor?.startsWith("#")
    ? event.calendarColor
    : undefined;

  return (
    <button
      className={`w-full border-l-4 text-left transition hover:brightness-95 ${
        compact ? "px-2 py-1" : "px-4 py-3"
      } ${toneSurfaceClasses[tone]} ${
        selected ? "ring-2 ring-brand-primary/40" : ""
      }`}
      onClick={() => onSelect(event.scheduleUuid)}
      style={color ? { borderLeftColor: color } : undefined}
      type="button"
    >
      {compact ? (
        <span className="block truncate text-caption-sm font-semibold">
          {event.title}
        </span>
      ) : (
        <>
          <span className="block text-caption-sm">
            {formatTimeRange(event.startDate, event.endDate)}
          </span>
          <span className="mt-1 block text-body-sm font-semibold">
            {event.title}
          </span>
        </>
      )}
    </button>
  );
}

function SlotEventCard({
  event,
  selected,
  compact = false,
  onSelect,
}: {
  event: CalendarSlotEvent;
  selected: boolean;
  compact?: boolean;
  onSelect: (scheduleUuid: string) => void;
}) {
  const tone = categoryTone(event.category);
  const color = event.calendarColor?.startsWith("#")
    ? event.calendarColor
    : undefined;

  return (
    <button
      className={`w-full min-w-0 border-l-4 text-left transition hover:brightness-95 ${
        compact ? "px-1.5 py-1" : "px-3 py-2"
      } ${toneSurfaceClasses[tone]} ${
        selected ? "ring-2 ring-brand-primary/40" : ""
      }`}
      onClick={() => onSelect(event.scheduleUuid)}
      style={color ? { borderLeftColor: color } : undefined}
      type="button"
    >
      {compact ? null : (
        <span className="block text-caption-sm">{event.timeLabel}</span>
      )}
      <span
        className={`block truncate font-semibold ${
          compact ? "text-caption-sm" : "mt-0.5 text-body-sm"
        }`}
      >
        {event.title}
      </span>
    </button>
  );
}

function DayCalendar({
  date,
  slotEvents,
  selectedUuid,
  onSelect,
}: {
  date: Date;
  slotEvents: CalendarSlotEvent[];
  selectedUuid: string | null;
  onSelect: (scheduleUuid: string) => void;
}) {
  const allDay = allDayEvents(slotEvents);

  return (
    <div className="overflow-hidden rounded-lg border border-line-light bg-surface-default">
      <div className="grid grid-cols-[72px_minmax(0,1fr)] border-b border-line-light bg-surface-page px-0">
        <p className="px-3 py-3 text-caption-sm text-text-disabled">
          {isoDate(date).slice(5).replace("-", ".")}
        </p>
        <p className="self-center pr-3 text-caption text-text-secondary">
          시간대별 일정
        </p>
      </div>
      {allDay.length > 0 ? (
        <div className="grid grid-cols-[72px_minmax(0,1fr)] border-b border-line-light">
          <p className="px-3 py-3 text-caption-sm text-text-disabled">종일</p>
          <div className="grid gap-1 p-2">
            {allDay.map((event) => (
              <SlotEventCard
                event={event}
                key={event.key}
                onSelect={onSelect}
                selected={event.scheduleUuid === selectedUuid}
              />
            ))}
          </div>
        </div>
      ) : null}
      {TIMELINE_HOURS.map((hour) => {
        const hourEvents = eventsInHour(slotEvents, hour);
        return (
          <div
            className="grid min-h-[62px] grid-cols-[72px_minmax(0,1fr)]"
            key={hour}
          >
            <time className="border-r border-line-light px-3 pt-2 text-caption-sm text-text-disabled">
              {formatHourLabel(hour)}
            </time>
            <div className="grid content-start gap-1 border-b border-line-light p-1">
              {hourEvents.map((event) => (
                <SlotEventCard
                  event={event}
                  key={event.key}
                  onSelect={onSelect}
                  selected={event.scheduleUuid === selectedUuid}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekCalendar({
  start,
  eventsByDate,
  selectedUuid,
  onSelect,
}: {
  start: Date;
  eventsByDate: ReadonlyMap<string, CalendarSlotEvent[]>;
  selectedUuid: string | null;
  onSelect: (scheduleUuid: string) => void;
}) {
  const dates = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const today = startOfToday();

  return (
    <div className="max-h-[720px] overflow-auto rounded-lg border border-line-light bg-surface-default">
      <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
        <div className="sticky top-0 z-10 border-b border-r border-line-light bg-surface-default" />
        {dates.map((date) => (
          <div
            className={`sticky top-0 z-10 border-b border-r border-line-light bg-surface-default px-2 py-3 text-center text-body-sm ${
              isoDate(date) === isoDate(today)
                ? "font-semibold text-brand-primary"
                : ""
            }`}
            key={isoDate(date)}
          >
            <span className="block text-caption-sm text-text-disabled">
              {WEEKDAY_LABELS[date.getDay()]}
            </span>
            {date.getMonth() + 1}/{date.getDate()}
          </div>
        ))}
        <time className="border-b border-r border-line-light px-2 py-2 text-caption-sm text-text-disabled">
          종일
        </time>
        {dates.map((date) => {
          const dayEvents = allDayEvents(eventsByDate.get(isoDate(date)) ?? []);
          return (
            <div
              className="min-h-16 min-w-0 border-b border-r border-line-light p-1"
              key={`all-day-${isoDate(date)}`}
            >
              <div className="grid gap-1">
                {dayEvents.map((event) => (
                  <SlotEventCard
                    compact
                    event={event}
                    key={event.key}
                    onSelect={onSelect}
                    selected={event.scheduleUuid === selectedUuid}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {TIMELINE_HOURS.map((hour) => (
          <div className="contents" key={hour}>
            <time className="border-b border-r border-line-light px-2 py-2 text-caption-sm text-text-disabled">
              {formatHourLabel(hour)}
            </time>
            {dates.map((date) => {
              const hourEvents = eventsInHour(
                eventsByDate.get(isoDate(date)) ?? [],
                hour
              );
              return (
                <div
                  className="min-h-[52px] min-w-0 border-b border-r border-line-light p-0.5"
                  key={`${isoDate(date)}-${hour}`}
                >
                  <div className="grid gap-0.5">
                    {hourEvents.map((event) => (
                      <SlotEventCard
                        compact
                        event={event}
                        key={event.key}
                        onSelect={onSelect}
                        selected={event.scheduleUuid === selectedUuid}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthCalendar({
  cursor,
  events,
  selectedUuid,
  onSelectDate,
  onSelectEvent,
}: {
  cursor: Date;
  events: CalendarSchedule[];
  selectedUuid: string | null;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (scheduleUuid: string) => void;
}) {
  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());

  return (
    <div className="overflow-hidden rounded-lg border border-line-light bg-surface-default">
      <div className="grid w-full grid-cols-7">
        {WEEKDAY_LABELS.map((day) => (
          <div
            className="border-b border-r border-line-light px-3 py-3 text-center text-body-sm font-semibold text-text-secondary"
            key={day}
          >
            {day}
          </div>
        ))}
        {cells.map((cell) => {
          const dayEvents = schedulesOnDate(events, cell.date);
          const selected = isoDate(cell.date) === isoDate(cursor);
          const isToday = isoDate(cell.date) === isoDate(startOfToday());
          return (
            <div
              className={`min-h-32 min-w-0 border-b border-r border-line-light p-2 text-left ${
                cell.outside ? "bg-surface-page/60" : ""
              }`}
              key={isoDate(cell.date)}
            >
              <button
                className={`grid size-7 place-items-center rounded-circle text-caption ${
                  selected
                    ? "bg-blue-ice font-bold text-brand-primary"
                    : cell.outside
                      ? "text-text-disabled"
                      : "text-text-secondary"
                } ${isToday && !selected ? "ring-1 ring-brand-primary/40" : ""}`}
                onClick={() => onSelectDate(cell.date)}
                type="button"
              >
                {cell.date.getDate()}
              </button>
              <div className="mt-2 grid gap-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <TimelineEvent
                    compact
                    event={event}
                    key={event.scheduleUuid}
                    onSelect={onSelectEvent}
                    selected={event.scheduleUuid === selectedUuid}
                  />
                ))}
                {dayEvents.length > 2 ? (
                  <span className="text-caption-sm text-text-disabled">
                    +{dayEvents.length - 2}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchedulePreview({
  schedule,
  onDetail,
}: {
  schedule: CalendarSchedule;
  onDetail: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: ["schedules", schedule.scheduleUuid],
    queryFn: () => getScheduleDetail(schedule.scheduleUuid),
  });
  const record = detailQuery.data?.schedule;
  const items = detailQuery.data?.items ?? [];
  const category = creatorCategory(record?.creatorType ?? schedule.creatorType);

  return (
    <aside className="rounded-lg bg-surface-default">
      <div className="flex items-center justify-between">
        <Badge tone={categoryTone(category)} variant="solid">
          {categoryLabel(category)}
        </Badge>
        <button
          className="text-caption text-text-secondary underline-offset-4 hover:underline"
          onClick={onDetail}
          type="button"
        >
          {category === "owned" ? "일정 수정하기" : "일정 상세보기"}
        </button>
      </div>
      <h2 className="mt-7 text-heading-md text-text-primary">
        {record?.title ?? schedule.title}
      </h2>
      <p className="mt-2 text-caption text-text-disabled">
        {formatKoreanDate(new Date(`${schedule.startDate}T00:00:00`))}
      </p>

      <dl className="mt-6 grid gap-3 rounded-md border border-line-light p-4 text-caption">
        {[
          [MapPin, "여행 목적지", record?.destination ?? "-"],
          [
            CalendarDays,
            "여행 기간",
            formatSchedulePeriod(
              record?.startDate ?? schedule.startDate,
              record?.endDate ?? schedule.endDate
            ),
          ],
          [Users, "인원수", formatPeople(record?.headcount)],
          [CreditCard, "예상 비용", formatCost(record?.expectedCost)],
          [Train, "이동 수단", transportationLabel(record?.transportation)],
        ].map(([Icon, label, value]) => (
          <div className="flex items-center gap-2" key={label as string}>
            <Icon
              aria-hidden="true"
              className="h-3.5 w-3.5 text-text-disabled"
            />
            <dt className="text-text-secondary">{label as string}</dt>
            <dd className="ml-auto text-right text-text-primary">
              {value as string}
            </dd>
          </div>
        ))}
      </dl>

      {category !== "owned" ? (
        <div className="mt-7">
          <h3 className="text-body-sm font-semibold text-text-primary">
            타임라인
          </h3>
          {detailQuery.isLoading ? (
            <p className="mt-4 text-caption text-text-disabled">
              일정을 불러오는 중입니다.
            </p>
          ) : items.length > 0 ? (
            <ol className="mt-4 border-l-2 border-blue-ice pl-5">
              {items.slice(0, 4).map((item) => (
                <li className="relative pb-5" key={item.scheduleItemId}>
                  <span className="absolute -left-[1.55rem] top-1 size-2.5 rounded-circle bg-brand-primary" />
                  <time className="text-caption text-text-disabled">
                    {item.scheduleTime ?? `DAY ${item.dayNumber}`}
                  </time>
                  <p className="mt-1 text-body-sm font-semibold text-text-primary">
                    {item.subtitle ?? item.placeName ?? "일정"}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-body-sm text-text-secondary">
              {record?.content?.trim() || "등록된 타임라인이 없습니다."}
            </p>
          )}
        </div>
      ) : null}
    </aside>
  );
}

export function ScheduleCalendarPage({
  initialView = "day",
}: ScheduleCalendarPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<CalendarView>(initialView);
  const [cursor, setCursor] = useState(startOfToday);
  const [activeCategories, setActiveCategories] = useState<
    ScheduleCategoryId[]
  >(() => categoryItems.map((item) => item.id));
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  const range = useMemo(() => queryRangeForMonth(cursor), [cursor]);
  const weekStart = startOfWeekSunday(cursor);

  const schedulesQuery = useQuery({
    queryKey: ["schedules", "calendar", range.startDate, range.endDate],
    queryFn: () => listCalendarSchedules(range.startDate, range.endDate),
  });
  const schedulesError = useApiError(schedulesQuery.error);

  const visibleEvents = useMemo(() => {
    const items = schedulesQuery.data ?? [];
    return items.filter((item) =>
      activeCategories.includes(creatorCategory(item.creatorType))
    );
  }, [activeCategories, schedulesQuery.data]);

  const showTimeline = view === "day" || view === "week";
  const detailQueries = useQueries({
    queries: visibleEvents.map((event) => ({
      queryKey: ["schedules", event.scheduleUuid],
      queryFn: () => getScheduleDetail(event.scheduleUuid),
      enabled: showTimeline,
    })),
  });

  const detailsByUuid = new Map<string, ScheduleDetail>();
  const loadedUuids = new Set<string>();
  visibleEvents.forEach((event, index) => {
    const query = detailQueries[index];
    if (query?.data) {
      detailsByUuid.set(event.scheduleUuid, query.data);
    }
    if (query?.isSuccess || query?.isError) {
      loadedUuids.add(event.scheduleUuid);
    }
  });

  const daySlotEvents = slotEventsForDate(
    visibleEvents,
    detailsByUuid,
    cursor,
    loadedUuids
  );
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index)
  );
  const weekEventsByDate = new Map(
    weekDates.map((date) => [
      isoDate(date),
      slotEventsForDate(visibleEvents, detailsByUuid, date, loadedUuids),
    ])
  );

  const selected =
    visibleEvents.find((item) => item.scheduleUuid === selectedUuid) ??
    visibleEvents[0] ??
    null;

  const heading =
    view === "month"
      ? formatMonthTitle(cursor)
      : view === "week"
        ? formatWeekTitle(weekStart)
        : formatKoreanDate(cursor);

  const changeView = (nextView: CalendarView) => {
    setView(nextView);
    router.replace(`${pathname}?view=${nextView}`, { scroll: false });
  };

  const shiftCursor = (direction: -1 | 1) => {
    if (view === "month") {
      setCursor(
        new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1)
      );
      return;
    }
    setCursor(addDays(cursor, view === "week" ? direction * 7 : direction));
  };

  return (
    <div className="bg-surface-default">
      <ScheduleHero />

      <ContentContainer className="grid gap-6 py-10 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="grid content-start gap-8">
          <MiniCalendar cursor={cursor} onSelect={setCursor} />
          <CategoryFilter
            onChange={setActiveCategories}
            selected={activeCategories}
          />
        </aside>

        <section aria-label="일정 캘린더" className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SelectField
                aria-label="캘린더 보기 방식"
                className="h-9 w-[7.5rem] rounded-full bg-accent-ai text-text-inverse"
                onChange={(event) =>
                  changeView(event.target.value as CalendarView)
                }
                options={viewOptions}
                showLabel={false}
                value={view}
                wrapperClassName="w-auto shrink-0"
              />
              <Button
                buttonStyle="secondary"
                className="h-9 shrink-0 whitespace-nowrap px-4"
                onClick={() => setCursor(startOfToday())}
                pill
                size="sm"
              >
                오늘
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="이전 기간"
                className="text-text-secondary"
                onClick={() => shiftCursor(-1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <p className="text-body-md font-semibold text-text-primary">
                {heading}
              </p>
              <button
                aria-label="다음 기간"
                className="text-text-secondary"
                onClick={() => shiftCursor(1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {schedulesQuery.isLoading ? (
            <StatusMessage>일정을 불러오는 중입니다.</StatusMessage>
          ) : schedulesError ? (
            <StatusMessage role="alert">{schedulesError}</StatusMessage>
          ) : visibleEvents.length === 0 ? (
            <StatusMessage>
              표시할 일정이 없습니다. 카테고리를 선택하거나 새로운 일정을
              생성해보세요.
            </StatusMessage>
          ) : view === "day" ? (
            <DayCalendar
              date={cursor}
              onSelect={setSelectedUuid}
              selectedUuid={selected?.scheduleUuid ?? null}
              slotEvents={daySlotEvents}
            />
          ) : view === "week" ? (
            <WeekCalendar
              eventsByDate={weekEventsByDate}
              onSelect={setSelectedUuid}
              selectedUuid={selected?.scheduleUuid ?? null}
              start={weekStart}
            />
          ) : (
            <MonthCalendar
              cursor={cursor}
              events={visibleEvents}
              onSelectDate={setCursor}
              onSelectEvent={setSelectedUuid}
              selectedUuid={selected?.scheduleUuid ?? null}
            />
          )}
        </section>

        <aside className="min-w-0">
          <div className="mb-6 flex justify-end">
            <Button
              icon="left"
              iconComponent={Plus}
              onClick={() => router.push("/schedules/new")}
              pill
              size="sm"
            >
              일정 생성
            </Button>
          </div>
          {schedulesQuery.isLoading ? (
            <StatusMessage>일정을 불러오는 중입니다.</StatusMessage>
          ) : schedulesError ? (
            <StatusMessage role="alert">{schedulesError}</StatusMessage>
          ) : !selected ? (
            <StatusMessage>
              <strong className="block text-text-primary">
                등록된 일정이 없습니다
              </strong>
              <span className="mt-2 block">
                새로운 일정을 생성하여 여행을 계획해보세요.
              </span>
            </StatusMessage>
          ) : (
            <SchedulePreview
              onDetail={() =>
                router.push(
                  scheduleOpenPath(selected.scheduleUuid, selected.creatorType)
                )
              }
              schedule={selected}
            />
          )}
        </aside>
      </ContentContainer>
    </div>
  );
}
