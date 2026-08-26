"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { LoginRequiredDialog } from "@/features/meeting/components/LoginRequiredDialog";
import { MeetingHostManageActions } from "@/features/meeting/components/MeetingHostManageActions";
import { MeetingToast } from "@/features/meeting/components/MeetingToast";
import {
  canBumpByGrade,
  meetingRoleLabel,
  meetingRoleTone,
} from "@/features/meeting/lib/format";
import type {
  MeetingApplication,
  MeetingMember,
} from "@/features/meeting/types";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { useApiError } from "@/hooks/useApiError";
import {
  approveMeetingApplication,
  assignViceHost,
  clearViceHost,
  getMeetingDetail,
  kickMeetingMember,
  listMeetingApplications,
  listMeetingMembers,
  rejectMeetingApplication,
} from "@/services/meeting/meetings";
import { ApiClientError } from "@/utils/apiClient";

interface MeetingMembersPageProps {
  meetingUuid: string;
}

type ConfirmKind =
  | { type: "assign-vice"; member: MeetingMember }
  | { type: "clear-vice"; member: MeetingMember }
  | { type: "kick"; member: MeetingMember };

function memberUuidOf(value: { memberUuid: string }): string {
  return String(value.memberUuid);
}

function displayName(member: MeetingMember): string {
  return member.nickname?.trim() || "닉네임 없음";
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.message : fallback;
}

function shouldRetryQuery(count: number, error: unknown): boolean {
  if (error instanceof ApiClientError && error.status === 401) {
    return false;
  }
  return count < 1;
}

function ApplicantRow({
  application,
  deciding,
  editable,
  onDecide,
}: {
  application: MeetingApplication;
  deciding: boolean;
  editable: boolean;
  onDecide: (
    application: MeetingApplication,
    decision: "approve" | "reject"
  ) => void;
}) {
  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-body-sm font-semibold text-text-primary">신청자</p>
        <p className="mt-1 text-caption text-text-secondary">
          {application.message?.trim() || "메시지가 없습니다."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          buttonStyle="secondary"
          disabled={!editable || deciding}
          onClick={() => onDecide(application, "reject")}
          size="sm"
        >
          {deciding ? "처리 중..." : "거절"}
        </Button>
        <Button
          disabled={!editable || deciding}
          onClick={() => onDecide(application, "approve")}
          size="sm"
        >
          {deciding ? "처리 중..." : "승인"}
        </Button>
      </div>
    </li>
  );
}

