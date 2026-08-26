"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { ApplyMeetingDialog } from "@/features/meeting/components/ApplyMeetingDialog";
import { LoginRequiredDialog } from "@/features/meeting/components/LoginRequiredDialog";
import { MeetingCoverImage } from "@/features/meeting/components/MeetingCoverImage";
import { MeetingHostManageActions } from "@/features/meeting/components/MeetingHostManageActions";
import { MeetingToast } from "@/features/meeting/components/MeetingToast";
import {
  canBumpByGrade,
  formatMeetingPeriod,
  meetingStatusLabel,
  meetingStatusTone,
} from "@/features/meeting/lib/format";
import type {
  MeetingDetail,
  MeetingListItem,
  MyMeetings,
  PagedMeetings,
} from "@/features/meeting/types";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { usePublicProfile } from "@/features/mypage/hooks/usePublicProfile";
import { useApiError } from "@/hooks/useApiError";
import {
  applyToMeeting,
  getMeetingDetail,
  leaveMeeting,
} from "@/services/meeting/meetings";
import { getScheduleDetail } from "@/services/schedule/schedules";
import { ApiClientError } from "@/utils/apiClient";

interface MeetingDetailPageProps {
  meetingUuid: string;
}

type ConfirmKind = "leave";

const ACTION_LINK_PRIMARY =
  "inline-flex h-[46px] w-full items-center justify-center rounded-md bg-brand-primary px-6 text-body-md font-bold text-text-inverse hover:bg-brand-primary-hover";
const ACTION_LINK_SECONDARY =
  "inline-flex h-[46px] w-full items-center justify-center rounded-md border border-line-default bg-surface-default px-6 text-body-md font-bold text-text-primary hover:bg-surface-page";

function findCachedSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  meetingUuid: string
): Pick<MeetingListItem, "destination" | "startDate" | "endDate"> | null {
  const entries = queryClient.getQueriesData<PagedMeetings | MyMeetings>({
    queryKey: ["meetings"],
  });

  for (const [, data] of entries) {
    const hit = data?.content?.find((item) => item.meetingUuid === meetingUuid);
    if (hit) {
      return {
        destination: hit.destination,
        startDate: hit.startDate,
        endDate: hit.endDate,
      };
    }
  }

  return null;
}

function hintLines(meeting: MeetingDetail): string[] {
  if (meeting.myParticipation === "PENDING") {
    return ["방장이 신청을 승인한 후 채팅방 입장이 가능합니다"];
  }

  if (meeting.status === "COMPLETED") {
    return meeting.canEnterChat
      ? ["채팅방 입장은 가능하지만 입력은 할 수 없습니다"]
      : [];
  }

  if (meeting.status === "FULL") {
    return [];
  }

  if (meeting.canApply) {
    return [
      "신청 후 → 승인 대기중 표시로 변경됩니다",
      "승인 완료 시 채팅방 입장이 가능합니다",
    ];
  }

  return [];
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.message : fallback;
}

