import { CalendarDays, Eye, Heart, MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { ContentContainer } from "@/components/common/layout/ContentContainer";

import { StoryCreateAction } from "./StoryCreateAction";
import { StorySearchResults } from "./StorySearchResults";

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

const recommendedStories = [
  {
    image: "/images/story/recommended-tokyo.png",
    title: "여러분 놓치지 말고 도쿄 여행",
  },
  {
    image: "/images/story/recommended-busan.png",
    title: "광안리 맛집 모음집!",
  },
  {
    image: "/images/story/recommended-osaka.png",
    title: "쓰러지게 먹어보기",
  },
] as const;

const popularCreators = [
  {
    image: "/images/story/creator-sky.png",
    name: "하늘여행자",
  },
  {
    image: "/images/story/creator-ocean.png",
    name: "뷰티소영",
  },
  {
    image: "/images/story/creator-wellness.png",
    name: "건강한미소",
  },
  {
    image: "/images/story/creator-fashion.png",
    name: "패션리즈",
  },
  {
    image: "/images/story/creator-food.png",
    name: "요리왕루시",
  },
] as const;

const latestStories = [
  {
    category: "일본 · 오사카",
    creator: "초밥러버",
    date: "2026.03.11",
    image: "/images/story/latest-osaka-sushi.png",
    title: "오사카 가성비 미슐랭 스시집 미도리 솔직한 평가",
    likes: "368",
    comments: "32",
    views: "1.2K",
    featured: true,
  },
  {
    category: "프랑스 · 파리",
    creator: "유럽방랑객",
    date: "2026.03.08",
    image: "/images/story/latest-paris.png",
    title: "에펠탑 인생샷 명소 스팟 TOP 3 & 피해야 할 명소 정리",
    likes: "368",
    comments: "32",
    views: "1.2K",
    featured: false,
  },
  {
    category: "태국 · 방콕",
    creator: "방콕작가",
    date: "2026.03.02",
    image: "/images/story/latest-bangkok.png",
    title: "방콕 야시장 쩨페어 실시간 먹거리 투어 총정리",
    likes: "222",
    comments: "26",
    views: "835",
    featured: true,
  },
  {
    category: "인도네시아 · 발리",
    creator: "건강한미소",
    date: "2026.02.28",
    image: "/images/story/latest-bali-yoga.png",
    title: "발리 우붓 요가 리트릿 7일 체험기",
    likes: "222",
    comments: "26",
    views: "835",
    featured: false,
  },
  {
    category: "프랑스 · 파리",
    creator: "패션리즈",
    date: "2026.02.25",
    image: "/images/story/latest-paris-family.png",
    title: "엄마와 딸의 첫 파리 여행, 골목 산책 기록",
    likes: "216",
    comments: "28",
    views: "937",
    featured: true,
  },
] as const;

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

      <div className="grid gap-4 md:grid-cols-3">
        {latestStories.map((story, index) => (
          <Link
            aria-label={`${story.title} 상세 보기`}
            className={`group relative min-h-[240px] overflow-hidden rounded-lg bg-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
              story.featured ? "md:col-span-2" : ""
            }`}
            href={`/community/stories/story-${index + 1}`}
            key={story.title}
          >
            <Image
              alt=""
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              fill
              sizes={
                story.featured
                  ? "(min-width: 768px) 66vw, 100vw"
                  : "(min-width: 768px) 33vw, 100vw"
              }
              src={story.image}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10"
            />
            <span className="absolute left-4 top-4 rounded-xs bg-surface-default/90 px-3 py-1 text-caption text-text-secondary">
              {story.category}
            </span>
            <div className="absolute inset-x-5 bottom-5 text-text-inverse">
              <h3 className="max-w-2xl text-heading-lg">{story.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption">
                <span>{story.creator}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  {story.date}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-caption">
                <span className="inline-flex items-center gap-1">
                  <Heart aria-hidden="true" className="size-4" />
                  {story.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle aria-hidden="true" className="size-4" />
                  {story.comments}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye aria-hidden="true" className="size-4" />
                  {story.views}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div
        aria-label="스토리 페이지"
        className="mt-10 flex justify-center gap-2"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Link
            aria-current={index === 0 ? "page" : undefined}
            aria-label={`${index + 1}페이지`}
            className={`size-3 rounded-circle transition ${
              index === 0 ? "bg-brand-primary" : "bg-gray-200 hover:bg-gray-300"
            }`}
            href={`/community/stories?page=${index + 1}`}
            key={index}
          />
        ))}
      </div>
    </section>
  );
}

function RecommendedStoriesSection() {
  return (
    <section
      aria-labelledby="recommended-stories-heading"
      className="border-b border-line-light pb-12"
    >
      <h2
        className="mb-6 text-heading-lg text-text-primary"
        id="recommended-stories-heading"
      >
        추천 스토리
      </h2>
      <div className="grid gap-8 md:grid-cols-3 md:gap-12">
        {recommendedStories.map((story, index) => (
          <article className="text-center" key={story.title}>
            <Link
              aria-label={`${story.title} 상세 보기`}
              className="group relative mx-auto block aspect-square w-full max-w-[300px] overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              href={`/community/stories/recommended-${index + 1}`}
            >
              <Image
                alt={story.title}
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                fill
                sizes="(min-width: 768px) 30vw, 80vw"
                src={story.image}
              />
            </Link>
            <h3 className="mt-5 text-body-md text-text-primary">
              {story.title}
            </h3>
            <Link
              className="mt-2 inline-block text-caption text-brand-primary hover:text-brand-primary-hover"
              href={`/community/stories/recommended-${index + 1}`}
            >
              더보기
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function PopularCreatorsSection() {
  return (
    <section
      aria-labelledby="popular-creators-heading"
      className="border-b border-line-light pb-12"
    >
      <h2
        className="mb-7 text-heading-lg text-text-primary"
        id="popular-creators-heading"
      >
        인기 크리에이터
      </h2>
      <ul
        aria-label="인기 크리에이터 목록"
        className="flex flex-wrap items-start justify-center gap-8 sm:gap-12 lg:gap-16"
      >
        {popularCreators.map((creator, index) => (
          <li key={creator.name}>
            <Link
              aria-label={`${creator.name} 크리에이터 상세 보기`}
              className="grid w-24 justify-items-center gap-3 rounded-lg transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
              href={`/community/stories/creators/creator-${index + 1}`}
            >
              <span className="relative size-20 overflow-hidden rounded-circle">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="80px"
                  src={creator.image}
                />
              </span>
              <span className="text-body-sm text-text-primary">
                {creator.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface StoryMainPageProps {
  activeSort: StorySort;
  keyword: string;
  page: number;
}

export function StoryMainPage({
  activeSort,
  keyword,
  page,
}: StoryMainPageProps) {
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
          <div className="relative flex flex-col items-center">
            <form
              action="/community/stories"
              className="w-full max-w-[440px]"
              method="get"
              role="search"
            >
              <InputField
                aria-label="스토리 검색"
                className="rounded-full border-line-light bg-surface-page pr-5"
                defaultValue={keyword}
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
            <StoryCreateAction />
          </div>

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

          {keyword ? (
            <div className="mt-10">
              <StorySearchResults keyword={keyword} page={page} />
            </div>
          ) : (
            <div className="mt-10 grid gap-12">
              <RecommendedStoriesSection />
              <PopularCreatorsSection />
              <LatestStoriesSection />
            </div>
          )}
        </div>
      </ContentContainer>
    </div>
  );
}
