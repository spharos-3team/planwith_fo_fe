import type { Metadata } from "next";

import { StoryDetailPage } from "@/features/story/components/StoryDetailPage";

export const metadata: Metadata = {
  title: "스토리 상세",
  description: "여행자의 상세 여행 스토리를 확인하세요.",
};

export default function StoryDetailRoutePage() {
  return <StoryDetailPage />;
}
