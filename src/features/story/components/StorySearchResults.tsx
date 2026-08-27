"use client";

import { Globe2, MapPin } from "lucide-react";
import Link from "next/link";

import { StatusMessage } from "@/components/common/StatusMessage";
import { useApiError } from "@/hooks/useApiError";

import { useStorySearch } from "../hooks/useStorySearch";

interface StorySearchResultsProps {
  keyword: string;
  page: number;
}

function searchPageHref(keyword: string, page: number): string {
  const search = new URLSearchParams({
    keyword,
    page: String(page),
  });
  return `/community/stories?${search.toString()}`;
}

export function StorySearchResults({ keyword, page }: StorySearchResultsProps) {
  const searchQuery = useStorySearch(keyword, page);
  const errorMessage = useApiError(searchQuery.error);
  const result = searchQuery.data;

  if (searchQuery.isLoading) {
    return <StatusMessage>도시의 스토리를 검색하고 있습니다.</StatusMessage>;
  }

  if (errorMessage) {
    return <StatusMessage role="alert">{errorMessage}</StatusMessage>;
  }

  if (!result?.items.length) {
    return (
      <StatusMessage>
        &ldquo;{keyword}&rdquo; 도시의 스토리를 찾을 수 없습니다.
      </StatusMessage>
    );
  }

  const hasPrevious = result.page > 0;
  const hasNext = result.size > 0 && result.items.length === result.size;

  return (
    <section aria-labelledby="story-search-results-heading">
      <div className="mb-5">
        <h2
          className="text-heading-lg text-text-primary"
          id="story-search-results-heading"
        >
          &ldquo;{keyword}&rdquo; 검색 결과
        </h2>
        <p className="mt-1 text-caption text-text-secondary">
          도시명이 포함된 여행 스토리입니다.
        </p>
      </div>

      <ul
        aria-busy={searchQuery.isFetching}
        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
          searchQuery.isFetching ? "opacity-60" : ""
        }`}
      >
        {result.items.map((story) => (
          <li key={story.storyUuid}>
            <Link
              className="group flex h-full min-h-44 flex-col rounded-lg border border-line-light bg-surface-default p-5 transition hover:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              href={`/community/stories/${story.storyUuid}`}
            >
              <span className="grid size-10 place-items-center rounded-circle bg-blue-ice text-brand-primary">
                <MapPin aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-heading-md text-text-primary group-hover:text-brand-primary">
                {story.title}
              </h3>
              <div className="mt-auto grid gap-2 pt-5 text-caption text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <Globe2 aria-hidden="true" className="size-4" />
                  {story.countries.join(", ") || "국가 정보 없음"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" className="size-4" />
                  {story.cities.join(", ") || "도시 정보 없음"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {hasPrevious || hasNext ? (
        <nav
          aria-label="검색 결과 페이지"
          className="mt-8 flex items-center justify-center gap-3"
        >
          {hasPrevious ? (
            <Link
              className="rounded-md border border-line-default bg-surface-default px-4 py-2 text-body-sm text-text-primary hover:bg-surface-page"
              href={searchPageHref(keyword, result.page - 1)}
            >
              이전
            </Link>
          ) : null}
          <span className="text-body-sm text-text-secondary">
            {result.page + 1}페이지
          </span>
          {hasNext ? (
            <Link
              className="rounded-md bg-brand-primary px-4 py-2 text-body-sm text-text-inverse hover:bg-brand-primary-hover"
              href={searchPageHref(keyword, result.page + 1)}
            >
              다음
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
