"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import {
  colorIndex,
  creatorCategory,
  SCHEDULE_COLORS,
  scheduleOpenPath,
} from "@/features/schedule/lib/calendar";
import type {
  ScheduleCreatorType,
  ScheduleRecord,
  ScheduleTransportation,
} from "@/features/schedule/types";
import { useApiError } from "@/hooks/useApiError";
import {
  createSchedule,
  deleteSchedule,
  getScheduleDetail,
  reviseScheduleWithAi,
  updateSchedule,
} from "@/services/schedule/schedules";

type EditorMode = "create" | "edit";
type EditorModal = "saved" | "delete" | "deleted" | "reviewSaved" | null;

interface ScheduleEditorPageProps {
  mode: EditorMode;
  scheduleId?: string;
  onDeleted?: () => void;
}

interface EditorValues {
  destination: string;
  startDate: string;
  endDate: string;
  title: string;
  content: string;
  colorIndex: number;
  reviewActive: boolean;
  headcount: number;
  expectedCost: number | null;
  transportation: ScheduleTransportation | string | null;
  creatorType: ScheduleCreatorType | string | null;
}

function emptyValues(): EditorValues {
  return {
    destination: "",
    startDate: "",
    endDate: "",
    title: "",
    content: "",
    colorIndex: 0,
    reviewActive: false,
    headcount: 1,
    expectedCost: null,
    transportation: null,
    creatorType: "USER",
  };
}

function valuesFromRecord(record: ScheduleRecord): EditorValues {
  return {
    destination: record.destination ?? "",
    startDate: record.startDate,
    endDate: record.endDate,
    title: record.title,
    content: record.content ?? "",
    colorIndex: colorIndex(record.calendarColor),
    reviewActive: false,
    headcount: record.headcount ?? 1,
    expectedCost: record.expectedCost,
    transportation: record.transportation,
    creatorType: record.creatorType,
  };
}

function EditorHero({ mode }: { mode: EditorMode }) {
  const editing = mode === "edit";

  return (
    <section className="relative h-[clamp(260px,26vw,500px)] overflow-hidden">
      <Image
        alt="세계 지도 위에 놓인 여권과 여행 장비"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/images/schedules/editor-hero.jpg"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
      <ContentContainer className="absolute inset-x-0 bottom-[16%]">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-[clamp(2.25rem,3vw,3.5rem)] font-medium text-text-inverse">
            {editing ? "EDIT PLAN" : "ADD PLAN"}
          </h1>
          <p className="mt-2 text-body-sm text-white/90">
            {editing
              ? "저장한 일정을 자유롭게 수정해보세요"
              : "나만의 새로운 추억, 자유롭게 채워보는 일정"}
          </p>
        </div>
      </ContentContainer>
    </section>
  );
}

export function ScheduleEditorPage({
  mode,
  scheduleId,
}: ScheduleEditorPageProps) {
  const router = useRouter();
  const editing = mode === "edit";
  const [deleted, setDeleted] = useState(false);
  const detailQuery = useQuery({
    queryKey: ["schedules", scheduleId],
    queryFn: () => getScheduleDetail(scheduleId ?? ""),
    enabled: editing && Boolean(scheduleId) && !deleted,
  });
  const error = useApiError(deleted ? null : detailQuery.error);
  const record = detailQuery.data?.schedule;
  const isAiSchedule = creatorCategory(record?.creatorType) === "ai";

  useEffect(() => {
    if (!editing || !scheduleId || !isAiSchedule) {
      return;
    }
    router.replace(`/schedules/${scheduleId}`);
  }, [editing, isAiSchedule, router, scheduleId]);

  if (editing && detailQuery.isLoading) {
    return (
      <div className="bg-surface-default">
        <EditorHero mode={mode} />
        <ContentContainer className="py-section-y">
          <StatusMessage>일정을 불러오는 중입니다.</StatusMessage>
        </ContentContainer>
      </div>
    );
  }

  if (editing && !deleted && (error || !record)) {
    return (
      <div className="bg-surface-default">
        <EditorHero mode={mode} />
        <ContentContainer className="py-section-y">
          <StatusMessage role="alert">
            {error || "일정을 찾을 수 없습니다."}
          </StatusMessage>
        </ContentContainer>
      </div>
    );
  }

  if (editing && isAiSchedule) {
    return (
      <div className="bg-surface-default">
        <EditorHero mode={mode} />
        <ContentContainer className="py-section-y">
          <StatusMessage>일정 상세 화면으로 이동 중입니다.</StatusMessage>
        </ContentContainer>
      </div>
    );
  }

  return (
    <ScheduleEditorForm
      initial={editing && record ? valuesFromRecord(record) : emptyValues()}
      mode={mode}
      onDeleted={() => setDeleted(true)}
      scheduleId={scheduleId}
    />
  );
}

