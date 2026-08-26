"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Camera, MapPin } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { Modal } from "@/components/common/Modal";
import { SelectField } from "@/components/common/SelectField";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { setReturnPath } from "@/features/auth/lib/return-path";
import { MeetingCoverImage } from "@/features/meeting/components/MeetingCoverImage";
import { prepareMeetingCoverFile } from "@/features/meeting/lib/cover-image";
import { rememberMeetingCover } from "@/features/meeting/lib/cover-src";
import {
  addDays,
  creatorCategory,
  isoDate,
  startOfToday,
} from "@/features/schedule/lib/calendar";
import { formatSchedulePeriod } from "@/features/schedule/lib/format";
import type { CalendarSchedule } from "@/features/schedule/types";
import { useApiError } from "@/hooks/useApiError";
import {
  createMeeting,
  getMeetingDetail,
  updateMeeting,
  uploadMeetingCoverImage,
} from "@/services/meeting/meetings";
import { listCalendarSchedules } from "@/services/schedule/schedules";

type EditorMode = "create" | "edit";

interface MeetingEditorPageProps {
  mode: EditorMode;
  meetingUuid?: string;
}

interface EditorValues {
  scheduleUuid: string;
  title: string;
  intro: string;
  maxMemberCount: number;
}

const TITLE_MAX = 100;
const INTRO_MAX = 2000;
const MIN_MEMBERS = 2;
const MAX_MEMBERS = 50;

function emptyValues(): EditorValues {
  return {
    scheduleUuid: "",
    title: "",
    intro: "",
    maxMemberCount: 4,
  };
}

function pickerRange(): { startDate: string; endDate: string } {
  const today = startOfToday();
  return {
    startDate: isoDate(addDays(today, -400)),
    endDate: isoDate(addDays(today, 800)),
  };
}

function ownSchedules(items: CalendarSchedule[]): CalendarSchedule[] {
  return items.filter((item) => creatorCategory(item.creatorType) !== "shared");
}

function scheduleOptionLabel(item: CalendarSchedule): string {
  const period = formatSchedulePeriod(item.startDate, item.endDate);
  return period ? `${item.title} (${period})` : item.title;
}

function EditorHero({ mode }: { mode: EditorMode }) {
  return (
    <section className="relative h-[clamp(220px,22vw,360px)] overflow-hidden">
      <Image
        alt="해변에서 함께 여행하는 사람들"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/images/meetings/hero-background.png"
        unoptimized
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
      <ContentContainer className="absolute inset-x-0 bottom-[18%]">
        <h1 className="text-[clamp(2rem,3vw,3.25rem)] font-medium text-text-inverse">
          {mode === "edit" ? "모임 수정" : "새 모임 만들기"}
        </h1>
        <p className="mt-2 text-body-sm text-white/90">
          {mode === "edit"
            ? "일정과 소개를 수정하고 대표 사진을 바꿔보세요"
            : "내 일정을 고르고 함께 떠날 모임을 만들어 보세요"}
        </p>
      </ContentContainer>
    </section>
  );
}

function valuesFromMeeting(meeting: {
  scheduleUuid: string | null;
  title: string;
  intro: string | null;
  maxMemberCount: number;
}): EditorValues {
  return {
    scheduleUuid: meeting.scheduleUuid ?? "",
    title: meeting.title,
    intro: meeting.intro ?? "",
    maxMemberCount: meeting.maxMemberCount,
  };
}

