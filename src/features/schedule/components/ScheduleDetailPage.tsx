"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CreditCard,
  MapPin,
  Pencil,
  Train,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import {
  categoryLabel,
  categoryTone,
  creatorCategory,
  formatKoreanDate,
  formatScheduleClock,
  parseIsoDate,
  scheduleOpenPath,
} from "@/features/schedule/lib/calendar";
import {
  formatCost,
  formatDuration,
  formatPeople,
  formatSchedulePeriod,
  scheduleItemBadge,
  transportationLabel,
} from "@/features/schedule/lib/format";
import type { ScheduleItem } from "@/features/schedule/types";
import { useApiError } from "@/hooks/useApiError";
import {
  deleteSchedule,
  getScheduleDetail,
} from "@/services/schedule/schedules";

interface ScheduleDetailPageProps {
  scheduleId: string;
}

function groupItems(items: ScheduleItem[]) {
  const days = new Map<number, ScheduleItem[]>();

  items.forEach((item) => {
    const current = days.get(item.dayNumber) ?? [];
    current.push(item);
    days.set(item.dayNumber, current);
  });

  return [...days.entries()]
    .sort(([left], [right]) => left - right)
    .map(([dayNumber, dayItems]) => ({
      dayNumber,
      items: [...dayItems].sort((left, right) =>
        (left.scheduleTime ?? "").localeCompare(right.scheduleTime ?? "")
      ),
    }));
}

