"use client";

import Link from "next/link";

import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  next?: string;
}

export function LoginRequiredDialog({
  open,
  onClose,
  next,
}: LoginRequiredDialogProps) {
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  return (
    <Dialog
      description="모임에 참여하거나 내 모임을 보려면 로그인해 주세요."
      onClose={onClose}
      open={open}
      title="로그인이 필요합니다"
    >
      <div className="mt-6 flex gap-3">
        <Button buttonStyle="secondary" className="flex-1" onClick={onClose}>
          닫기
        </Button>
        <Link
          className="inline-flex h-[46px] flex-1 items-center justify-center rounded-md bg-brand-primary px-6 text-body-md font-bold text-text-inverse hover:bg-brand-primary-hover"
          href={loginHref}
        >
          로그인하기
        </Link>
      </div>
    </Dialog>
  );
}
