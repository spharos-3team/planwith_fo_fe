"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/common/Button";

interface AiScheduleGeneratingPageProps {
  generationId: string;
}

export function AiScheduleGeneratingPage({
  generationId,
}: AiScheduleGeneratingPageProps) {
  const router = useRouter();

  return (
    <section className="grid min-h-[70dvh] place-items-center bg-surface-page px-6 py-20">
      <div className="w-full max-w-xl rounded-xl border border-line-light bg-surface-default p-8 text-center shadow-landmark sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-circle bg-badge-blue-bg text-brand-primary">
          <Sparkles aria-hidden="true" className="h-8 w-8" />
        </span>
        <h1 className="mt-7 text-heading-xl text-text-primary">
          AI가 여행 일정을 만들고 있어요
        </h1>
        <p className="mt-3 text-body-sm leading-6 text-text-secondary">
          입력한 여행 조건을 분석해 이동 시간과 추천 장소를 정리하고 있습니다.
        </p>
        <LoaderCircle
          aria-hidden="true"
          className="mx-auto mt-8 h-8 w-8 animate-spin text-brand-primary"
        />
        <p className="mt-5 text-caption text-text-disabled">
          작업 번호: {generationId}
        </p>
        <Button
          buttonStyle="secondary"
          className="mt-8"
          onClick={() => router.push(`/schedules/ai/${generationId}`)}
        >
          결과 화면 미리보기
        </Button>
      </div>
    </section>
  );
}