export function MeetingEditorPage({
  mode,
  meetingUuid,
}: MeetingEditorPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, isAuthenticated } = useAuth();
  const editing = mode === "edit";

  useEffect(() => {
    if (status !== "unauthenticated") {
      return;
    }
    setReturnPath(pathname);
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router, status]);

  const detailQuery = useQuery({
    queryKey: ["meetings", "detail", meetingUuid, true],
    queryFn: () => getMeetingDetail(meetingUuid ?? ""),
    enabled: editing && isAuthenticated && Boolean(meetingUuid),
  });
  const meeting = detailQuery.data;
  const detailError = useApiError(detailQuery.error);
  const isHost = meeting?.myRole === "HOST";

  if (status === "initializing" || status === "unauthenticated") {
    return (
      <div className="bg-surface-page px-6 py-20">
        <StatusMessage>
          {status === "unauthenticated"
            ? "로그인 화면으로 이동 중입니다."
            : "로그인 상태를 확인하는 중입니다."}
        </StatusMessage>
      </div>
    );
  }

  if (editing && detailQuery.isLoading) {
    return (
      <div className="bg-surface-page">
        <EditorHero mode={mode} />
        <ContentContainer className="py-16">
          <StatusMessage>모임을 불러오는 중입니다.</StatusMessage>
        </ContentContainer>
      </div>
    );
  }

  if (editing && (detailError || !meeting)) {
    return (
      <div className="bg-surface-page">
        <EditorHero mode={mode} />
        <ContentContainer className="py-16">
          <StatusMessage role="alert">
            {detailError || "모임을 찾을 수 없습니다."}
          </StatusMessage>
        </ContentContainer>
      </div>
    );
  }

  if (editing && meeting && !isHost) {
    return (
      <div className="bg-surface-page">
        <EditorHero mode={mode} />
        <ContentContainer className="py-16">
          <StatusMessage role="alert">
            방장만 모임을 수정할 수 있습니다.
          </StatusMessage>
          <div className="mt-6 flex justify-center">
            <Button
              buttonStyle="secondary"
              onClick={() => router.push(`/meetings/${meeting.meetingUuid}`)}
            >
              모임 상세로 돌아가기
            </Button>
          </div>
        </ContentContainer>
      </div>
    );
  }

  return (
    <MeetingEditorForm
      initial={editing && meeting ? valuesFromMeeting(meeting) : emptyValues()}
      initialCover={editing && meeting ? meeting.coverImage : null}
      linkedScheduleLabel={meeting?.title}
      meetingUuid={meetingUuid}
      mode={mode}
    />
  );
}

