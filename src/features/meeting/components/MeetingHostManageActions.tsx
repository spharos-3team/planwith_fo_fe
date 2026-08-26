"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import {
  patchMeetingInCachedLists,
  removeMeetingFromCachedLists,
} from "@/features/meeting/lib/cache";
import type { MeetingDetail, MeetingStatus } from "@/features/meeting/types";
import {
  bumpMeeting,
  changeMeetingRecruitmentStatus,
  disbandMeeting,
} from "@/services/meeting/meetings";
import { ApiClientError } from "@/utils/apiClient";

type HostConfirmKind =
  "bump" | "close-recruitment" | "open-recruitment" | "disband";

interface MeetingHostManageActionsProps {
  meeting: MeetingDetail;
  canBump: boolean;
  layout?: "stack" | "grid";
  onToast: (message: string) => void;
}

const COPY: Record<
  HostConfirmKind,
  {
    title: string;
    description: string;
    confirm: string;
    tone: "primary" | "danger";
  }
> = {
  bump: {
    title: "모임을 끌어올릴까요?",
    description: "목록 상단으로 올라갑니다. 6시간마다 한 번만 가능합니다.",
    confirm: "끌어올리기",
    tone: "primary",
  },
  "close-recruitment": {
    title: "모집을 완료할까요?",
    description: "새 신청을 받지 않습니다. 다시 모집중으로 바꿀 수 있습니다.",
    confirm: "모집 완료",
    tone: "primary",
  },
  "open-recruitment": {
    title: "모집을 다시 시작할까요?",
    description: "정원에 여유가 있으면 신청을 다시 받습니다.",
    confirm: "모집중",
    tone: "primary",
  },
  disband: {
    title: "모임을 해체할까요?",
    description:
      "모임 글이 사라지고, 모든 구성원이 퇴장하며 채팅방이 종료됩니다.",
    confirm: "해체하기",
    tone: "danger",
  },
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiClientError ? error.message : fallback;
}

function patchDetailStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  meetingUuid: string,
  status: MeetingStatus,
  extra: Partial<MeetingDetail> = {}
) {
  queryClient.setQueriesData<MeetingDetail>(
    { queryKey: ["meetings", "detail", meetingUuid] },
    (current) => (current ? { ...current, status, ...extra } : current)
  );
}

export function MeetingHostManageActions({
  meeting,
  canBump,
  layout = "stack",
  onToast,
}: MeetingHostManageActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmKind, setConfirmKind] = useState<HostConfirmKind | null>(null);
  const [confirmError, setConfirmError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const inFlight = useRef(false);

  const isRecruiting = meeting.status === "RECRUITING";
  const isFull = meeting.status === "FULL";
  const atCapacity = meeting.currentMemberCount >= meeting.maxMemberCount;
  const showBump = canBump && (isRecruiting || isFull);
  const grid = layout === "grid";
  const copy = confirmKind ? COPY[confirmKind] : null;

  const openConfirm = (kind: HostConfirmKind) => {
    setConfirmError("");
    setConfirmKind(kind);
  };

  const closeConfirm = () => {
    if (confirming) {
      return;
    }
    setConfirmKind(null);
    setConfirmError("");
  };

  const handleConfirm = async () => {
    if (!confirmKind || inFlight.current) {
      return;
    }

    inFlight.current = true;
    setConfirming(true);
    const kind = confirmKind;
    setConfirmError("");

    try {
      if (kind === "bump") {
        await bumpMeeting(meeting.meetingUuid);
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        setConfirmKind(null);
        onToast("모임을 끌어올렸습니다");
        return;
      }

      if (kind === "close-recruitment" || kind === "open-recruitment") {
        const nextStatus = kind === "close-recruitment" ? "FULL" : "RECRUITING";
        await changeMeetingRecruitmentStatus(meeting.meetingUuid, nextStatus);
        patchDetailStatus(queryClient, meeting.meetingUuid, nextStatus, {
          canApply: nextStatus === "RECRUITING",
        });
        patchMeetingInCachedLists(queryClient, meeting.meetingUuid, {
          status: nextStatus,
        });
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        setConfirmKind(null);
        onToast(
          nextStatus === "FULL"
            ? "모집을 완료했습니다"
            : "모집을 다시 시작했습니다"
        );
        return;
      }

      await disbandMeeting(meeting.meetingUuid);
      removeMeetingFromCachedLists(queryClient, meeting.meetingUuid);
      queryClient.removeQueries({
        queryKey: ["meetings", "detail", meeting.meetingUuid],
      });
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setConfirmKind(null);
      router.push("/community/meeting");
    } catch (error: unknown) {
      setConfirmError(errorMessage(error, "요청 처리 중 오류가 발생했습니다."));
    } finally {
      inFlight.current = false;
      setConfirming(false);
    }
  };

  const buttons = (
    <>
      {showBump ? (
        <Button
          buttonStyle="secondary"
          className="w-full"
          onClick={() => openConfirm("bump")}
        >
          끌어올리기
        </Button>
      ) : null}
      {isRecruiting ? (
        <Button
          buttonStyle="secondary"
          className="w-full"
          onClick={() => openConfirm("close-recruitment")}
        >
          모집 완료
        </Button>
      ) : null}
      {isFull && !atCapacity ? (
        <Button
          buttonStyle="secondary"
          className="w-full"
          onClick={() => openConfirm("open-recruitment")}
        >
          모집중
        </Button>
      ) : null}
      <Button
        buttonStyle="danger"
        className="w-full"
        onClick={() => openConfirm("disband")}
      >
        모임 해체
      </Button>
    </>
  );

  return (
    <>
      {grid ? (
        <div className="grid gap-3 sm:grid-cols-2">{buttons}</div>
      ) : (
        buttons
      )}
      <Modal
        cancelAction={{
          label: "취소",
          onClick: closeConfirm,
        }}
        confirmAction={{
          label: confirming ? "처리 중..." : (copy?.confirm ?? ""),
          onClick: () => {
            void handleConfirm();
          },
        }}
        confirmTone={copy?.tone}
        description={confirmError || copy?.description}
        onClose={closeConfirm}
        open={confirmKind !== null}
        title={copy?.title ?? ""}
        variant="confirm"
      />
    </>
  );
}
