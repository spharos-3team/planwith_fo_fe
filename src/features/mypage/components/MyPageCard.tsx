import type { ReactNode } from "react";

export function MyPageCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex w-full flex-col items-start gap-6 rounded-[24px] border-[1.5px] border-blue-ice bg-surface-default p-6 sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}
