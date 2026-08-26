import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { ContentContainer } from "@/components/common/layout/ContentContainer";

const storyTabs = [
  { href: "/community/stories", label: "전체", value: "all" },
  {
    href: "/community/stories?sort=popular",
    label: "인기순",
    value: "popular",
  },
  { href: "/community/stories?sort=latest", label: "최신순", value: "latest" },
] as const;

export type StorySort = (typeof storyTabs)[number]["value"];

function LatestStoriesSection() {
  return (
    <section aria-labelledby="latest-stories-heading">
      <div className="mb-4">
        <h2
          className="text-heading-lg text-text-primary"
          id="latest-stories-heading"
        >
          최신 스토리
        </h2>
        <p className="mt-1 text-caption text-text-secondary">
          전 세계 여행자들의 최신 스토리를 만나보세요
        </p>
      </div>

      <div
        aria-label="최신 스토리를 불러오는 중입니다."
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
      >
        {Array.from({ length: 9 }, (_, index) => (
          <div
            aria-hidden="true"
            className="relative aspect-[1.95/1] min-h-[140px] overflow-hidden rounded-lg bg-gray-300"
            key={index}
          >
            <span className="absolute left-4 top-4 h-3 w-14 rounded-full bg-surface-default/70" />
            <div className="absolute inset-x-4 bottom-4 text-text-inverse">
              <p className="mb-2 text-caption-sm">스토리 제목 텍스트</p>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-circle bg-surface-default/70" />
                <span className="h-2 w-14 rounded-full bg-surface-default/70" />
                <span className="h-2 w-8 rounded-full bg-surface-default/70" />
              </div>
              <span className="mt-2 block h-2 w-16 rounded-full bg-surface-default/70" />
            </div>
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="mt-10 flex justify-center gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            className={`size-3 rounded-circle ${
              index === 0 ? "bg-brand-primary" : "bg-gray-200"
            }`}
            key={index}
          />
        ))}
      </div>
    </section>
  );
}

function RecommendedStoriesSection() {
  return (
    <section aria-labelledby="recommended-stories-heading">
      <h2
        className="mb-4 text-heading-lg text-text-primary"
        id="recommended-stories-heading"
      >
        추천 스토리
      </h2>
      <div className="grid gap-6 md:grid-cols-3" role="status">
        <span className="sr-only">추천할 스토리가 아직 없습니다.</span>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            aria-hidden="true"
            className="relative aspect-[2.1/1] min-h-[132px] overflow-hidden rounded-lg bg-gray-300"
            key={index}
          >
            <div className="absolute inset-x-4 bottom-4">
              <span className="mb-3 block h-3 w-12 rounded-full bg-surface-default/80" />
              <span className="mb-2 block h-2 w-24 rounded-full bg-text-secondary/35" />
              <span className="block h-1.5 w-10 rounded-full bg-brand-primary/55" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularCreatorsSection() {
  return (
    <section aria-labelledby="popular-creators-heading">
      <h2
        className="mb-5 text-heading-lg text-text-primary"
        id="popular-creators-heading"
      >
        인기 크리에이터
      </h2>
      <div
        className="flex flex-wrap items-start justify-center gap-8 sm:gap-12"
        role="status"
      >
        <span className="sr-only">소개할 인기 크리에이터가 아직 없습니다.</span>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            aria-hidden="true"
            className="grid w-20 justify-items-center gap-2"
            key={index}
          >
            <span className="size-16 rounded-circle bg-gray-300" />
            <span className="text-caption text-text-secondary">크리에이터</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StoryMainPage({ activeSort }: { activeSort: StorySort }) {
  return (
    <div className="bg-surface-default">
      <section
        aria-label="여행 스토리 대표 이미지"
        className="relative h-[18rem] overflow-hidden sm:h-[24rem] lg:h-[30rem]"
      >
        <Image
          alt="초록빛 나무와 고가 철도가 어우러진 도심 도로"
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/images/story/story-main.png"
        />
      </section>

      <ContentContainer as="section" className="py-section-y">
        <div className="mx-auto w-full max-w-[1200px]">
          <form
            action="/community/stories"
            className="mx-auto w-full max-w-[440px]"
            method="get"
            role="search"
          >
            <InputField
              aria-label="스토리 검색"
              className="rounded-full border-line-light bg-surface-page pr-5"
              icon={Search}
              name="keyword"
              placeholder="여행 스토리를 검색해 보세요"
              showLabel={false}
              type="search"
            />
            <Button className="sr-only" type="submit">
              검색
            </Button>
          </form>

          <nav
            aria-label="스토리 정렬"
            className="mt-4 flex items-center justify-center gap-8"
          >
            {storyTabs.map((tab) => (
              <Link
                aria-current={tab.value === activeSort ? "page" : undefined}
                className={`text-body-sm transition ${
                  tab.value === activeSort
                    ? "font-semibold text-brand-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                href={tab.href}
                key={tab.href}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 grid gap-12">
            <RecommendedStoriesSection />
            <PopularCreatorsSection />
            <LatestStoriesSection />
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
