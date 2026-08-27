"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchStories } from "@/services/story/stories";

const STORY_SEARCH_SIZE = 20;

export function useStorySearch(keyword: string, page: number) {
  const normalizedKeyword = keyword.trim();

  return useQuery({
    queryKey: ["stories", "search", "CITY", normalizedKeyword, page],
    queryFn: () =>
      searchStories({
        type: "CITY",
        keyword: normalizedKeyword,
        page,
        size: STORY_SEARCH_SIZE,
      }),
    enabled: Boolean(normalizedKeyword),
    placeholderData: keepPreviousData,
  });
}