function ScheduleEditorForm({
  mode,
  scheduleId,
  initial,
  onDeleted,
}: ScheduleEditorPageProps & { initial: EditorValues }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const editing = mode === "edit";
  const [editor, setEditor] = useState(initial);
  const [modal, setModal] = useState<EditorModal>(null);
  const [error, setError] = useState("");
  const [createdUuid, setCreatedUuid] = useState(scheduleId ?? "");
  const isAiSchedule = editor.creatorType === "AI";
  const isSharedSchedule = editor.creatorType === "OTHER";

  const update = (key: keyof EditorValues, value: string | number | boolean) =>
    setEditor((current) => ({ ...current, [key]: value }));

  const invalidateSchedules = async (uuid?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["schedules"] });
    if (uuid) {
      await queryClient.invalidateQueries({ queryKey: ["schedules", uuid] });
    }
  };

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: async (result) => {
      setCreatedUuid(result.scheduleUuid);
      await invalidateSchedules(result.scheduleUuid);
      setModal("saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateSchedule>[1]) =>
      updateSchedule(scheduleId ?? "", payload),
    onSuccess: async () => {
      await invalidateSchedules(scheduleId);
      setModal("saved");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSchedule(scheduleId ?? ""),
    onSuccess: async () => {
      onDeleted?.();
      if (scheduleId) {
        await queryClient.cancelQueries({
          queryKey: ["schedules", scheduleId],
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["schedules", "calendar"],
      });
      setModal("deleted");
    },
  });

  const reviseMutation = useMutation({
    mutationFn: async () => {
      const calendarColor = SCHEDULE_COLORS[editor.colorIndex]?.value;
      await updateSchedule(scheduleId ?? "", {
        title: editor.title.trim(),
        destination: editor.destination.trim(),
        startDate: editor.startDate,
        endDate: editor.endDate,
        content: editor.content.trim(),
        calendarColor,
        headcount: Math.max(1, editor.headcount),
        expectedCost: editor.expectedCost ?? 0,
        transportation:
          typeof editor.transportation === "string"
            ? (editor.transportation as ScheduleTransportation)
            : undefined,
      });
      return reviseScheduleWithAi(
        scheduleId ?? "",
        "일정 내용을 더 구체적이고 읽기 쉽게 첨삭해 주세요."
      );
    },
    onSuccess: (result) => {
      setEditor((current) => ({
        ...current,
        reviewActive: true,
        content: result.revisedContent,
      }));
    },
  });

  const mutationError = useApiError(
    createMutation.error ??
      updateMutation.error ??
      deleteMutation.error ??
      reviseMutation.error
  );
  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reviseMutation.isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !editor.destination.trim() ||
      !editor.startDate ||
      !editor.endDate ||
      !editor.title.trim()
    ) {
      setError("필수 입력 항목을 모두 입력해주세요.");
      return;
    }
    if (editor.startDate > editor.endDate) {
      setError("종료일은 출발일보다 빠를 수 없습니다.");
      return;
    }
    if (!editing && !profile?.memberUuid) {
      setError("로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
      return;
    }

    setError("");
    const calendarColor = SCHEDULE_COLORS[editor.colorIndex]?.value;
    const payload = {
      title: editor.title.trim(),
      destination: editor.destination.trim(),
      startDate: editor.startDate,
      endDate: editor.endDate,
      content: editor.content.trim(),
      calendarColor,
      headcount: Math.max(1, editor.headcount),
      expectedCost: editor.expectedCost ?? 0,
      transportation:
        typeof editor.transportation === "string"
          ? (editor.transportation as ScheduleTransportation)
          : undefined,
    };

    if (editing) {
      updateMutation.mutate(payload);
      return;
    }

    createMutation.mutate({
      ...payload,
      memberUuid: profile?.memberUuid ?? "",
    });
  };

  return (
    <div className="bg-surface-default">
      <EditorHero mode={mode} />

      <ContentContainer>
        <form
          className="mx-auto w-full max-w-6xl py-section-y"
          onSubmit={submit}
        >
          <section>
            <h2 className="text-heading-lg text-text-primary">기본정보</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-16">
              <InputField
                error={
                  !editor.destination && error
                    ? "여행 목적지를 입력해주세요."
                    : undefined
                }
                label="여행 목적지 *"
                onChange={(event) => update("destination", event.target.value)}
                placeholder="예) 도쿄, 교토, 제주도"
                value={editor.destination}
              />
              <fieldset>
                <legend className="mb-1.5 text-label-sm text-text-primary">
                  여행 기간 *
                </legend>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                  <InputField
                    aria-label="출발일"
                    onChange={(event) =>
                      update("startDate", event.target.value)
                    }
                    type="date"
                    value={editor.startDate}
                  />
                  <span
                    aria-hidden="true"
                    className="text-body-sm text-text-disabled"
                  >
                    ~
                  </span>
                  <InputField
                    aria-label="도착일"
                    min={editor.startDate}
                    onChange={(event) => update("endDate", event.target.value)}
                    type="date"
                    value={editor.endDate}
                  />
                </div>
              </fieldset>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-heading-lg text-text-primary">세부 정보</h2>
            <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-16">
              <InputField
                error={
                  !editor.title && error
                    ? "일정 제목을 입력해주세요."
                    : undefined
                }
                label="일정 제목 *"
                onChange={(event) => update("title", event.target.value)}
                placeholder="예) 도쿄 5일 자유여행"
                value={editor.title}
              />

              <fieldset>
                <legend className="text-label-sm text-text-primary">
                  캘린더 표시 색상
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {SCHEDULE_COLORS.map((color, index) => (
                    <button
                      aria-label={`${index + 1}번 일정 색상`}
                      aria-pressed={editor.colorIndex === index}
                      className={`size-6 rounded-circle ${color.swatch} ${
                        editor.colorIndex === index
                          ? "ring-2 ring-brand-primary ring-offset-2"
                          : ""
                      }`}
                      key={color.value}
                      onClick={() => update("colorIndex", index)}
                      type="button"
                    />
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-8">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
                <label
                  className="text-label-sm text-text-primary"
                  htmlFor="schedule-content"
                >
                  일정 내용 / 메모
                </label>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      buttonStyle="secondary"
                      className="h-9 border-accent-gold text-badge-orange-fg"
                      disabled={pending}
                      icon="left"
                      iconComponent={Sparkles}
                      onClick={() => reviseMutation.mutate()}
                      size="sm"
                      type="button"
                    >
                      {reviseMutation.isPending
                        ? "AI 첨삭 중"
                        : editor.reviewActive
                          ? "AI 첨삭 재수정"
                          : "AI 첨삭 수정"}
                    </Button>
                    <Button
                      className="h-9 bg-accent-gold hover:bg-accent-gold/90"
                      disabled={pending || !editor.reviewActive}
                      onClick={() => setModal("reviewSaved")}
                      size="sm"
                      type="button"
                    >
                      AI 첨삭 저장
                    </Button>
                  </div>
                ) : null}
              </div>
              {editor.reviewActive ? (
                <p className="mb-2 text-caption text-brand-primary">
                  AI 첨삭 시 ‘일정 저장’을 눌러야 해당 내용이 저장됩니다.
                </p>
              ) : null}
              <textarea
                className="min-h-44 w-full resize-y rounded-sm border border-line-default bg-surface-default px-4 py-3 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled focus:border-brand-primary"
                id="schedule-content"
                onChange={(event) => update("content", event.target.value)}
                placeholder="예) 도착 후 체크인 → 시부야 탐방 → 저녁 식사"
                value={editor.content}
              />
            </div>

            <div className="mt-7">
              <p className="text-label-sm text-text-primary">
                일정 생성 유형 (자동 지정)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  tone={isAiSchedule ? "blue" : "gray"}
                  variant={isAiSchedule ? "solid" : "subtle"}
                >
                  AI 생성 일정
                </Badge>
                <Badge
                  tone={
                    !isAiSchedule && !isSharedSchedule && !editor.reviewActive
                      ? "blue"
                      : "gray"
                  }
                  variant={
                    !isAiSchedule && !isSharedSchedule ? "solid" : "subtle"
                  }
                >
                  내 일정
                </Badge>
                <Badge
                  tone={isSharedSchedule ? "purple" : "gray"}
                  variant={isSharedSchedule ? "solid" : "subtle"}
                >
                  공유 일정
                </Badge>
                <Badge
                  tone={editor.reviewActive ? "orange" : "gray"}
                  variant={editor.reviewActive ? "solid" : "subtle"}
                >
                  AI 첨삭
                </Badge>
              </div>
            </div>
          </section>

          {error || mutationError ? (
            <p className="mt-6 text-body-sm text-status-error" role="alert">
              {error || mutationError}
            </p>
          ) : null}

          <div className="mt-16 flex flex-wrap justify-end gap-3">
            <Button
              buttonStyle="secondary"
              disabled={pending}
              onClick={() => router.back()}
              type="button"
            >
              취소
            </Button>
            {editing ? (
              <Button
                buttonStyle="dangerOutline"
                disabled={pending}
                onClick={() => setModal("delete")}
                type="button"
              >
                삭제
              </Button>
            ) : null}
            <Button disabled={pending} type="submit">
              {pending ? "저장 중" : editing ? "일정 저장" : "일정 생성"}
            </Button>
          </div>
        </form>
      </ContentContainer>

      <Modal
        description={
          editing
            ? "일정 수정 내용이 저장되었습니다."
            : "새 일정이 생성되었습니다."
        }
        onClose={() => setModal(null)}
        open={modal === "saved"}
        primaryAction={{
          label: "캘린더로 이동",
          onClick: () => router.push("/schedules/calendar"),
        }}
        secondaryAction={
          createdUuid
            ? {
                label: "일정 보기",
                onClick: () =>
                  router.push(
                    scheduleOpenPath(createdUuid, editor.creatorType)
                  ),
              }
            : undefined
        }
        title={editing ? "일정 저장 완료" : "일정 생성 완료"}
        variant="success"
      />
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
      <Modal
        description="AI 첨삭 내용이 일정에 반영되었습니다. 일정 저장을 눌러 최종 저장하세요."
        onClose={() => setModal(null)}
        open={modal === "reviewSaved"}
        primaryAction={{ label: "확인", onClick: () => setModal(null) }}
        title="AI 첨삭 수정 완료"
        variant="success"
      />
    </div>
  );
}
