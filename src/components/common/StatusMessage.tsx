import type { ReactNode } from "react";

interface StatusMessageProps {
  children: ReactNode;
  role?: "status" | "alert";
}

export function StatusMessage({
  children,
  role = "status",
}: StatusMessageProps) {
  return (
    <div
      className="rounded-xl border border-line-light bg-surface-default px-5 py-8 text-center text-body-sm text-text-secondary"
      role={role}
    >
      {children}
    </div>
  );
}