export function MeetingDetailPage({ meetingUuid }: MeetingDetailPageProps) {
  const queryClient = useQueryClient();
  const { status, isAuthenticated, profile } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [applyError, setApplyError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [applying, setApplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const applyInFlight = useRef(false);
  const confirmInFlight = useRef(false);

  const detailQueryKey = useMemo(
    () => ["meetings", "detail", meetingUuid, isAuthenticated] as const,
    [isAuthenticated, meetingUuid]
  );

  const detailQuery = useQuery({
    queryKey: detailQueryKey,
    queryFn: () => getMeetingDetail(meetingUuid),
    enabled: status !== "initializing",
  });

  const cachedSnapshot = findCachedSnapshot(queryClient, meetingUuid);
  const loadError = useApiError(detailQuery.error);
  const meeting = detailQuery.data;
  const hostProfileQuery = usePublicProfile(meeting?.memberUuid);
  const scheduleQuery = useQuery({
    queryKey: ["schedules", "detail", meeting?.scheduleUuid],
    queryFn: () => getScheduleDetail(meeting?.scheduleUuid ?? ""),
    enabled:
      Boolean(meeting?.scheduleUuid) &&
      !meeting?.destination &&
      !cachedSnapshot?.destination,
    retry: false,
  });

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const patchDetail = useCallback(
    (patch: Partial<MeetingDetail>) => {
      queryClient.setQueryData<MeetingDetail>(detailQueryKey, (current) =>
        current ? { ...current, ...patch } : current
      );
    },
    [detailQueryKey, queryClient]
  );

  const closeApply = useCallback(() => {
    if (applyInFlight.current) {
      return;
    }
    setApplyError("");
    setApplyOpen(false);
  }, []);

  const handleApply = async (message: string) => {
    if (applyInFlight.current) {
      return;
    }

    applyInFlight.current = true;
    setApplying(true);
    setApplyError("");

    try {
      await applyToMeeting(meetingUuid, { message: message || null });
      patchDetail({
        myParticipation: "PENDING",
        canApply: false,
        canEnterChat: false,
        canViewMembers: false,
      });
      setApplyOpen(false);
      setToast("모임 신청이 완료되었습니다");
    } catch (error: unknown) {
      setApplyError(errorMessage(error, "신청 처리 중 오류가 발생했습니다."));
    } finally {
      applyInFlight.current = false;
      setApplying(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmKind || confirmInFlight.current) {
      return;
    }

    confirmInFlight.current = true;
    setConfirming(true);
    setConfirmError("");

    try {
      await leaveMeeting(meetingUuid);
      patchDetail({
        myParticipation: "LEFT",
        myRole: null,
        canApply: meeting?.status === "RECRUITING",
        canEnterChat: false,
        canViewMembers: false,
        currentMemberCount: Math.max(0, (meeting?.currentMemberCount ?? 1) - 1),
      });
      setConfirmKind(null);
      setToast("모임에서 나왔습니다");
    } catch (error: unknown) {
      setConfirmError(errorMessage(error, "요청 처리 중 오류가 발생했습니다."));
    } finally {
      confirmInFlight.current = false;
      setConfirming(false);
    }
  };

  if (status === "initializing" || detailQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1224px] px-6 py-16 sm:px-10">
        <StatusMessage>모임을 불러오는 중입니다.</StatusMessage>
      </div>
    );
  }

  if (loadError || !meeting) {
    return (
      <div className="mx-auto w-full max-w-[1224px] px-6 py-16 sm:px-10">
        <StatusMessage role="alert">
          {loadError || "모임을 찾을 수 없습니다."}
        </StatusMessage>
        <div className="mt-6 text-center">
          <Link
            className="text-body-sm font-semibold text-brand-primary hover:underline"
            href="/community/meeting"
          >
            모임 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const destination =
    meeting.destination ??
    cachedSnapshot?.destination ??
    scheduleQuery.data?.schedule.destination ??
    null;
  const startDate =
    meeting.startDate ??
    cachedSnapshot?.startDate ??
    scheduleQuery.data?.schedule.startDate ??
    null;
  const endDate =
    meeting.endDate ??
    cachedSnapshot?.endDate ??
    scheduleQuery.data?.schedule.endDate ??
    null;
  const period = formatMeetingPeriod(startDate, endDate);
  const isHost = meeting.myRole === "HOST";
  const isPending = meeting.myParticipation === "PENDING";
  const isJoined = meeting.myParticipation === "APPROVED";
  const isCompleted = meeting.status === "COMPLETED";
  const isFull = meeting.status === "FULL";
  const progress =
    meeting.maxMemberCount > 0
      ? Math.min(
          100,
          Math.round(
            (meeting.currentMemberCount / meeting.maxMemberCount) * 100
          )
        )
      : 0;
  const hints = hintLines(meeting);
  const hostNickname =
    hostProfileQuery.data?.nickname ??
    (isHost ? (profile?.nickname ?? "방장") : "방장");
  const hostIntro = isHost
    ? (profile?.profileIntro ?? hostProfileQuery.data?.profileIntro ?? null)
    : (hostProfileQuery.data?.profileIntro ?? null);
  const hostImage = isHost
    ? (profile?.profileImage ?? hostProfileQuery.data?.profileImage ?? null)
    : (hostProfileQuery.data?.profileImage ?? null);
  const membersHref = `/community/meeting/${meeting.meetingUuid}/members`;
  const chatHref = isCompleted
    ? `/chat?meetingUuid=${meeting.meetingUuid}&readonly=1`
    : `/chat?meetingUuid=${meeting.meetingUuid}`;
  const memberCountLabel = isFull
    ? `${meeting.currentMemberCount}/${meeting.maxMemberCount}명 (${meetingStatusLabel(meeting.status)})`
    : `${meeting.currentMemberCount}/${meeting.maxMemberCount}명`;

  const openApply = () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }

    setApplyError("");
    setApplyOpen(true);
  };

  const openConfirm = (kind: ConfirmKind) => {
    setConfirmError("");
    setConfirmKind(kind);
  };

  const confirmCopy = {
    title: "모임을 나가시겠어요?",
    description:
      "나가면 채팅방 입장과 구성원 보기가 제한되고, 다시 참여하려면 신청이 필요합니다.",
    confirm: "나가기",
  };

  return (
    <div className="bg-surface-page pb-20">
      <div className="mx-auto w-full max-w-[1224px] px-6 pt-8 sm:px-10">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-2 text-caption text-text-secondary"
        >
          <Link className="hover:text-text-primary" href="/community/meeting">
            커뮤니티
          </Link>
          <span aria-hidden="true">&gt;</span>
          <Link className="hover:text-text-primary" href="/community/meeting">
            모임
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="text-text-primary">모임상세</span>
        </nav>

        <section className="relative mt-4 h-[37.5rem] overflow-hidden rounded-lg bg-blue-ice">
          <div
            aria-hidden="true"
            className="h-full w-full bg-[url('/images/meetings/hero.png')] bg-cover bg-center"
          />
          <MeetingCoverImage
            className="absolute inset-0 h-full w-full object-cover object-center"
            coverImage={meeting.coverImage}
            meetingUuid={meeting.meetingUuid}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/5"
          />
          <div className="absolute inset-x-0 bottom-10 px-8 text-center">
            <Badge
              className="mx-auto"
              size="sm"
              tone={meetingStatusTone(meeting.status)}
              variant="solid"
            >
              {meetingStatusLabel(meeting.status)}
            </Badge>
            <h1 className="mt-4 text-heading-hero text-white">
              {meeting.title}
            </h1>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <section>
              <h2 className="border-b border-line-light pb-3 text-heading-lg text-text-primary">
                모임 소개
              </h2>
              <p className="mt-6 whitespace-pre-wrap text-body-sm leading-7 text-text-secondary">
                {meeting.intro?.trim() || "등록된 소개가 없습니다."}
              </p>
            </section>

            <article className="mt-10 flex items-center gap-6 rounded-lg border border-line-light bg-white p-8">
              <ProfileAvatar
                memberUuid={meeting.memberUuid}
                nickname={hostNickname}
                size={96}
                src={hostImage}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-heading-lg text-text-primary">
                    {hostNickname}
                  </p>
                  <Badge size="sm" tone="blue">
                    방장
                  </Badge>
                </div>
                {hostIntro ? (
                  <p className="mt-2 text-body-sm leading-6 text-text-secondary">
                    {hostIntro}
                  </p>
                ) : null}
              </div>
            </article>
          </div>

          <aside className="rounded-lg border border-line-light bg-white p-8 lg:sticky lg:top-24">
            <dl className="grid gap-6">
              <div>
                <dt className="text-caption text-text-disabled">여행 목적지</dt>
                <dd className="mt-1 text-body-sm font-semibold text-text-primary">
                  {destination || "미정"}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-text-disabled">여행 기간</dt>
                <dd className="mt-1 text-body-sm font-semibold text-text-primary">
                  {period || "미정"}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-text-disabled">모임 인원</dt>
                <dd className="mt-1 text-body-sm font-semibold text-text-primary">
                  {memberCountLabel}
                </dd>
              </div>
            </dl>

            <hr className="my-6 border-line-light" />

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-heading-sm text-text-primary">참여 멤버</h3>
                <p className="text-caption text-text-secondary">
                  {isFull || isCompleted
                    ? meetingStatusLabel(meeting.status)
                    : `${meeting.currentMemberCount} / ${meeting.maxMemberCount}명 참여 중`}
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-ice">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {hints.length > 0 ? (
                <div className="mt-3 text-center text-caption leading-5 text-text-secondary">
                  {hints.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3">
              {meeting.canEnterChat ? (
                <Link className={ACTION_LINK_PRIMARY} href={chatHref}>
                  채팅방 입장
                </Link>
              ) : null}

              {isHost ? (
                <>
                  <Link className={ACTION_LINK_SECONDARY} href={membersHref}>
                    모임 구성원 관리
                  </Link>
                  {isCompleted ? null : (
                    <Link
                      className={ACTION_LINK_SECONDARY}
                      href={`/community/meeting/${meeting.meetingUuid}/edit`}
                    >
                      모임 수정
                    </Link>
                  )}
                  <MeetingHostManageActions
                    canBump={canBumpByGrade(profile?.grade)}
                    meeting={meeting}
                    onToast={setToast}
                  />
                </>
              ) : null}

              {!isHost && meeting.canApply ? (
                <Button className="w-full" onClick={openApply}>
                  모임 신청
                </Button>
              ) : null}

              {isPending ? (
                <Button className="w-full" disabled>
                  승인 대기중
                </Button>
              ) : null}

              {!isHost &&
              !isJoined &&
              !isPending &&
              !meeting.canApply &&
              (isFull || isCompleted) ? (
                <Button className="w-full" disabled>
                  {meetingStatusLabel(meeting.status)}
                </Button>
              ) : null}

              {!isHost && isJoined ? (
                <Link className={ACTION_LINK_SECONDARY} href={membersHref}>
                  모임 구성원 보기
                </Link>
              ) : null}

              {!isHost && isJoined ? (
                <button
                  className="mt-1 text-center text-caption font-semibold text-text-secondary"
                  onClick={() => openConfirm("leave")}
                  type="button"
                >
                  모임 나가기
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      <LoginRequiredDialog
        onClose={() => setLoginOpen(false)}
        open={loginOpen}
      />
      <ApplyMeetingDialog
        error={applyError}
        onClose={closeApply}
        onSubmit={(message) => {
          void handleApply(message);
        }}
        open={applyOpen}
        submitting={applying}
      />
      <Modal
        cancelAction={{
          label: "취소",
          onClick: () => {
            if (!confirming) {
              setConfirmKind(null);
            }
          },
        }}
        confirmAction={{
          label: confirming ? "처리 중..." : confirmCopy.confirm,
          onClick: () => {
            void handleConfirm();
          },
        }}
        description={confirmError || confirmCopy.description}
        onClose={() => {
          if (!confirming) {
            setConfirmKind(null);
          }
        }}
        open={confirmKind !== null}
        title={confirmCopy.title}
        variant="confirm"
      />
      <MeetingToast message={toast} />
    </div>
  );
}
