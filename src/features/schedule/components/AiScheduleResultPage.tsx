"use client";

import { ChevronRight, WalletCards } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/common/Badge";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { Modal } from "@/components/common/Modal";
import {
  type AiScheduleActivity,
  type AiScheduleCategory,
  type AiScheduleDay,
  aiScheduleResultDays,
  aiTripSummary,
} from "@/features/schedule/data/aiScheduleResultMock";

interface AiScheduleResultPageProps {
  generationId: string;
}

const categoryTone: Record<AiScheduleCategory, "blue" | "green" | "orange"> = {
  이동: "blue",
  식사: "orange",
  관광: "green",
};

function Barcode() {
  return (
    <span aria-hidden="true" className="flex h-8 items-stretch gap-1">
      {[4, 8, 4, 12, 4, 8, 4, 8].map((width, index) => (
        <span
          className="block rounded-[1px] bg-white"
          key={`${width}-${index}`}
          style={{ width }}
        />
      ))}
    </span>
  );
}

function Hero() {
  return (
    <section className="relative h-[clamp(300px,28.35vw,544px)] overflow-hidden rounded-[18px] bg-gray-900 shadow-[0_3px_5px_rgb(0_0_0/0.34)]">
      <Image
        alt="도쿄 골목을 밝히는 붉은 등불"
        className="scale-[1.025] object-cover blur-[5.4px]"
        fill
        priority
        sizes="(min-width: 1440px) 1340px, calc(100vw - 48px)"
        src="/images/schedules/ai-result-tokyo.jpg"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-7 flex items-end justify-between px-5 text-white sm:bottom-8 sm:px-8">
        <div>
          <h1 className="text-[clamp(2rem,2.5vw,2.625rem)] font-bold leading-none">
            TOKYO
          </h1>
          <p className="mt-3 text-body-sm text-white/90">
            AI에 의해 최적화된 맞춤 일정입니다.
          </p>
        </div>
        <Barcode />
      </div>
    </section>
  );
}

function TimelineItem({ activity }: { activity: AiScheduleActivity }) {
  return (
    <li className="grid min-h-[135px] grid-cols-[60px_minmax(0,1fr)] gap-5">
      <div className="pt-1 text-center">
        <time className="text-[15px] font-bold leading-[26px] text-text-primary">
          {activity.time}
        </time>
        <span
          aria-hidden="true"
          className="mt-1 block border-t-2 border-dotted border-blue-light"
        />
      </div>

      <article className="min-w-0 rounded-[16px] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[18px] font-bold text-text-primary">
            {activity.title}
          </h3>
          <Badge tone={categoryTone[activity.category]}>
            {activity.category}
          </Badge>
        </div>
        <p className="mt-1.5 max-w-[520px] text-body-sm leading-[1.5] text-text-primary">
          {activity.description}
        </p>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-caption text-text-primary">
          <WalletCards aria-hidden="true" className="size-3.5" />
          예상 비용: {activity.cost}
        </p>
      </article>
    </li>
  );
}

function TripSummary() {
  return (
    <aside className="min-w-0 min-[1320px]:w-[242px] min-[1320px]:shrink-0">
      <h2 className="border-b border-line-light pb-2 text-center text-heading-lg text-text-primary min-[1320px]:text-left">
        내가 설정한 여행 요약
      </h2>
      <dl className="grid gap-[13px] pt-5 sm:grid-cols-2 min-[1320px]:grid-cols-1">
        {aiTripSummary.map(([label, value]) => (
          <div className="relative pl-[19px]" key={label}>
            <span
              aria-hidden="true"
              className="absolute left-0 top-[14px] size-2.5 rounded-circle bg-blue-400"
            />
            <dt className="text-[11px] text-text-disabled">{label}</dt>
            <dd className="mt-0.5 text-body-sm font-bold text-text-primary">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function DaySchedule({
  day,
  showSummary,
}: {
  day: AiScheduleDay;
  showSummary: boolean;
}) {
  return (
    <section className="grid gap-8 border-b border-line-light pb-14 min-[1320px]:grid-cols-[240px_minmax(0,678px)_242px] min-[1320px]:justify-between min-[1320px]:gap-8 min-[1320px]:border-0 min-[1320px]:pb-0">
      <header className="flex items-center gap-3 self-start py-5">
        <Badge
          className="rounded-md"
          style={{
            backgroundColor: "var(--primitive-blue-400)",
            color: "var(--text-primary)",
          }}
          variant="solid"
        >
          DAY {day.day}
        </Badge>
        <h2 className="text-heading-md text-[#1a1c1e]">{day.theme}</h2>
      </header>

      <ol className="grid gap-[54px]">
        {day.activities.map((activity) => (
          <TimelineItem activity={activity} key={activity.id} />
        ))}
      </ol>

      {showSummary ? <TripSummary /> : <span aria-hidden="true" />}
    </section>
  );
}

export function AiScheduleResultPage({
  generationId,
}: AiScheduleResultPageProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(1);

  const regenerate = () => {
    setSaved(false);
    router.push(`/schedules/ai/${generationId}/generating`);
  };

  return (
    <div className="bg-surface-default pb-20 text-text-primary">
      <ContentContainer className="pt-10">
        <div className="mx-auto w-full max-w-[1340px]">
          <Hero />

          <div className="mt-[100px] flex flex-wrap justify-end gap-1 border-b border-line-light pb-5">
            <button
              className="rounded-[5px] bg-blue-400/70 px-2.5 py-2.5 text-body-sm font-medium transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              onClick={() => setSaved(true)}
              type="button"
            >
              내 캘린더 저장
            </button>
            <button
              className="px-2.5 py-2.5 text-body-sm font-medium transition hover:text-brand-primary"
              onClick={() => router.push("/schedules/ai/new")}
              type="button"
            >
              정보 다시 입력
            </button>
            <button
              className="px-2.5 py-2.5 text-body-sm font-medium transition hover:text-brand-primary"
              onClick={regenerate}
              type="button"
            >
              재생성
            </button>
          </div>

          <div className="mt-5 grid gap-[20px]">
            {aiScheduleResultDays.map((day, index) => (
              <DaySchedule day={day} key={day.id} showSummary={index === 0} />
            ))}
          </div>

          <nav
            aria-label="일정 페이지"
            className="mt-[70px] flex justify-center border-t border-line-light pt-5"
          >
            {[1, 2, 3, 4, 5].map((pageNumber) => (
              <button
                aria-current={page === pageNumber ? "page" : undefined}
                aria-label={`${pageNumber}페이지`}
                className={`grid size-[30px] place-items-center rounded-md text-caption transition ${
                  page === pageNumber
                    ? "bg-brand-primary font-bold text-text-inverse"
                    : "text-text-secondary hover:bg-surface-page"
                }`}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            ))}
            <button
              aria-label="다음 일정 페이지"
              className="grid size-[30px] place-items-center text-text-disabled transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === 5}
              onClick={() => setPage((current) => Math.min(5, current + 1))}
              type="button"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </nav>
        </div>
      </ContentContainer>

      <Modal
        description="캘린더에 언제든지 확인하실 수 있습니다"
        onClose={() => setSaved(false)}
        open={saved}
        primaryAction={{
          label: "캘린더에서 확인",
          onClick: () => router.push("/schedules/calendar"),
        }}
        secondaryAction={{ label: "다시 생성하기", onClick: regenerate }}
        title="일정이 캘린더에 저장되었습니다"
        variant="success"
      />
    </div>
  );
}
