"use client";

import { Check } from "lucide-react";

interface MeetingToastProps {
  message: string | null;
}

export function MeetingToast({ message }: MeetingToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-24 z-[110] -translate-x-1/2"
      role="status"
    >
      <div className="flex items-center gap-3 rounded-full bg-white px-6 py-3.5 shadow-[0_8px_24px_rgb(15_23_42/0.12)]">
        <Check aria-hidden="true" className="size-5 text-status-success" />
        <p className="text-body-sm font-semibold text-text-primary">
          {message}
        </p>
      </div>
    </div>
  );
}
