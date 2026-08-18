"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge, type BadgeTone } from "@/components/common/Badge";
import {
  type ActivityBadgeTone,
  mockScheduleDays,
  mockTripSummary,
  type ScheduleDay,
  type ScheduleTab,
  scheduleTabs,
} from "@/features/schedule/data/calendarMock";

const activityBadgeToneMap: Record<ActivityBadgeTone, BadgeTone> = {
  arrival: "blue",
  meal: "green",
  default: "gray",
};

function TripTicketCard() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl -translate-y-16 rounded-lg border-2 border-dashed border-line-default bg-surface-default px-8 py-8 shadow-[0_8px_24px_rgb(0_0_0_/_0.08)] sm:px-10 sm:py-10">
      <p className="text-caption tracking-[0.2em] text-text-disabled uppercase">
        Have a nice trip
      </p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight text-brand-primary">
        JAPAN, TOKYO
      </h1>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-caption text-text-disabled">City</dt>
          <dd className="mt-1 text-label-sm text-text-primary">Plan</dd>
        </div>
        <div>
          <dt className="text-caption text-text-disabled">Plan</dt>
          <dd className="mt-1 text-label-sm text-text-primary">First Plan</dd>
        </div>
        <div>
          <dt className="text-caption text-text-disabled">Duration</dt>
          <dd className="mt-1 text-label-sm text-text-primary">5 Days</dd>
        </div>
      </dl>

      <p className="mt-6 text-caption text-status-error">
        * 일정은 현지 상황에 따라 변경될 수 있습니다.
      </p>

      <div
        aria-hidden="true"
        className="mx-auto mt-6 h-12 w-48 bg-[repeating-linear-gradient(90deg,#2f2f2f_0_2px,transparent_2px_6px)]"
      />
    </div>
  );
}

function ScheduleTimeline({ days }: { days: ScheduleDay[] }) {
  return (
    <div className="grid gap-10">
      {days.map((day) => (
        <section key={day.id}>
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="md" tone="blue" variant="solid">
              {day.label}
            </Badge>
            <p className="text-body-sm text-text-secondary">{day.theme}</p>
          </div>

          <ol className="mt-6 grid gap-6 border-l border-line-light pl-6">
            {day.activities.map((activity) => (
              <li className="relative" key={activity.id}>
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(1.5rem+5px)] top-2 size-2.5 rounded-circle bg-brand-primary"
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <time className="text-data-md text-text-primary">
                    {activity.time}
                  </time>
                  <h3 className="text-heading-sm text-text-primary">
                    {activity.title}
                  </h3>
                  {activity.badge && (
                    <Badge
                      tone={
                        activityBadgeToneMap[activity.badgeTone ?? "default"]
                      }
                    >
                      {activity.badge}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-body-sm leading-6 text-text-secondary">
                  {activity.description}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-caption text-text-disabled">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {activity.location}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function TripSummarySidebar() {
  const items = [
    { label: "목적지", value: mockTripSummary.destination },
    { label: "날짜", value: mockTripSummary.dates },
    { label: "기간", value: mockTripSummary.duration },
    { label: "인원", value: mockTripSummary.people },
    { label: "여행 테마", value: mockTripSummary.theme },
    { label: "예상 예산", value: mockTripSummary.budget },
  ];

  return (
    <aside className="h-fit rounded-lg border border-line-light bg-blue-ice/40 p-6">
      <h2 className="text-heading-md text-text-primary">
        내가 설정한 여행 요약
      </h2>
      <dl className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-caption text-text-disabled">{item.label}</dt>
            <dd className="mt-1 text-body-sm text-text-primary">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-line-light pt-4 text-caption leading-5 text-text-secondary">
        {mockTripSummary.note}
      </p>
    </aside>
  );
}

export function ScheduleCalendarPage() {
  const [activeTab, setActiveTab] = useState<ScheduleTab>("plan");
  const [activePage, setActivePage] = useState(1);

  return (
    <div className="bg-surface-page">
      <section className="relative h-[min(42vh,22rem)] w-full overflow-hidden">
        <Image
          alt="알프스 호수 보트 풍경"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/images/schedules/schedules-hero.png"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-surface-page"
        />
      </section>

      <div className="px-6 pb-20 sm:px-8">
        <TripTicketCard />

        <div className="mx-auto mt-2 w-full max-w-6xl">
          <div
            className="flex flex-wrap gap-2 border-b border-line-light pb-4"
            role="tablist"
          >
            {scheduleTabs.map((tab) => {
              const selected = activeTab === tab.id;

              return (
                <button
                  aria-selected={selected}
                  className={`rounded-full px-5 py-2 text-body-sm transition ${
                    selected
                      ? "bg-brand-primary font-semibold text-text-inverse"
                      : "bg-surface-default text-text-secondary hover:bg-blue-ice"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "plan" ? (
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <ScheduleTimeline days={mockScheduleDays} />

                <nav
                  aria-label="일정 페이지"
                  className="mt-12 flex justify-center gap-2"
                >
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      aria-current={activePage === page ? "page" : undefined}
                      className={`grid size-9 place-items-center rounded-circle text-body-sm transition ${
                        activePage === page
                          ? "bg-brand-primary font-semibold text-text-inverse"
                          : "bg-surface-default text-text-secondary hover:bg-blue-ice"
                      }`}
                      key={page}
                      onClick={() => setActivePage(page)}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>

              <TripSummarySidebar />
            </div>
          ) : (
            <p className="mt-16 text-center text-body-md text-text-secondary">
              {activeTab === "companion"
                ? "동행 구함 기능은 준비 중입니다."
                : "후기 기능은 준비 중입니다."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
