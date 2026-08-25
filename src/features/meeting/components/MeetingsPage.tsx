"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { ContentContainer } from "@/components/common/layout/ContentContainer";
import { StatusMessage } from "@/components/common/StatusMessage";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { LoginRequiredDialog } from "@/features/meeting/components/LoginRequiredDialog";
import { MeetingDateRangePicker } from "@/features/meeting/components/MeetingDateRangePicker";
import { MeetingGridCard } from "@/features/meeting/components/MeetingGridCard";
import { MeetingHero } from "@/features/meeting/components/MeetingHero";
import { MeetingPagination } from "@/features/meeting/components/MeetingPagination";
import { MyMeetingRow } from "@/features/meeting/components/MyMeetingRow";
import {
  groupMeetingsByStatus,
  meetingStatusLabel,
} from "@/features/meeting/lib/format";
import type { MyMeetingScope } from "@/features/meeting/types";
import { useApiError } from "@/hooks/useApiError";
import { listMeetings, listMyMeetings } from "@/services/meeting/meetings";

type ListTab = "all" | "mine";

const MY_SECTIONS: {
  scope: MyMeetingScope;
  title: string;
  empty: string;
  emptyAction?: { label: string; href: string };
  actionLabel?: string;
  badgeLabel?: string;
}[] = [
  {
    scope: "hosted",
    title: "내가 만든 모임",
    empty: "아직 만든 모임이 없어요",
    emptyAction: { label: "모임 만들러 가기", href: "/meetings/new" },
    actionLabel: "채팅방 입장",
  },
  {
    scope: "joined",
    title: "참여한 모임",
    empty: "아직 참여한 모임이 없어요",
    emptyAction: { label: "모임 가입하러 가기", href: "/meetings" },
    actionLabel: "채팅방 입장",
  },
  {
    scope: "pending",
    title: "승인 대기중",
    empty: "승인 대기중인 모임이 없습니다",
    badgeLabel: "승인 대기중",
  },
];

function isWideCard(index: number): boolean {
  const wideFirst = Math.floor(index / 2) % 2 === 0;
  return index % 2 === 0 ? wideFirst : !wideFirst;
}