function MeetingEditorForm({
  mode,
  meetingUuid,
  initial,
  initialCover,
  linkedScheduleLabel,
}: MeetingEditorPageProps & {
  initial: EditorValues;
  initialCover: string | null;
  linkedScheduleLabel?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = mode === "edit";
  const [values, setValues] = useState(initial);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(initialCover);
  const [formError, setFormError] = useState("");
  const [createdUuid, setCreatedUuid] = useState(meetingUuid ?? "");
  const [saved, setSaved] = useState(false);
  const [coverSkipped, setCoverSkipped] = useState(false);
  const range = pickerRange();

  const schedulesQuery = useQuery({
    queryKey: ["schedules", "calendar", range.startDate, range.endDate],
    queryFn: () => listCalendarSchedules(range.startDate, range.endDate),
  });
  const schedules = ownSchedules(schedulesQuery.data ?? []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const preparedCover = coverFile
        ? await prepareMeetingCoverFile(coverFile)
        : null;
      const payload = {
        scheduleUuid: values.scheduleUuid,
        title: values.title.trim(),
        intro: values.intro.trim(),
        maxMemberCount: values.maxMemberCount,
      };

      const result = editing
        ? await updateMeeting(meetingUuid ?? "", payload)
        : await createMeeting(payload);

      let coverUploaded = !preparedCover;
      if (preparedCover) {
        await rememberMeetingCover(result.meetingUuid, preparedCover);
        try {
          await uploadMeetingCoverImage(result.meetingUuid, preparedCover);
          coverUploaded = true;
        } catch {
          coverUploaded = false;
        }
      }

      return { meeting: result, coverUploaded };
    },
    onSuccess: async ({ meeting, coverUploaded }) => {
      setCreatedUuid(meeting.meetingUuid);
      setCoverSkipped(!coverUploaded);
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setSaved(true);
    },
  });

  const schedulesError = useApiError(schedulesQuery.error);
  const saveError = useApiError(saveMutation.error);
  const selected = schedules.find(
    (item) => item.scheduleUuid === values.scheduleUuid
  );
  const scheduleOptions = schedules.map((item) => ({
    value: item.scheduleUuid,
    label: scheduleOptionLabel(item),
  }));
  if (
    values.scheduleUuid &&
    !scheduleOptions.some((item) => item.value === values.scheduleUuid)
  ) {
    scheduleOptions.unshift({
      value: values.scheduleUuid,
      label: linkedScheduleLabel
        ? `${linkedScheduleLabel} (연결된 일정)`
        : "연결된 일정",
    });
  }

  const update = (key: keyof EditorValues, value: string | number) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!values.scheduleUuid) {
      setFormError("모임을 만들 일정을 선택해 주세요.");
      return;
    }
    if (!values.title.trim()) {
      setFormError("모임 제목을 입력해 주세요.");
      return;
    }
    if (!values.intro.trim()) {
      setFormError("모임 소개를 입력해 주세요.");
      return;
    }
    if (
      values.maxMemberCount < MIN_MEMBERS ||
      values.maxMemberCount > MAX_MEMBERS
    ) {
      setFormError(
        `최대 인원은 ${MIN_MEMBERS}명 이상 ${MAX_MEMBERS}명 이하여야 합니다.`
      );
      return;
    }

    saveMutation.mutate();
  };

  const noSchedules =
    !schedulesQuery.isLoading &&
    !schedulesError &&
    schedules.length === 0 &&
    !values.scheduleUuid;

  return (
    <div className="bg-surface-page pb-20">
      <EditorHero mode={mode} />

      <ContentContainer className="pt-10">
        <form
          className="mx-auto w-full max-w-3xl rounded-lg border border-line-light bg-surface-default p-6 sm:p-8"
          onSubmit={submit}
        >
          {noSchedules ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <p className="text-body-sm text-text-secondary">
                아직 만든 일정이 없어요. 일정을 먼저 만든 뒤 모임을 열어 주세요.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => router.push("/schedules/new")}
                  type="button"
                >
                  일정 만들러 가기
                </Button>
                <Button
                  buttonStyle="secondary"
                  onClick={() => router.push("/schedules/ai/new")}
                  type="button"
                >
                  AI로 일정 만들기
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-label-sm text-text-primary">대표 사진</p>
                <div className="mt-3 overflow-hidden rounded-md border border-line-light bg-surface-page">
                  <div className="relative h-52 w-full">
                    {coverPreview?.startsWith("blob:") ? (
                      <Image
                        alt="모임 대표 사진 미리보기"
                        className="object-cover"
                        fill
                        sizes="768px"
                        src={coverPreview}
                        unoptimized
                      />
                    ) : coverPreview && meetingUuid ? (
                      <MeetingCoverImage
                        alt="모임 대표 사진 미리보기"
                        className="h-full w-full object-cover"
                        coverImage={coverPreview}
                        meetingUuid={meetingUuid}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-caption text-text-disabled">
                        선택한 사진이 여기에 표시됩니다
                      </div>
                    )}
                  </div>
                </div>
                <label className="mt-3 inline-flex">
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setCoverFile(file);
                      setCoverPreview((current) => {
                        if (current?.startsWith("blob:")) {
                          URL.revokeObjectURL(current);
                        }
                        return file ? URL.createObjectURL(file) : initialCover;
                      });
                    }}
                    type="file"
                  />
                  <span className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-line-default bg-surface-default px-5 text-body-md font-bold text-text-primary hover:bg-surface-page">
                    <Camera aria-hidden="true" className="h-4 w-4" />
                    사진 선택
                  </span>
                </label>
              </div>

              <div className="mt-8">
                <SelectField
                  disabled={schedulesQuery.isLoading}
                  error={
                    !values.scheduleUuid && formError.includes("일정")
                      ? formError
                      : undefined
                  }
                  id="meeting-schedule"
                  label="일정 선택 *"
                  onChange={(event) =>
                    update("scheduleUuid", event.target.value)
                  }
                  options={scheduleOptions}
                  placeholder="내 일정을 선택하세요"
                  value={values.scheduleUuid}
                />
                {schedulesError ? (
                  <p
                    className="mt-2 text-caption text-status-error"
                    role="alert"
                  >
                    {schedulesError}
                  </p>
                ) : null}
                {selected ? (
                  <p className="mt-3 inline-flex flex-wrap items-center gap-3 text-caption text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      />
                      {formatSchedulePeriod(
                        selected.startDate,
                        selected.endDate
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                      {selected.title}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-8">
                <InputField
                  id="meeting-title"
                  label="모임 제목 *"
                  maxLength={TITLE_MAX}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="예) 도쿄 3박 4일 같이 가요"
                  value={values.title}
                />
              </div>

              <div className="mt-8">
                <label
                  className="text-label-sm text-text-primary"
                  htmlFor="meeting-intro"
                >
                  모임 소개 *
                </label>
                <textarea
                  className="mt-1.5 min-h-40 w-full resize-y rounded-sm border border-line-default bg-surface-default px-4 py-3 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled focus:border-brand-primary"
                  id="meeting-intro"
                  maxLength={INTRO_MAX}
                  onChange={(event) => update("intro", event.target.value)}
                  placeholder="여행 스타일, 일정 페이스, 모집하고 싶은 멤버를 적어 주세요"
                  value={values.intro}
                />
                <p className="mt-1 text-right text-caption text-text-disabled">
                  {values.intro.length}/{INTRO_MAX}
                </p>
              </div>

              <div className="mt-8 max-w-48">
                <InputField
                  id="meeting-max-members"
                  label="최대 인원 *"
                  max={MAX_MEMBERS}
                  min={MIN_MEMBERS}
                  onChange={(event) =>
                    update(
                      "maxMemberCount",
                      Number.parseInt(event.target.value, 10) || MIN_MEMBERS
                    )
                  }
                  type="number"
                  value={values.maxMemberCount}
                />
              </div>

              {formError || saveError ? (
                <p className="mt-6 text-body-sm text-status-error" role="alert">
                  {formError || saveError}
                </p>
              ) : null}

              <div className="mt-12 flex flex-wrap justify-end gap-3">
                <Button
                  buttonStyle="secondary"
                  disabled={saveMutation.isPending}
                  onClick={() => router.back()}
                  type="button"
                >
                  취소
                </Button>
                <Button disabled={saveMutation.isPending} type="submit">
                  {saveMutation.isPending
                    ? "저장 중"
                    : editing
                      ? "모임 저장"
                      : "모임 만들기"}
                </Button>
              </div>
            </>
          )}
        </form>
      </ContentContainer>

      <Modal
        description={
          editing
            ? coverSkipped
              ? "모임 내용은 저장됐지만 대표 사진은 올리지 못했습니다. 수정 화면에서 다시 시도해 주세요."
              : "변경한 내용이 모임에 반영되었습니다."
            : coverSkipped
              ? "모임은 만들어졌지만 대표 사진은 올리지 못했습니다. 수정 화면에서 다시 시도해 주세요."
              : "이제 멤버를 모집하고 함께 여행을 준비할 수 있습니다."
        }
        onClose={() => setSaved(false)}
        open={saved}
        primaryAction={{
          label: "모임 상세 보기",
          onClick: () => router.push(`/meetings/${createdUuid}`),
        }}
        secondaryAction={{
          label: "모임 목록",
          onClick: () => router.push("/meetings"),
        }}
        title={editing ? "모임 수정 완료" : "모임이 생성되었습니다"}
        variant="success"
      />
    </div>
  );
}
