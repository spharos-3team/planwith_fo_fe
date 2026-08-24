import type { Metadata } from "next";

import { AiScheduleGeneratingPage } from "@/features/schedule/components/AiScheduleGeneratingPage";

export const metadata: Metadata = {
  title: "AI 일정 생성 중",
  description: "PLAN&WITH AI 여행 일정 생성 진행 상태",
};

interface AiScheduleGeneratingRoutePageProps {
  params: Promise<{ generationId: string }>;
}

export default async function AiScheduleGeneratingRoutePage({
  params,
}: AiScheduleGeneratingRoutePageProps) {
  const { generationId } = await params;

  return <AiScheduleGeneratingPage generationId={generationId} />;
}
