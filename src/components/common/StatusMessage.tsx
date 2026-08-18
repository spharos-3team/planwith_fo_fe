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
      className="rounded-xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted"
      role={role}
    >
      {children}
    </div>
  );
}
