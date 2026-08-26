import { Heart, Share2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/InputField";
import { ContentContainer } from "@/components/common/layout/ContentContainer";

function SkeletonLines({
  widths = ["w-full", "w-full", "w-3/4"],
}: {
  widths?: string[];
}) {
  return (
    <div aria-hidden="true" className="grid gap-2">
      {widths.map((width, index) => (
        <span
          className={`h-2 rounded-full bg-gray-200 ${width}`}
          key={`${width}-${index}`}
        />
      ))}
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-3 py-4">
      <span className="size-9 shrink-0 rounded-circle bg-gray-200" />
      <div className="min-w-0 flex-1">
        <span className="mb-2 block h-2.5 w-20 rounded-full bg-gray-300" />
        <SkeletonLines widths={["w-full", "w-2/3"]} />
      </div>
    </div>
  );
}

export function StoryDetailPage() {
  return (
    <div className="bg-surface-default">
      <ContentContainer className="py-8 sm:py-12">
        <article
          aria-busy="true"
          aria-label="스토리 상세 내용을 불러오는 중입니다."
          className="mx-auto w-full max-w-[1320px]"
        >
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
            <span className="text-text-primary">상세</span>
          </nav>

          <div className="animate-pulse" role="status">
            <span className="sr-only">
              스토리 상세 내용을 불러오는 중입니다.
            </span>

            <section
              aria-label="스토리 대표 이미지"
              className="relative mt-4 aspect-[3.45/1] min-h-[180px] overflow-hidden rounded-lg bg-gray-300"
            >
              <span className="absolute left-4 top-4 h-5 w-16 rounded-full bg-surface-default/75" />
            </section>

            <header className="mx-auto mt-7 max-w-[1120px]">
              <span
                aria-hidden="true"
                className="block h-6 w-2/3 rounded-full bg-gray-300 sm:w-1/2"
              />
              <div className="mt-3 max-w-xl">
                <SkeletonLines widths={["w-full", "w-4/5"]} />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-sm bg-surface-page px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="size-10 rounded-circle bg-gray-300" />
                  <div>
                    <span className="mb-2 block h-2.5 w-20 rounded-full bg-gray-300" />
                    <span className="block h-2 w-28 rounded-full bg-gray-200" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 3 }, (_, index) => (
                    <span
                      className="size-8 rounded-circle bg-gray-200"
                      key={index}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <span className="h-2 w-20 rounded-full bg-gray-200" />
                <span className="h-2 w-14 rounded-full bg-gray-200" />
              </div>
            </header>

            <div className="mx-auto mt-5 grid max-w-[1120px] gap-8">
              <SkeletonLines widths={["w-full", "w-full", "w-3/4"]} />

              <section aria-label="스토리 첫 번째 일정">
                <div className="aspect-[3.3/1] min-h-[190px] rounded-lg bg-gray-300" />
                <span className="mt-5 block h-3 w-36 rounded-full bg-gray-300" />
                <div className="mt-4">
                  <SkeletonLines
                    widths={["w-full", "w-full", "w-5/6", "w-3/5"]}
                  />
                </div>
              </section>

              <section aria-label="스토리 두 번째 일정">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="aspect-[1.9/1] min-h-[180px] rounded-lg bg-gray-300" />
                  <div className="aspect-[1.9/1] min-h-[180px] rounded-lg bg-gray-300" />
                </div>
                <span className="mt-5 block h-3 w-44 rounded-full bg-gray-300" />
                <div className="mt-4">
                  <SkeletonLines
                    widths={["w-full", "w-full", "w-11/12", "w-2/3"]}
                  />
                </div>
              </section>

              <section aria-label="스토리 세 번째 일정">
                <div className="aspect-[2.95/1] min-h-[210px] rounded-lg bg-gray-300" />
                <span className="mt-5 block h-3 w-40 rounded-full bg-gray-300" />
                <div className="mt-4">
                  <SkeletonLines widths={["w-full", "w-full", "w-3/4"]} />
                </div>
              </section>

              <section aria-label="스토리 태그">
                <span className="mb-3 block h-3 w-10 rounded-full bg-gray-300" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      className="h-6 w-20 rounded-full bg-blue-ice"
                      key={index}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-[1120px] justify-center gap-3 rounded-md bg-surface-page py-3">
            <Button disabled icon="left" iconComponent={Heart} pill size="sm">
              좋아요
            </Button>
            <Button
              buttonStyle="ghost"
              disabled
              icon="left"
              iconComponent={Share2}
              pill
              size="sm"
            >
              공유
            </Button>
          </div>

          <section
            aria-labelledby="story-comments-heading"
            className="mx-auto mt-8 max-w-[1120px]"
          >
            <h2
              className="text-heading-lg text-text-primary"
              id="story-comments-heading"
            >
              댓글
            </h2>
            <form className="mt-4 flex items-end gap-2">
              <InputField
                disabled
                label="댓글"
                placeholder="로그인 후 댓글을 작성할 수 있습니다."
                showLabel={false}
              />
              <Button className="shrink-0" disabled size="sm" type="submit">
                등록
              </Button>
            </form>
            <div className="mt-2 divide-y divide-line-light">
              <CommentSkeleton />
              <CommentSkeleton />
            </div>
          </section>
        </article>
      </ContentContainer>
    </div>
  );
}