export function MeetingsPage() {
  const router = useRouter();
  const { status, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<ListTab>("all");
  const [loginOpen, setLoginOpen] = useState(false);
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [fromDraft, setFromDraft] = useState("");
  const [toDraft, setToDraft] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [sectionPages, setSectionPages] = useState<
    Record<MyMeetingScope, number>
  >({
    hosted: 0,
    joined: 0,
    pending: 0,
  });

  const listQuery = useQuery({
    queryKey: ["meetings", from, to, recruitingOnly, page],
    queryFn: () =>
      listMeetings({
        from: from || undefined,
        to: to || undefined,
        status: recruitingOnly ? "RECRUITING" : undefined,
        page,
        size: 20,
      }),
    enabled: tab === "all" && status !== "initializing",
  });

  const hostedQuery = useQuery({
    queryKey: ["meetings", "me", "hosted", sectionPages.hosted],
    queryFn: () =>
      listMyMeetings({ scope: "hosted", page: sectionPages.hosted, size: 5 }),
    enabled: tab === "mine" && isAuthenticated,
  });
  const joinedQuery = useQuery({
    queryKey: ["meetings", "me", "joined", sectionPages.joined],
    queryFn: () =>
      listMyMeetings({ scope: "joined", page: sectionPages.joined, size: 5 }),
    enabled: tab === "mine" && isAuthenticated,
  });
  const pendingQuery = useQuery({
    queryKey: ["meetings", "me", "pending", sectionPages.pending],
    queryFn: () =>
      listMyMeetings({ scope: "pending", page: sectionPages.pending, size: 5 }),
    enabled: tab === "mine" && isAuthenticated,
  });

  const listError = useApiError(listQuery.error);
  const mineError = useApiError(
    hostedQuery.error ?? joinedQuery.error ?? pendingQuery.error
  );

  const requireLogin = (nextTab?: ListTab) => {
    if (isAuthenticated) {
      if (nextTab) {
        setTab(nextTab);
      }
      return;
    }

    setLoginOpen(true);
  };

  const applyFilters = () => {
    setFrom(fromDraft);
    setTo(toDraft);
    setPage(0);
  };

  const changeTab = (nextTab: ListTab) => {
    if (nextTab === "mine" && !isAuthenticated) {
      requireLogin();
      return;
    }

    setTab(nextTab);
  };

  const queriesByScope = {
    hosted: hostedQuery,
    joined: joinedQuery,
    pending: pendingQuery,
  };

  return (
    <div className="bg-surface-page">
      <MeetingHero />
      <ContentContainer as="section" className="pb-20 pt-[6.25rem]">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div
              aria-label="모임 목록 탭"
              className="flex w-fit rounded-full bg-white p-1"
              role="tablist"
            >
              <button
                aria-selected={tab === "all"}
                className={`rounded-full px-4 py-2 text-body-sm ${
                  tab === "all"
                    ? "bg-header-nav-active font-semibold text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => changeTab("all")}
                role="tab"
                type="button"
              >
                전체 모임
              </button>
              <button
                aria-selected={tab === "mine"}
                className={`rounded-full px-4 py-2 text-body-sm ${
                  tab === "mine"
                    ? "bg-header-nav-active font-semibold text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => changeTab("mine")}
                role="tab"
                type="button"
              >
                내 모임
              </button>
            </div>

            {tab === "all" ? (
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-3 text-body-sm text-text-primary">
                  모집중만 보기
                  <button
                    aria-checked={recruitingOnly}
                    aria-label="모집중만 보기"
                    className={`relative h-[30px] w-[67px] rounded-full transition ${
                      recruitingOnly ? "bg-brand-primary" : "bg-gray-300"
                    }`}
                    onClick={() => {
                      setRecruitingOnly((current) => !current);
                      setPage(0);
                    }}
                    role="switch"
                    type="button"
                  >
                    <span
                      className={`absolute top-[3px] size-6 rounded-full bg-white transition ${
                        recruitingOnly ? "left-[37px]" : "left-[3px]"
                      }`}
                    />
                  </button>
                </label>
                {isAuthenticated ? (
                  <Button
                    onClick={() => router.push("/meetings/new")}
                    pill
                    size="sm"
                  >
                    만들기
                  </Button>
                ) : (
                  <Button onClick={() => requireLogin()} pill size="sm">
                    만들기
                  </Button>
                )}
              </div>
            ) : null}
          </div>

          {tab === "all" ? (
            <>
              <form
                className="mt-12 flex flex-col gap-4 rounded-lg bg-white px-4 py-6 sm:flex-row sm:items-end sm:px-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  applyFilters();
                }}
              >
                <MeetingDateRangePicker
                  from={fromDraft}
                  onChange={({ from: nextFrom, to: nextTo }) => {
                    setFromDraft(nextFrom);
                    setToDraft(nextTo);
                  }}
                  to={toDraft}
                />
                <Button
                  className="h-[46px] w-full sm:ml-auto sm:w-[14.7rem]"
                  icon="left"
                  iconComponent={Search}
                  type="submit"
                >
                  검색
                </Button>
              </form>

              <div className="mt-10">
                {listQuery.isLoading || status === "initializing" ? (
                  <StatusMessage>모임을 불러오는 중입니다.</StatusMessage>
                ) : listError ? (
                  <StatusMessage role="alert">{listError}</StatusMessage>
                ) : (listQuery.data?.content.length ?? 0) === 0 ? (
                  <StatusMessage>아직 표시할 모임이 없습니다.</StatusMessage>
                ) : (
                  <div className="grid grid-cols-1 gap-x-14 gap-y-6 md:grid-cols-3">
                    {listQuery.data?.content.map((meeting, index) => (
                      <MeetingGridCard
                        key={meeting.meetingUuid}
                        meeting={meeting}
                        wide={isWideCard(index)}
                      />
                    ))}
                  </div>
                )}
                <MeetingPagination
                  onPageChange={setPage}
                  page={page}
                  totalPages={listQuery.data?.totalPages ?? 0}
                />
              </div>
            </>
          ) : (
            <div className="mt-10 grid gap-16">
              {mineError ? (
                <StatusMessage role="alert">{mineError}</StatusMessage>
              ) : (
                MY_SECTIONS.map((section) => {
                  const query = queriesByScope[section.scope];
                  const items = query.data?.content ?? [];
                  const emptyAction = section.emptyAction;

                  return (
                    <section key={section.scope}>
                      <h2 className="mb-6 text-center text-heading-lg text-text-primary">
                        {section.title}
                      </h2>
                      {query.isLoading ? (
                        <StatusMessage>모임을 불러오는 중입니다.</StatusMessage>
                      ) : items.length === 0 ? (
                        <div className="flex min-h-[12.5rem] flex-col items-center justify-center gap-4 rounded-lg border border-line-light bg-white">
                          <p className="text-body-sm text-text-secondary">
                            {section.empty}
                          </p>
                          {emptyAction ? (
                            <Link
                              className="inline-flex h-10 items-center justify-center rounded-full bg-brand-primary px-5 text-body-md font-bold text-text-inverse hover:bg-brand-primary-hover"
                              href={emptyAction.href}
                              onClick={(event) => {
                                if (
                                  emptyAction.href === "/meetings/new" &&
                                  !isAuthenticated
                                ) {
                                  event.preventDefault();
                                  requireLogin();
                                }

                                if (emptyAction.href === "/meetings") {
                                  event.preventDefault();
                                  setTab("all");
                                }
                              }}
                            >
                              {emptyAction.label}
                            </Link>
                          ) : null}
                        </div>
                      ) : section.scope === "pending" ? (
                        <div className="grid gap-4">
                          {items.map((meeting) => (
                            <MyMeetingRow
                              actionHref={
                                section.actionLabel
                                  ? `/chat?meetingUuid=${meeting.meetingUuid}`
                                  : undefined
                              }
                              actionLabel={section.actionLabel}
                              badgeLabel={section.badgeLabel}
                              key={meeting.meetingUuid}
                              meeting={meeting}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-8">
                          {groupMeetingsByStatus(items).map((group) => (
                            <div className="grid gap-4" key={group.status}>
                              <h3 className="text-heading-sm text-text-secondary">
                                {meetingStatusLabel(group.status)}
                              </h3>
                              {group.items.map((meeting) => (
                                <MyMeetingRow
                                  actionHref={
                                    section.actionLabel
                                      ? `/chat?meetingUuid=${meeting.meetingUuid}`
                                      : undefined
                                  }
                                  actionLabel={section.actionLabel}
                                  key={meeting.meetingUuid}
                                  meeting={meeting}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      <MeetingPagination
                        onPageChange={(nextPage) =>
                          setSectionPages((current) => ({
                            ...current,
                            [section.scope]: nextPage,
                          }))
                        }
                        page={sectionPages[section.scope]}
                        totalPages={query.data?.totalPages ?? 0}
                      />
                    </section>
                  );
                })
              )}
            </div>
          )}
        </div>
      </ContentContainer>
      <LoginRequiredDialog
        onClose={() => setLoginOpen(false)}
        open={loginOpen}
      />
    </div>
  );
}
