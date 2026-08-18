import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "일정 서비스",
  description: "PLAN&WITH 일정 서비스",
};

export default function SchedulesPage() {
  return (
    <section className="mx-auto min-h-[60vh] w-full max-w-7xl px-6 py-20 sm:px-8">
      <p className="text-sm font-semibold text-primary">SCHEDULE</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">일정 서비스</h1>
      <p className="mt-4 text-muted">
        공통 Layout이 연결되었습니다. 일정 기능은 이 영역에 구성합니다.
      </p>
    </section>
  );
}
