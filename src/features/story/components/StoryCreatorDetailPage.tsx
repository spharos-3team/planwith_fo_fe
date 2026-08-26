import Link from "next/link";

import { ContentContainer } from "@/components/common/layout/ContentContainer";

export type CreatorStoryTab = "posts" | "likes";

const creatorTabs = [
  { href: "?tab=posts", label: "게시글", value: "posts" },
  { href: "?tab=likes", label: "좋아요", value: "likes" },
] as const;

function CreatorStoryCardSkeleton({ index }: { index: number }) {
  return (
    <Link
      aria-label={`${index + 1}번째 스토리 상세 보기`}
      className="relative aspect-[1.95/1] min-h-[140px] overflow-hidden rounded-lg bg-gray-300 transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      href={`/community/stories/skeleton-${index + 1}`}
    >
      <div aria-hidden="true">
        <span className="absolute left-4 top-4 h-3 w-14 rounded-full bg-surface-default/70" />
        <div className="absolute inset-x-4 bottom-4">
          <span className="mb-2 block h-2.5 w-24 rounded-full bg-surface-default/75" />
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-circle bg-surface-default/70" />
            <span className="h-2 w-14 rounded-full bg-surface-default/70" />
            <span className="h-2 w-8 rounded-full bg-surface-default/70" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function StoryCreatorDetailPage({
  activeTab,
}: {
  activeTab: CreatorStoryTab;
}) {
  return (
    <div className="bg-surface-default">
      <ContentContainer className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-[1320px]">
          <nav
            aria-label="breadcrumb"
            className="flex items-center gap-2 text-caption text-text-secondary"
          >
            <Link className="hover:text-text-primary" href="/community/stories">
              커뮤니티
            </Link>
            <span aria-hidden="true">&gt;</span>
            <Link className="hover:text-text-primary" href="/community/stories">
              스토리
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span className="text-text-primary">크리에이터</span>
          </nav>

          <section
            aria-busy="true"
            aria-label="크리에이터 정보를 불러오는 중입니다."
            className="mt-4 rounded-lg bg-surface-page px-6 py-7 sm:px-10"
          >
            <span className="sr-only">
              크리에이터 정보를 불러오는 중입니다.
            </span>
            <div className="animate-pulse sm:flex sm:items-center sm:gap-7">
              <span className="mx-auto block size-24 shrink-0 rounded-circle bg-gray-300 sm:mx-0" />
              <div className="mt-5 min-w-0 flex-1 sm:mt-0">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <span className="h-5 w-32 rounded-full bg-gray-300" />
                  <span className="h-6 w-14 rounded-full bg-blue-200" />
                </div>
                <div className="mx-auto mt-3 grid max-w-lg gap-2 sm:mx-0">
                  <span className="h-2 w-full rounded-full bg-gray-200" />
                  <span className="h-2 w-3/4 rounded-full bg-gray-200" />
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-10">
                  {["게시글", "팔로워", "팔로잉", "좋아요"].map((label) => (
                    <div key={label}>
                      <dt className="text-caption text-text-secondary">
                        {label}
                      </dt>
                      <dd className="mt-2 h-3 w-14 rounded-full bg-gray-300" />
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          <nav
            aria-label="크리에이터 스토리 분류"
            className="mt-4 grid grid-cols-2 border-b border-line-light"
          >
            {creatorTabs.map((tab) => {
              const active = tab.value === activeTab;

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`border-b-2 py-3 text-center text-body-sm transition ${
                    active
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                  href={tab.href}
                  key={tab.value}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <section
            aria-busy="true"
            aria-label={`${activeTab === "posts" ? "게시글" : "좋아요"} 목록을 불러오는 중입니다.`}
            className="mt-5"
          >
            <span className="sr-only">
              크리에이터의 스토리 목록을 불러오는 중입니다.
            </span>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 11 }, (_, index) => (
                <CreatorStoryCardSkeleton index={index} key={index} />
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
        </div>
      </ContentContainer>
    </div>
  );
}
