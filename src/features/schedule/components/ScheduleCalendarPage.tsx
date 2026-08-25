"use client";

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
import { useState } from "react";

import { Badge, type BadgeTone } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { SelectField } from "@/components/common/SelectField";
import { StatusMessage } from "@/components/common/StatusMessage";
import {
  mockScheduleDays,
  mockTripSummary,
} from "@/features/schedule/data/calendarMock";

export type CalendarView = "day" | "week" | "month";

interface ScheduleCalendarPageProps {
  initialView?: CalendarView;
}

const categoryItems = [
  { id: "owned", label: "본인 생성", tone: "green" },
  { id: "ai", label: "AI 일정 생성", tone: "blue" },
  { id: "shared", label: "공유 받은 일정", tone: "purple" },
  { id: "review", label: "AI 첨삭", tone: "orange" },
] as const;

const viewOptions = [
  { value: "day", label: "일별" },
  { value: "week", label: "주별" },
  { value: "month", label: "월별" },
];

const calendarEvents = [
  {
    id: "owned-1",
    category: "owned",
    title: "돈키호테털기",
    time: "13:00 – 14:00",
    tone: "green" as BadgeTone,
    day: 11,
  },
  {
    id: "ai-1",
    category: "ai",
    title: "교토 사원 순례 & 기온 저녁",
    time: "10:00 – 11:30",
    tone: "blue" as BadgeTone,
    day: 11,
  },
  {
    id: "shared-1",
    category: "shared",
    title: "여행 일정",
    time: "12:00 – 13:00",
    tone: "purple" as BadgeTone,
    day: 13,
  },
  {
    id: "review-1",
    category: "review",
    title: "AI 일정 리뷰",
    time: "14:00 – 15:00",
    tone: "orange" as BadgeTone,
    day: 15,
  },
] as const;

type CalendarEvent = (typeof calendarEvents)[number];

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

function MiniCalendar() {
  const days = Array.from({ length: 42 }, (_, index) => {
    const value = index - 5;
    if (value < 1) return { value: 26 + index, outside: true };
    if (value > 31) return { value: value - 31, outside: true };
    return { value, outside: false };
  });

  return (
    <section aria-label="미니 캘린더" className="rounded-lg bg-surface-default">
      <div className="flex items-center justify-between">
        <h2 className="text-body-md font-semibold text-text-primary">
          2026년 8월
        </h2>
        <div className="flex gap-2">
          <button
            aria-label="이전 달"
            className="grid size-8 place-items-center rounded-circle border border-line-light text-text-secondary hover:bg-surface-page"
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            aria-label="다음 달"
            className="grid size-8 place-items-center rounded-circle border border-line-light text-text-secondary hover:bg-surface-page"
            type="button"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 text-center text-caption-sm text-text-disabled">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center text-caption text-text-primary">
        {days.map((day, index) => (
          <span
            className={`mx-auto grid size-7 place-items-center rounded-circle ${
              day.value === 11 && !day.outside
                ? "bg-blue-ice font-bold text-brand-primary"
                : day.outside
                  ? "text-text-disabled"
                  : index % 7 === 0
                    ? "text-status-error"
                    : ""
            }`}
            key={`${day.value}-${index}`}
          >
            {day.value}
          </span>
        ))}
      </div>
    </section>
  );
}

function CategoryFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const allSelected = selected.length === categoryItems.length;
  const toggle = (id: string) => {
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
            <Badge tone={item.tone as BadgeTone} variant="dot" />
            {item.label}
          </label>
        ))}
      </div>
    </section>
  );
}

function TimelineEvent({ event }: { event: CalendarEvent }) {
  return (
    <button
      className={`w-full border-l-4 px-4 py-3 text-left transition hover:brightness-95 ${toneSurfaceClasses[event.tone]}`}
      type="button"
    >
      <span className="block text-caption-sm">{event.time}</span>
      <span className="mt-1 block text-body-sm font-semibold">
        {event.title}
      </span>
    </button>
  );
}

function DayCalendar({ events }: { events: readonly CalendarEvent[] }) {
  const hours = Array.from({ length: 9 }, (_, index) => index + 8);

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-line-light bg-surface-default">
      {hours.map((hour) => (
        <div className="grid h-[62px] grid-cols-[72px_1fr]" key={hour}>
          <time className="border-r border-line-light px-3 pt-2 text-caption-sm text-text-disabled">
            {String(hour).padStart(2, "0")}:00
          </time>
          <div className="border-b border-line-light" />
        </div>
      ))}
      <div className="absolute left-[104px] right-5 top-[126px] grid gap-3">
        {events.slice(0, 2).map((event) => (
          <TimelineEvent event={event} key={event.id} />
        ))}
      </div>
    </div>
  );
}

