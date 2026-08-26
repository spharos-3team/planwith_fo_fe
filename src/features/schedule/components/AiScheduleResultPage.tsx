"use client";

import { WalletCards } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import type { AiScheduleCategory } from "@/features/schedule/data/aiScheduleResultMock";
import {
  loadAiGenerateResult,
  markAiApplicationCompleted,
} from "@/features/schedule/lib/ai-application";
import {
  formatApproxCost,
  formatFigmaPeriod,
  formatPeople,
  transportationLabel,
} from "@/features/schedule/lib/format";
import type {
  AiGeneratedItem,
  AiScheduleGenerateResult,
} from "@/features/schedule/types";
import { useApiError } from "@/hooks/useApiError";
import { saveAiSchedule } from "@/services/schedule/schedules";

interface AiScheduleResultPageProps {
  generationId: string;
}

const categoryTone: Record<AiScheduleCategory, "blue" | "green" | "orange"> = {
  이동: "blue",
  식사: "orange",
  관광: "green",
};

function itemCategory(type: string | null | undefined): AiScheduleCategory {
  switch (type) {
    case "MOVE":
      return "이동";
    case "FOOD":
      return "식사";
    default:
      return "관광";
  }
}

function groupDays(items: AiGeneratedItem[]) {
  const days = new Map<number, AiGeneratedItem[]>();
  items.forEach((item) => {
    const dayNumber = item.dayNumber || 1;
    const current = days.get(dayNumber) ?? [];
    current.push(item);
    days.set(dayNumber, current);
  });

  return [...days.entries()]
    .sort(([left], [right]) => left - right)
    .map(([day, dayItems]) => ({
      day,
      theme: dayItems[0]?.subtitle ?? dayItems[0]?.placeName ?? "여행 일정",
      items: [...dayItems].sort((left, right) =>
        (left.scheduleTime ?? "").localeCompare(right.scheduleTime ?? "")
      ),
    }));
}

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

