"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";

const APPLY_MESSAGE_MAX = 200;

interface ApplyMeetingDialogProps {
  open: boolean;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

export function ApplyMeetingDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: ApplyMeetingDialogProps) {
  return (
    <Dialog onClose={onClose} open={open} title="모임신청하기">
      {open ? (
        <ApplyMeetingForm
          error={error}
          onClose={onClose}
          onSubmit={onSubmit}
          submitting={submitting}
        />
      ) : null}
    </Dialog>
  );
}

function ApplyMeetingForm({
  submitting,
  error,
  onClose,
  onSubmit,
}: Omit<ApplyMeetingDialogProps, "open">) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    onSubmit(message.trim());
  };

  return (
    <form className="mt-6" onSubmit={handleSubmit}>
      <p className="text-body-sm font-semibold text-text-primary">
        신청 메시지
      </p>
      <p className="mt-1 text-caption text-text-secondary">
        방장에게 전달할 메시지를 작성해주세요
      </p>
      <textarea
        className="mt-3 min-h-36 w-full resize-none rounded-sm border border-line-default bg-surface-default px-4 py-3 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled focus:border-brand-primary disabled:bg-surface-page"
        disabled={submitting}
        maxLength={APPLY_MESSAGE_MAX}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="저도 같이 가고 싶어요! 승인 부탁드려요."
        value={message}
      />
      <p className="mt-1 text-right text-caption text-text-disabled">
        {message.length} / {APPLY_MESSAGE_MAX}자
      </p>
      <div className="mt-5 rounded-md bg-surface-page px-3 py-3 text-center text-caption text-text-secondary">
        <p>신청 후 → 승인 대기중 표시로 변경됩니다</p>
        <p className="mt-1">승인 완료 시 채팅방 입장이 가능합니다</p>
      </div>
      {error ? (
        <p className="mt-3 text-center text-caption text-status-error">
          {error}
        </p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <Button
          buttonStyle="secondary"
          className="flex-1"
          disabled={submitting}
          onClick={onClose}
        >
          취소
        </Button>
        <Button className="flex-1" disabled={submitting} type="submit">
          {submitting ? "신청 중..." : "신청하기"}
        </Button>
      </div>
    </form>
  );
}