function WeekCalendar({ events }: { events: readonly CalendarEvent[] }) {
  const dates = [9, 10, 11, 12, 13, 14, 15];

  return (
    <div className="overflow-x-auto rounded-lg border border-line-light bg-surface-default">
      <div className="grid min-w-[760px] grid-cols-[64px_repeat(7,minmax(90px,1fr))]">
        <div className="border-b border-r border-line-light" />
        {dates.map((date) => (
          <div
            className={`border-b border-r border-line-light px-2 py-4 text-center text-body-sm ${
              date === 11 ? "bg-blue-ice font-semibold text-brand-primary" : ""
            }`}
            key={date}
          >
            8/{date}
          </div>
        ))}
        {[9, 10, 11, 12, 13, 14, 15].map((hour) => (
          <div className="contents" key={hour}>
            <time className="h-20 border-b border-r border-line-light px-2 py-3 text-caption-sm text-text-disabled">
              {hour}:00
            </time>
            {dates.map((date) => {
              const event = events.find(
                (item, index) => item.day === date && index + 10 === hour
              );
              return (
                <div
                  className="border-b border-r border-line-light p-1"
                  key={date}
                >
                  {event ? <TimelineEvent event={event} /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthCalendar({ events }: { events: readonly CalendarEvent[] }) {
  const dates = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <div className="overflow-x-auto rounded-lg border border-line-light bg-surface-default">
      <div className="grid min-w-[760px] grid-cols-7">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div
            className="border-b border-r border-line-light px-3 py-3 text-center text-body-sm font-semibold text-text-secondary"
            key={day}
          >
            {day}
          </div>
        ))}
        {dates.map((date) => {
          const event = events.find((item) => item.day === date);
          return (
            <div
              className="min-h-28 border-b border-r border-line-light p-2"
              key={date}
            >
              <span className="text-caption text-text-secondary">{date}</span>
              {event ? (
                <div className="mt-2">
                  <TimelineEvent event={event} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchedulePreview({ onDetail }: { onDetail: () => void }) {
  const activity = mockScheduleDays[0].activities[1];

  return (
    <aside className="rounded-lg bg-surface-default">
      <div className="flex items-center justify-between">
        <Badge tone="green" variant="solid">
          본인
        </Badge>
        <button
          className="text-caption text-text-secondary underline-offset-4 hover:underline"
          onClick={onDetail}
          type="button"
        >
          일정 상세보기
        </button>
      </div>
      <h2 className="mt-7 text-heading-md text-text-primary">돈키호테털기</h2>
      <p className="mt-2 text-caption text-text-disabled">
        2026년 8월 3일 월요일
      </p>

      <dl className="mt-6 grid gap-3 rounded-md border border-line-light p-4 text-caption">
        {[
          [MapPin, "여행 목적지", "일본, 도쿄"],
          [CalendarDays, "여행 기간", "2026.8.1 ~ 2026.8.6"],
          [Users, "인원수", mockTripSummary.people],
          [CreditCard, "예상 비용", "₩1,500,000"],
          [Train, "이동 수단", "대중교통"],
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

      <div className="mt-7">
        <h3 className="text-body-sm font-semibold text-text-primary">
          타임라인
        </h3>
        <ol className="mt-4 border-l-2 border-blue-ice pl-5">
          {[mockScheduleDays[0].activities[0], activity].map((item) => (
            <li className="relative pb-5" key={item.id}>
              <span className="absolute -left-[1.55rem] top-1 size-2.5 rounded-circle bg-brand-primary" />
              <time className="text-caption text-text-disabled">
                {item.time}
              </time>
              <p className="mt-1 text-body-sm font-semibold text-text-primary">
                {item.title}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

export function ScheduleCalendarPage({
  initialView = "day",
}: ScheduleCalendarPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [calendar, setCalendar] = useState({
    view: initialView,
    activeCategories: categoryItems.map((item) => item.id) as string[],
  });

  const visibleEvents = calendarEvents.filter((event) =>
    calendar.activeCategories.includes(event.category)
  );

  const changeView = (view: CalendarView) => {
    setCalendar((current) => ({ ...current, view }));
    router.replace(`${pathname}?view=${view}`, { scroll: false });
  };

  return (
    <div className="bg-surface-default">
      <ScheduleHero />

      <ContentContainer className="grid gap-8 py-10 xl:grid-cols-[292px_minmax(0,1fr)_340px]">
        <aside className="grid content-start gap-8">
          <MiniCalendar />
          <CategoryFilter
            onChange={(activeCategories) =>
              setCalendar((current) => ({ ...current, activeCategories }))
            }
            selected={calendar.activeCategories}
          />
        </aside>

        <section aria-label="일정 캘린더" className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SelectField
                aria-label="캘린더 보기 방식"
                className="h-9 min-w-24 rounded-full bg-accent-ai text-text-inverse"
                onChange={(event) =>
                  changeView(event.target.value as CalendarView)
                }
                options={viewOptions}
                showLabel={false}
                value={calendar.view}
              />
              <Button buttonStyle="secondary" className="h-9" size="sm">
                오늘
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="이전 기간"
                className="text-text-secondary"
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <p className="text-body-md font-semibold text-text-primary">
                2026년 8월 11일 (화)
              </p>
              <button
                aria-label="다음 기간"
                className="text-text-secondary"
                type="button"
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {visibleEvents.length === 0 ? (
            <StatusMessage>
              표시할 일정이 없습니다. 카테고리를 선택하거나 새로운 일정을
              생성해보세요.
            </StatusMessage>
          ) : calendar.view === "day" ? (
            <DayCalendar events={visibleEvents} />
          ) : calendar.view === "week" ? (
            <WeekCalendar events={visibleEvents} />
          ) : (
            <MonthCalendar events={visibleEvents} />
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
          {visibleEvents.length === 0 ? (
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
              onDetail={() => router.push("/schedules/demo-schedule")}
            />
          )}
        </aside>
      </ContentContainer>
    </div>
  );
}
