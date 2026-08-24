"use client";

import {
  CalendarDays,
  CreditCard,
  MapPin,
  Pencil,
  Train,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import {
  mockScheduleDays,
  mockTripSummary,
} from "@/features/schedule/data/calendarMock";

interface ScheduleDetailPageProps {
  scheduleId: string;
  aiGenerated?: boolean;
}

export function ScheduleDetailPage({
  scheduleId,
  aiGenerated = false,
}: ScheduleDetailPageProps) {
  const router = useRouter();

  return (
    <div className="bg-surface-page pb-20">
      <section className="relative h-[clamp(240px,24vw,420px)] overflow-hidden">
        <Image
          alt="야자수가 펼쳐진 바다와 해변"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src="/images/schedules/calendar-hero.png"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 bottom-[18%] mx-auto w-full max-w-6xl px-6 sm:px-10">
          <Badge tone={aiGenerated ? "blue" : "green"} variant="solid">
            {aiGenerated ? "AI 추천" : "본인"}
          </Badge>
          <h1 className="mt-4 text-[clamp(2rem,3vw,3.25rem)] font-medium text-text-inverse">
            교토 사원 순례 & 기온 저녁
          </h1>
          <p className="mt-2 text-body-sm text-white/85">
            2026년 8월 3일 월요일
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="rounded-lg border border-line-light bg-surface-default p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-caption text-text-disabled">일정 ID</p>
              <p className="mt-1 text-body-sm text-text-secondary">
                {scheduleId}
              </p>
            </div>
            <Button
              buttonStyle="secondary"
              icon="left"
              iconComponent={Pencil}
              onClick={() => router.push(`/schedules/${scheduleId}/edit`)}
              size="sm"
            >
              수정
            </Button>
          </div>

          <h2 className="mt-10 text-heading-lg text-text-primary">타임라인</h2>
          <div className="mt-7 grid gap-10">
            {mockScheduleDays.map((day) => (
              <section key={day.id}>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="blue" variant="solid">
                    {day.label}
                  </Badge>
                  <p className="text-body-sm text-text-secondary">
                    {day.theme}
                  </p>
                </div>
                <ol className="mt-6 border-l-2 border-blue-ice pl-7">
                  {day.activities.map((activity) => (
                    <li className="relative pb-7" key={activity.id}>
                      <span className="absolute -left-[2rem] top-1 size-2.5 rounded-circle bg-brand-primary" />
                      <div className="flex flex-wrap items-center gap-3">
                        <time className="text-body-sm font-semibold text-brand-primary">
                          {activity.time}
                        </time>
                        {activity.badge ? (
                          <Badge tone="gray">{activity.badge}</Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-heading-sm text-text-primary">
                        {activity.title}
                      </h3>
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
        </main>

        <aside className="h-fit rounded-lg border border-line-light bg-surface-default p-6">
          <h2 className="text-heading-md text-text-primary">여행 정보</h2>
          <dl className="mt-6 grid gap-5">
            {[
              [MapPin, "여행 목적지", "일본, 도쿄"],
              [CalendarDays, "여행 기간", "2026.8.1 ~ 2026.8.6 (5박 6일)"],
              [Users, "인원수", mockTripSummary.people],
              [CreditCard, "예상 비용", "₩1,500,000"],
              [Train, "이동 수단", "대중교통"],
            ].map(([Icon, label, value]) => (
              <div className="flex items-start gap-3" key={label as string}>
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 text-brand-primary"
                />
                <div>
                  <dt className="text-caption text-text-disabled">
                    {label as string}
                  </dt>
                  <dd className="mt-1 text-body-sm text-text-primary">
                    {value as string}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          {aiGenerated ? (
            <div className="mt-8 rounded-md bg-badge-blue-bg p-4">
              <p className="text-body-sm font-semibold text-badge-blue-fg">
                AI Advice
              </p>
              <p className="mt-2 text-caption leading-5 text-text-secondary">
                JR 패스를 지참하고, 현지 기상과 교통 상황에 따라 이동 시간을
                조정해주세요.
              </p>
            </div>
          ) : null}
          <Button
            buttonStyle="secondary"
            className="mt-8 w-full"
            onClick={() => router.push("/schedules/calendar")}
          >
            캘린더로 돌아가기
          </Button>
        </aside>
      </div>
    </div>
  );
}