export function ScheduleDetailPage({ scheduleId }: ScheduleDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<"delete" | "deleted" | null>(null);
  const [deleted, setDeleted] = useState(false);
  const detailQuery = useQuery({
    queryKey: ["schedules", scheduleId],
    queryFn: () => getScheduleDetail(scheduleId),
    enabled: !deleted,
  });
  const error = useApiError(deleted ? null : detailQuery.error);
  const record = detailQuery.data?.schedule;
  const deleteMutation = useMutation({
    mutationFn: () => deleteSchedule(scheduleId),
    onSuccess: async () => {
      setDeleted(true);
      await queryClient.cancelQueries({ queryKey: ["schedules", scheduleId] });
      await queryClient.invalidateQueries({
        queryKey: ["schedules", "calendar"],
      });
      setModal("deleted");
    },
  });
  const deleteError = useApiError(deleteMutation.error);
  const groupedItems = useMemo(
    () => groupItems(detailQuery.data?.items ?? []),
    [detailQuery.data?.items]
  );

  useEffect(() => {
    if (!record) {
      return;
    }
    if (creatorCategory(record.creatorType) === "owned") {
      router.replace(scheduleOpenPath(record.scheduleUuid, record.creatorType));
    }
  }, [record, router]);

  if (detailQuery.isLoading) {
    return (
      <div className="bg-surface-page px-6 py-20">
        <StatusMessage>일정을 불러오는 중입니다.</StatusMessage>
      </div>
    );
  }

  if (!deleted && (error || !record)) {
    return (
      <div className="bg-surface-page px-6 py-20">
        <StatusMessage role="alert">
          {error || "일정을 찾을 수 없습니다."}
        </StatusMessage>
        <div className="mt-6 flex justify-center">
          <Button
            buttonStyle="secondary"
            onClick={() => router.push("/schedules/calendar")}
          >
            캘린더로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <Modal
        description="일정이 안전하게 삭제되었습니다."
        onClose={() => router.push("/schedules/calendar")}
        open={deleted}
        primaryAction={{
          label: "확인",
          onClick: () => router.push("/schedules/calendar"),
        }}
        title="일정 삭제 완료"
        variant="success"
      />
    );
  }

  const category = creatorCategory(record.creatorType);
  if (category === "owned") {
    return (
      <div className="bg-surface-page px-6 py-20">
        <StatusMessage>일정 수정 화면으로 이동 중입니다.</StatusMessage>
      </div>
    );
  }

  const period = formatSchedulePeriod(record.startDate, record.endDate);
  const duration = formatDuration(record.startDate, record.endDate);
  const heroImage =
    record.imageUrl && record.imageUrl.startsWith("/")
      ? record.imageUrl
      : "/images/schedules/calendar-hero.png";

  return (
    <div className="bg-surface-page pb-20">
      <section className="relative h-[clamp(240px,24vw,420px)] overflow-hidden">
        <Image
          alt={record.title}
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
        <ContentContainer className="absolute inset-x-0 bottom-[18%]">
          <div className="mx-auto w-full max-w-6xl">
            <Badge tone={categoryTone(category)} variant="solid">
              {categoryLabel(category)}
            </Badge>
            <h1 className="mt-4 text-[clamp(2rem,3vw,3.25rem)] font-medium text-text-inverse">
              {record.title}
            </h1>
            <p className="mt-2 text-body-sm text-white/85">
              {formatKoreanDate(parseIsoDate(record.startDate))}
            </p>
          </div>
        </ContentContainer>
      </section>

      <ContentContainer className="pt-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="rounded-lg border border-line-light bg-surface-default p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-end gap-4">
              {category === "ai" ? (
                <Button
                  buttonStyle="dangerOutline"
                  disabled={deleteMutation.isPending}
                  icon="left"
                  iconComponent={Trash2}
                  onClick={() => setModal("delete")}
                  size="sm"
                >
                  삭제
                </Button>
              ) : (
                <Button
                  buttonStyle="secondary"
                  icon="left"
                  iconComponent={Pencil}
                  onClick={() =>
                    router.push(`/schedules/${record.scheduleUuid}/edit`)
                  }
                  size="sm"
                >
                  수정
                </Button>
              )}
            </div>
            {deleteError ? (
              <p
                className="mt-3 text-right text-body-sm text-status-error"
                role="alert"
              >
                {deleteError}
              </p>
            ) : null}

            <h2 className="mt-10 text-heading-lg text-text-primary">
              타임라인
            </h2>
            {groupedItems.length > 0 ? (
              <div className="mt-7 grid gap-10">
                {groupedItems.map((day) => (
                  <section key={day.dayNumber}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="blue" variant="solid">
                        DAY {day.dayNumber}
                      </Badge>
                    </div>
                    <ol className="mt-6 border-l-2 border-blue-ice pl-7">
                      {day.items.map((activity) => {
                        const badge = scheduleItemBadge(activity.scheduleType);
                        return (
                          <li
                            className="relative pb-7"
                            key={activity.scheduleItemId}
                          >
                            <span className="absolute -left-[2rem] top-1 size-2.5 rounded-circle bg-brand-primary" />
                            <div className="flex flex-wrap items-center gap-3">
                              <time className="text-body-sm font-semibold text-brand-primary">
                                {formatScheduleClock(activity.scheduleTime) ||
                                  "-"}
                              </time>
                              {badge ? (
                                <Badge tone="gray">{badge}</Badge>
                              ) : null}
                            </div>
                            <h3 className="mt-2 text-heading-sm text-text-primary">
                              {activity.subtitle ??
                                activity.placeName ??
                                "일정"}
                            </h3>
                            {activity.description ? (
                              <p className="mt-2 text-body-sm leading-6 text-text-secondary">
                                {activity.description}
                              </p>
                            ) : null}
                            {activity.placeName || activity.placeAddress ? (
                              <p className="mt-2 inline-flex items-center gap-1 text-caption text-text-disabled">
                                <MapPin
                                  aria-hidden="true"
                                  className="h-3.5 w-3.5"
                                />
                                {activity.placeAddress || activity.placeName}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))}
              </div>
            ) : (
              <p className="mt-7 whitespace-pre-wrap text-body-sm leading-6 text-text-secondary">
                {record.content?.trim() || "등록된 타임라인이 없습니다."}
              </p>
            )}
          </main>

          <aside className="h-fit rounded-lg border border-line-light bg-surface-default p-6">
            <h2 className="text-heading-md text-text-primary">여행 정보</h2>
            <dl className="mt-6 grid gap-5">
              {[
                [MapPin, "여행 목적지", record.destination ?? "-"],
                [
                  CalendarDays,
                  "여행 기간",
                  duration ? `${period} (${duration})` : period,
                ],
                [Users, "인원수", formatPeople(record.headcount)],
                [CreditCard, "예상 비용", formatCost(record.expectedCost)],
                [
                  Train,
                  "이동 수단",
                  transportationLabel(record.transportation),
                ],
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
            <Button
              buttonStyle="secondary"
              className="mt-8 w-full"
              onClick={() => router.push("/schedules/calendar")}
            >
              캘린더로 돌아가기
            </Button>
          </aside>
        </div>
      </ContentContainer>

      <Modal
        cancelAction={{ label: "취소", onClick: () => setModal(null) }}
        confirmAction={{
          label: deleteMutation.isPending ? "삭제 중" : "삭제하기",
          onClick: () => {
            if (!deleteMutation.isPending) {
              deleteMutation.mutate();
            }
          },
        }}
        description="삭제한 일정은 복구할 수 없습니다."
        onClose={() => setModal(null)}
        open={modal === "delete"}
        title="일정을 삭제하시겠어요?"
        variant="confirm"
      />
      <Modal
        description="일정이 안전하게 삭제되었습니다."
        onClose={() => setModal(null)}
        open={modal === "deleted"}
        primaryAction={{
          label: "확인",
          onClick: () => router.push("/schedules/calendar"),
        }}
        title="일정 삭제 완료"
        variant="success"
      />
    </div>
  );
}
