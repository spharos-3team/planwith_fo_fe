import type { Metadata } from "next";

import {
  StoryMainPage,
  type StorySort,
} from "@/features/story/components/StoryMainPage";

export const metadata: Metadata = {
  title: "여행 스토리",
  description: "여행자들의 다양한 여행 스토리를 만나보세요.",
};

interface StoryMainRoutePageProps {
  searchParams: Promise<{ keyword?: string; page?: string; sort?: string }>;
}

function resolveStorySort(sort?: string): StorySort {
  return sort === "popular" || sort === "latest" ? sort : "all";
}

function resolvePage(page?: string): number {
  const parsedPage = Number(page);
  return Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
}

export default async function StoryMainRoutePage({
  searchParams,
}: StoryMainRoutePageProps) {
  const { keyword, page, sort } = await searchParams;

  return (
    <StoryMainPage
      activeSort={resolveStorySort(sort)}
      keyword={keyword?.trim() ?? ""}
      page={resolvePage(page)}
    />
  );
}