export function MeetingMembersPage({ meetingUuid }: MeetingMembersPageProps) {
  const queryClient = useQueryClient();
  const { status, isAuthenticated, profile } = useAuth();
  const [loginDismissed, setLoginDismissed] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);
  const [confirmError, setConfirmError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [decidingUuid, setDecidingUuid] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const decidingRef = useRef(false);

  const detailQuery = useQuery({
    queryKey: ["meetings", "detail", meetingUuid, isAuthenticated],
    queryFn: () => getMeetingDetail(meetingUuid),
    enabled: status !== "initializing",
    retry: shouldRetryQuery,
  });

  const membersQuery = useQuery({
    queryKey: ["meetings", meetingUuid, "members"],
    queryFn: () => listMeetingMembers(meetingUuid),
    enabled: isAuthenticated,
    retry: shouldRetryQuery,
  });

  const meeting = detailQuery.data;
  const isHost = meeting?.myRole === "HOST";
  const isViceHost = meeting?.myRole === "VICE_HOST";
  const isManager = isHost || isViceHost;
  const editable =
    meeting != null &&
    meeting.status !== "COMPLETED" &&
    meeting.status !== "DISBANDED";
  const myUuid = profile?.memberUuid ?? meeting?.memberUuid ?? "";

  const applicationsQuery = useQuery({
    queryKey: ["meetings", meetingUuid, "applications"],
    queryFn: () => listMeetingApplications(meetingUuid),
    enabled: isAuthenticated && isHost,
    retry: false,
  });

  const applications = applicationsQuery.data ?? [];

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const removeApplication = useCallback(
    (uuid: string) => {
      queryClient.setQueryData<MeetingApplication[]>(
        ["meetings", meetingUuid, "applications"],
        (current) =>
          (current ?? []).filter((item) => memberUuidOf(item) !== uuid)
      );
    },
    [meetingUuid, queryClient]
  );

  const syncInBackground = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["meetings", meetingUuid, "members"],
    });
    void queryClient.invalidateQueries({
      queryKey: ["meetings", "detail", meetingUuid],
    });
  }, [meetingUuid, queryClient]);

  const membersError = useApiError(membersQuery.error);
  const detailError = useApiError(detailQuery.error);
  const applicationsError = useApiError(applicationsQuery.error);
  const members = membersQuery.data ?? [];
  const pageTitle = isHost ? "모임 구성원 관리" : "모임 구성원";

  const openConfirm = (next: ConfirmKind) => {
    setConfirmError("");
    setConfirm(next);
  };

  const canKick = (member: MeetingMember) => {
    if (!editable || !isManager) {
      return false;
    }
    if (memberUuidOf(member) === myUuid || member.role === "HOST") {
      return false;
    }
    if (isViceHost && member.role === "VICE_HOST") {
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!confirm || confirming) {
      return;
    }

    setConfirming(true);
    setConfirmError("");

    try {
      if (confirm.type === "assign-vice") {
        await assignViceHost(meetingUuid, memberUuidOf(confirm.member));
        setToast(`${displayName(confirm.member)} 님을 부방장으로 지정했습니다`);
      } else if (confirm.type === "clear-vice") {
        await clearViceHost(meetingUuid);
        setToast("부방장 지정을 해제했습니다");
      } else {
        await kickMeetingMember(meetingUuid, memberUuidOf(confirm.member));
        setToast(`${displayName(confirm.member)} 님을 강퇴했습니다`);
      }

      setConfirm(null);
      syncInBackground();
    } catch (error) {
      setConfirmError(errorMessage(error, "요청을 처리하지 못했습니다."));
    } finally {
      setConfirming(false);
    }
  };

  const handleDecide = async (
    application: MeetingApplication,
    decision: "approve" | "reject"
  ) => {
    const uuid = memberUuidOf(application);
    if (decidingRef.current) {
      return;
    }

    decidingRef.current = true;
    setDecidingUuid(uuid);
    setActionError("");

    try {
      if (decision === "approve") {
        await approveMeetingApplication(meetingUuid, uuid);
        setToast("신청을 승인했습니다");
        syncInBackground();
      } else {
        await rejectMeetingApplication(meetingUuid, uuid);
        setToast("신청을 거절했습니다");
      }
      removeApplication(uuid);
    } catch (error) {
      setActionError(errorMessage(error, "신청을 처리하지 못했습니다."));
    } finally {
      decidingRef.current = false;
      setDecidingUuid(null);
    }
  };

  const confirmCopy = confirm
    ? confirm.type === "assign-vice"
      ? {
          title: "부방장 지정",
          description: `${displayName(confirm.member)} 님을 부방장으로 지정할까요?`,
          label: "지정하기",
        }
      : confirm.type === "clear-vice"
        ? {
            title: "부방장 해제",
            description: `${displayName(confirm.member)} 님의 부방장 지정을 해제할까요?`,
            label: "해제하기",
          }
        : {
            title: "구성원 강퇴",
            description: `${displayName(confirm.member)} 님을 강퇴할까요? 다시 참여하려면 신청이 필요합니다.`,
            label: "강퇴하기",
          }
    : {
        title: "",
        description: "",
        label: "",
      };

  return (
    <div className="bg-surface-page pb-20">
      <div className="mx-auto w-full max-w-[800px] px-6 pt-8 sm:px-10">
        <nav
          aria-label="breadcrumb"
          className="flex flex-wrap items-center gap-2 text-caption text-text-secondary"
        >
          <Link className="hover:text-text-primary" href="/meetings">
            커뮤니티
          </Link>
          <span aria-hidden="true">&gt;</span>
          <Link className="hover:text-text-primary" href="/meetings">
            모임
          </Link>
          <span aria-hidden="true">&gt;</span>
          <Link
            className="hover:text-text-primary"
            href={`/meetings/${meetingUuid}`}
          >
            모임상세
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="text-text-primary">구성원</span>
        </nav>

        <header className="mt-6">
          <h1 className="text-heading-lg text-text-primary">{pageTitle}</h1>
          {meeting ? (
            <p className="mt-2 text-body-sm text-text-secondary">
              {meeting.title} · {meeting.currentMemberCount} /{" "}
              {meeting.maxMemberCount}명
            </p>
          ) : null}
        </header>

        {status === "initializing" ? (
          <div className="mt-8">
            <StatusMessage>구성원을 불러오는 중입니다.</StatusMessage>
          </div>
        ) : !isAuthenticated ? (
          <div className="mt-8">
            <StatusMessage>구성원을 보려면 로그인이 필요합니다.</StatusMessage>
          </div>
        ) : detailError && !meeting ? (
          <div className="mt-8">
            <StatusMessage role="alert">{detailError}</StatusMessage>
            <div className="mt-4 text-center">
              <Link
                className="text-body-sm font-semibold text-brand-primary hover:underline"
                href={`/meetings/${meetingUuid}`}
              >
                모임 상세로 돌아가기
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {isHost && meeting ? (
              <section className="rounded-lg border border-line-light bg-surface-default p-6">
                <h2 className="text-heading-sm text-text-primary">모임 관리</h2>
                <p className="mt-1 text-caption text-text-secondary">
                  끌어올리기, 모집 상태, 해체는 방장만 할 수 있습니다.
                </p>
                <div className="mt-4">
                  <MeetingHostManageActions
                    canBump={canBumpByGrade(profile?.grade)}
                    layout="grid"
                    meeting={meeting}
                    onToast={setToast}
                  />
                </div>
              </section>
            ) : null}

            {isHost ? (
              <section className="rounded-lg border border-line-light bg-surface-default p-6">
                <h2 className="text-heading-sm text-text-primary">모임 신청</h2>
                <p className="mt-1 text-caption text-text-secondary">
                  대기 중인 신청을 승인하거나 거절할 수 있습니다.
                </p>
                {applicationsQuery.isPending ? (
                  <p className="mt-4 text-body-sm text-text-secondary">
                    신청 목록을 불러오는 중입니다.
                  </p>
                ) : applicationsError ? (
                  <p className="mt-4 text-caption text-status-error">
                    {applicationsError}
                  </p>
                ) : applications.length === 0 ? (
                  <p className="mt-4 text-body-sm text-text-secondary">
                    대기 중인 신청이 없습니다.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-line-light">
                    {applications.map((application) => (
                      <ApplicantRow
                        application={application}
                        deciding={decidingUuid === memberUuidOf(application)}
                        editable={editable}
                        key={memberUuidOf(application)}
                        onDecide={(next, decision) => {
                          void handleDecide(next, decision);
                        }}
                      />
                    ))}
                  </ul>
                )}
                {actionError ? (
                  <p className="mt-3 text-caption text-status-error">
                    {actionError}
                  </p>
                ) : null}
              </section>
            ) : null}

            <section className="rounded-lg border border-line-light bg-surface-default p-6">
              <h2 className="text-heading-sm text-text-primary">구성원</h2>
              {membersQuery.isPending ? (
                <p className="mt-4 text-body-sm text-text-secondary">
                  구성원 목록을 불러오는 중입니다.
                </p>
              ) : membersError ? (
                <p className="mt-4 text-caption text-status-error">
                  {membersError}
                </p>
              ) : members.length === 0 ? (
                <p className="mt-4 text-body-sm text-text-secondary">
                  표시할 구성원이 없습니다.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-line-light">
                  {members.map((member) => {
                    const uuid = memberUuidOf(member);
                    const name = displayName(member);
                    return (
                      <li
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        key={uuid}
                      >
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            memberUuid={uuid}
                            nickname={name}
                            size={48}
                            src={member.profileImageUrl}
                          />
                          <div>
                            <p className="text-body-sm font-semibold text-text-primary">
                              {name}
                              {uuid === myUuid ? (
                                <span className="ml-1 text-caption text-text-secondary">
                                  (나)
                                </span>
                              ) : null}
                            </p>
                            <Badge
                              className="mt-1"
                              size="sm"
                              tone={meetingRoleTone(member.role)}
                            >
                              {meetingRoleLabel(member.role)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {isHost && editable && member.role === "MEMBER" ? (
                            <Button
                              buttonStyle="secondary"
                              onClick={() =>
                                openConfirm({ type: "assign-vice", member })
                              }
                              size="sm"
                            >
                              부방장 지정
                            </Button>
                          ) : null}
                          {isHost && editable && member.role === "VICE_HOST" ? (
                            <Button
                              buttonStyle="secondary"
                              onClick={() =>
                                openConfirm({ type: "clear-vice", member })
                              }
                              size="sm"
                            >
                              부방장 해제
                            </Button>
                          ) : null}
                          {canKick(member) ? (
                            <Button
                              buttonStyle="danger"
                              onClick={() =>
                                openConfirm({ type: "kick", member })
                              }
                              size="sm"
                            >
                              강퇴
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>

      <LoginRequiredDialog
        onClose={() => setLoginDismissed(true)}
        open={status === "unauthenticated" && !loginDismissed}
      />
      <Modal
        cancelAction={{
          label: "취소",
          onClick: () => {
            if (!confirming) {
              setConfirm(null);
            }
          },
        }}
        confirmAction={{
          label: confirming ? "처리 중..." : confirmCopy.label,
          onClick: () => {
            void handleConfirm();
          },
        }}
        description={confirmError || confirmCopy.description}
        onClose={() => {
          if (!confirming) {
            setConfirm(null);
          }
        }}
        open={confirm !== null}
        title={confirmCopy.title}
        variant="confirm"
      />
      <MeetingToast message={toast} />
    </div>
  );
}
