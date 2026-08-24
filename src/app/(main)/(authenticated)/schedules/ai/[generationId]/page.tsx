import type { Metadata } from "next";

import { AiScheduleResultPage } from "@/features/schedule/components/AiScheduleResultPage";

export const metadata: Metadata = {
  title: "AI 일정 결과",
  description: "PLAN&WITH AI 여행 일정 결과",
};

interface AiScheduleResultRoutePageProps {
  params: Promise<{ generationId: string }>;
}

export default async function AiScheduleResultRoutePage({
  params,
}: AiScheduleResultRoutePageProps) {
  const { generationId } = await params;

  return <AiScheduleResultPage generationId={generationId} />;
}
