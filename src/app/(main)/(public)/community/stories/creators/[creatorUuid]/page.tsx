import type { Metadata } from "next";

import {
  type CreatorStoryTab,
  StoryCreatorDetailPage,
} from "@/features/story/components/StoryCreatorDetailPage";

export const metadata: Metadata = {
  title: "스토리 크리에이터",
  description: "여행 크리에이터의 스토리와 활동을 확인하세요.",
};

interface StoryCreatorDetailRoutePageProps {
  searchParams: Promise<{ tab?: string }>;
}

function resolveCreatorStoryTab(tab?: string): CreatorStoryTab {
  return tab === "likes" ? "likes" : "posts";
}

export default async function StoryCreatorDetailRoutePage({
  searchParams,
}: StoryCreatorDetailRoutePageProps) {
  const { tab } = await searchParams;

  return <StoryCreatorDetailPage activeTab={resolveCreatorStoryTab(tab)} />;
}
