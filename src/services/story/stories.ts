import type {
  StorySearchQuery,
  StorySearchResult,
} from "@/features/story/types";
import { rawApiClient } from "@/utils/apiClient";

export function searchStories({
  type,
  keyword,
  page = 0,
  size = 20,
}: StorySearchQuery) {
  const search = new URLSearchParams({
    type,
    keyword: keyword.trim(),
    page: String(page),
    size: String(size),
  });

  return rawApiClient<StorySearchResult>(
    `/stories/search?${search.toString()}`
  );
}
