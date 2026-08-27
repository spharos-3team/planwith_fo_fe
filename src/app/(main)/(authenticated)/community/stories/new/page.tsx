import type { Metadata } from "next";

import { StoryCreatePage } from "@/features/story/components/StoryCreatePage";

export const metadata: Metadata = {
  title: "스토리 작성",
  description: "여행의 순간과 여정을 스토리로 작성합니다.",
};

export default function StoryCreateRoutePage() {
  return <StoryCreatePage />;
}
