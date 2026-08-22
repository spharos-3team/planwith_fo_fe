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
      className={`flex w-full flex-col items-start gap-6 rounded-[24px] border-[1.5px] border-[#EAF0F6] bg-white p-8 ${className}`}
    >
      {children}
    </section>
  );
}
