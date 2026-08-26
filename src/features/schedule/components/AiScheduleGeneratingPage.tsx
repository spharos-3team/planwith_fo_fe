"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/common/Button";
import { StatusMessage } from "@/components/common/StatusMessage";
import {
  loadAiGeneratePayload,
  markAiApplicationCompleted,
  resumeAiApplicationDraft,
  saveAiGenerateResult,
} from "@/features/schedule/lib/ai-application";
import type { AiScheduleGenerateResult } from "@/features/schedule/types";
import { useApiError } from "@/hooks/useApiError";
import { generateAiSchedule } from "@/services/schedule/schedules";

interface AiScheduleGeneratingPageProps {
  generationId: string;
}

const generateJobs = new Map<string, Promise<AiScheduleGenerateResult>>();

function startGenerate(
  generationId: string
): Promise<AiScheduleGenerateResult> {
  const existing = generateJobs.get(generationId);
  if (existing) {
    return existing;
  }

  const payload = loadAiGeneratePayload();
  if (!payload) {
    return Promise.reject(new Error("입력한 여행 조건을 찾을 수 없습니다."));
  }

  const job = generateAiSchedule(payload)
    .then((result) => {
      const normalized = {
        ...result,
        items: result.items ?? [],
        title: result.title || result.destination,
      };
      saveAiGenerateResult(generationId, normalized, payload);
      markAiApplicationCompleted();
      return normalized;
    })
    .catch((error: unknown) => {
      generateJobs.delete(generationId);
      resumeAiApplicationDraft();
      throw error;
    });
  generateJobs.set(generationId, job);
  return job;
}

export function AiScheduleGeneratingPage({
  generationId,
}: AiScheduleGeneratingPageProps) {
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const message = useApiError(error);

  useEffect(() => {
    let cancelled = false;

    startGenerate(generationId)
      .then(() => {
        if (cancelled) {
          return;
        }
        router.replace(`/schedules/ai/${generationId}`);
      })
      .catch((nextError: unknown) => {
        if (!cancelled) {
          setError(nextError);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [generationId, router]);

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
        {error ? (
          <div className="mt-8 grid gap-4">
            <StatusMessage role="alert">
              {message || "일정 생성에 실패했습니다. 다시 시도해 주세요."}
            </StatusMessage>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                buttonStyle="secondary"
                onClick={() => router.push("/schedules/ai/new")}
              >
                입력으로 돌아가기
              </Button>
              <Button
                onClick={() => {
                  generateJobs.delete(generationId);
                  setError(null);
                  router.replace(
                    `/schedules/ai/${crypto.randomUUID()}/generating`
                  );
                }}
              >
                다시 생성
              </Button>
            </div>
          </div>
        ) : (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="mx-auto mt-8 h-8 w-8 animate-spin text-brand-primary"
            />
            <p className="mt-5 text-caption text-text-disabled">
              서버에서 일정을 생성 중입니다. 잠시만 기다려 주세요.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