function Hero({ destination }: { destination: string }) {
  return (
    <section className="relative h-[clamp(300px,28.35vw,544px)] overflow-hidden rounded-[18px] bg-gray-900 shadow-[0_3px_5px_rgb(0_0_0/0.34)]">
      <Image
        alt={destination}
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
            {destination}
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

function TimelineItem({ item }: { item: AiGeneratedItem }) {
  const category = itemCategory(item.scheduleType);

  return (
    <li className="grid min-h-[135px] grid-cols-[60px_minmax(0,1fr)] gap-5">
      <div className="pt-1 text-center">
        <time className="text-[15px] font-bold leading-[26px] text-text-primary">
          {item.scheduleTime ?? "-"}
        </time>
        <span
          aria-hidden="true"
          className="mt-1 block border-t-2 border-dotted border-blue-light"
        />
      </div>

      <article className="min-w-0 rounded-[16px] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[18px] font-bold text-text-primary">
            {item.subtitle ?? item.placeName ?? "일정"}
          </h3>
          <Badge tone={categoryTone[category]}>{category}</Badge>
        </div>
        {item.description ? (
          <p className="mt-1.5 max-w-[520px] text-body-sm leading-[1.5] text-text-primary">
            {item.description}
          </p>
        ) : null}
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-caption text-text-primary">
          <WalletCards aria-hidden="true" className="size-3.5" />
          예상 비용: {formatApproxCost(item.estimatedCost)}
        </p>
      </article>
    </li>
  );
}

function TripSummary({ result }: { result: AiScheduleGenerateResult }) {
  const rows = [
    ["목적지", result.destination],
    ["여행 기간", formatFigmaPeriod(result.startDate, result.endDate)],
    ["인원수", formatPeople(result.participantCount)],
    ["이동 수단", transportationLabel(result.transportation)],
    ["총 예상 경비(1인 기준)", formatApproxCost(result.estimatedBudget)],
  ];

  return (
    <aside className="min-w-0 min-[1320px]:w-[242px] min-[1320px]:shrink-0">
      <h2 className="border-b border-line-light pb-2 text-center text-heading-lg text-text-primary min-[1320px]:text-left">
        내가 설정한 여행 요약
      </h2>
      <dl className="grid gap-[13px] pt-5 sm:grid-cols-2 min-[1320px]:grid-cols-1">
        {rows.map(([label, value]) => (
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
  theme,
  items,
  showSummary,
  result,
}: {
  day: number;
  theme: string;
  items: AiGeneratedItem[];
  showSummary: boolean;
  result: AiScheduleGenerateResult;
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
          DAY {day}
        </Badge>
        <h2 className="text-heading-md text-[#1a1c1e]">{theme}</h2>
      </header>

      {items.length > 0 ? (
        <ol className="grid gap-[54px]">
          {items.map((item, index) => (
            <TimelineItem
              item={item}
              key={`${item.dayNumber}-${item.subtitle}-${index}`}
            />
          ))}
        </ol>
      ) : (
        <p className="whitespace-pre-wrap py-5 text-body-sm leading-[1.5] text-text-primary">
          {result.content || "생성된 타임라인이 없습니다."}
        </p>
      )}

      {showSummary ? (
        <TripSummary result={result} />
      ) : (
        <span aria-hidden="true" />
      )}
    </section>
  );
}

export function AiScheduleResultPage({
  generationId,
}: AiScheduleResultPageProps) {
  const router = useRouter();
  const [result] = useState(() => loadAiGenerateResult(generationId));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const saveMessage = useApiError(saveError);
  const days = useMemo(() => groupDays(result?.items ?? []), [result]);

  useEffect(() => {
    if (result) {
      markAiApplicationCompleted();
    }
  }, [result]);

  const regenerate = () => {
    setSaved(false);
    router.push(`/schedules/ai/${crypto.randomUUID()}/generating`);
  };

  const restartForm = () => {
    markAiApplicationCompleted();
    router.push("/schedules/ai/new");
  };

  const saveToCalendar = async () => {
    if (!result) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const items =
        result.items.length > 0
          ? result.items
          : [
              {
                dayNumber: 1,
                scheduleTime: null,
                subtitle: result.title,
                scheduleType: "ETC",
                description: result.content,
                estimatedCost: result.estimatedBudget,
                placeName: result.destination,
                placeAddress: null,
                latitude: null,
                longitude: null,
              },
            ];
      const imageUrl =
        result.imageUrl && /^https:\/\/\S+$/.test(result.imageUrl)
          ? result.imageUrl
          : undefined;
      await saveAiSchedule({
        title: result.title || result.destination,
        destination: result.destination,
        imageUrl,
        startDate: result.startDate,
        endDate: result.endDate,
        participantCount: Math.max(1, result.participantCount ?? 1),
        estimatedBudget: result.estimatedBudget ?? 0,
        transportation: result.transportation,
        travelStyle: result.travelStyle,
        content: result.content,
        calendarColor: "#387BFF",
        items,
      });
      setSaved(true);
    } catch (error) {
      setSaveError(error);
    } finally {
      setSaving(false);
    }
  };

  if (!result) {
    return (
      <div className="bg-surface-page px-6 py-20">
        <StatusMessage role="alert">
          생성된 일정을 찾을 수 없습니다. 다시 생성해 주세요.
        </StatusMessage>
        <div className="mt-6 flex justify-center">
          <Button onClick={restartForm}>입력으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-default pb-20 text-text-primary">
      <ContentContainer className="pt-10">
        <div className="mx-auto w-full max-w-[1340px]">
          <Hero destination={result.destination} />

          <div className="mt-[100px] flex flex-wrap justify-end gap-1 border-b border-line-light pb-5">
            <button
              className="rounded-[5px] bg-blue-400/70 px-2.5 py-2.5 text-body-sm font-medium transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-50"
              disabled={saving}
              onClick={() => void saveToCalendar()}
              type="button"
            >
              {saving ? "저장 중" : "내 캘린더 저장"}
            </button>
            <button
              className="px-2.5 py-2.5 text-body-sm font-medium transition hover:text-brand-primary"
              onClick={restartForm}
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
          {saveMessage ? (
            <p
              className="mt-3 text-right text-body-sm text-status-error"
              role="alert"
            >
              {saveMessage}
            </p>
          ) : null}

          <div className="mt-5 grid gap-[20px]">
            {days.length > 0 ? (
              days.map((day, index) => (
                <DaySchedule
                  day={day.day}
                  items={day.items}
                  key={day.day}
                  result={result}
                  showSummary={index === 0}
                  theme={day.theme}
                />
              ))
            ) : (
              <DaySchedule
                day={1}
                items={[]}
                result={result}
                showSummary
                theme={result.title}
              />
            )}
          </div>
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
