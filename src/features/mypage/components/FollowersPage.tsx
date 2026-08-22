"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { StatusMessage } from "@/components/common/StatusMessage";
import type { MemberProfile } from "@/features/auth/types";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { ProfileAvatar } from "@/features/mypage/components/ProfileAvatar";
import { useApiError } from "@/hooks/useApiError";
import {
  followMember,
  listFollowers,
  listFollowings,
  unfollowMember,
} from "@/services/member/follow";
import { getPublicProfile } from "@/services/member/mypage";

type FollowTab = "followers" | "followings";

export function FollowersPage({ memberUuid }: { memberUuid: string }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<FollowTab>("followers");
  const [extraItems, setExtraItems] = useState<MemberProfile[]>([]);
  const [nextPage, setNextPage] = useState(1);
  const [pendingUuid, setPendingUuid] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const apiError = useApiError(actionError ? new Error(actionError) : null);

  const countsQuery = useQuery({
    queryKey: ["members", memberUuid, "public-profile"],
    queryFn: () => getPublicProfile(memberUuid),
  });

  const listQuery = useQuery({
    queryKey: ["members", memberUuid, tab],
    queryFn: () =>
      tab === "followers"
        ? listFollowers(memberUuid, { page: 0, size: 20 })
        : listFollowings(memberUuid, { page: 0, size: 20 }),
  });

  const items = [...(listQuery.data?.content ?? []), ...extraItems];
  const totalPages = listQuery.data?.totalPages ?? 0;
  const loading = listQuery.isLoading;

  const changeTab = (nextTab: FollowTab) => {
    setTab(nextTab);
    setExtraItems([]);
    setNextPage(1);
    setActionError("");
  };

  const refreshLists = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["members", memberUuid, "public-profile"],
      }),
      queryClient.invalidateQueries({ queryKey: ["members", memberUuid, tab] }),
    ]);
  };

  const handleFollow = async (targetUuid: string) => {
    setPendingUuid(targetUuid);
    setActionError("");

    try {
      await followMember(targetUuid);
      await refreshLists();
    } catch (followError) {
      setActionError(
        followError instanceof Error
          ? followError.message
          : "팔로우에 실패했습니다."
      );
    } finally {
      setPendingUuid(null);
    }
  };

  const handleUnfollow = async (targetUuid: string) => {
    setPendingUuid(targetUuid);
    setActionError("");

    try {
      await unfollowMember(targetUuid);
      setExtraItems((current) =>
        current.filter((item) => item.memberUuid !== targetUuid)
      );
      await refreshLists();
    } catch (unfollowError) {
      setActionError(
        unfollowError instanceof Error
          ? unfollowError.message
          : "언팔로우에 실패했습니다."
      );
    } finally {
      setPendingUuid(null);
    }
  };

  const loadMore = async () => {
    setActionError("");

    try {
      const result =
        tab === "followers"
          ? await listFollowers(memberUuid, { page: nextPage, size: 20 })
          : await listFollowings(memberUuid, { page: nextPage, size: 20 });
      setExtraItems((current) => [...current, ...result.content]);
      setNextPage((current) => current + 1);
    } catch (loadError) {
      setActionError(
        loadError instanceof Error
          ? loadError.message
          : "목록을 불러오지 못했습니다."
      );
    }
  };

  const listError = useApiError(listQuery.error);
  const shownError = apiError || listError;

  return (
    <MyPageCard>
      <div>
        <h1 className="text-[18px] font-bold leading-[22px] text-[#1F1F1F]">
          팔로워/팔로우 관리
        </h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#615E5B]">
          나를 팔로우한 회원과 내가 팔로우하는 회원을 확인합니다.
        </p>
      </div>

      <div className="flex w-full gap-6 border-b border-line-light">
        <TabButton
          active={tab === "followers"}
          label={`팔로워 ${countsQuery.data?.followerCount ?? 0}`}
          onClick={() => changeTab("followers")}
        />
        <TabButton
          active={tab === "followings"}
          label={`팔로잉 ${countsQuery.data?.followingCount ?? 0}`}
          onClick={() => changeTab("followings")}
        />
      </div>

      {shownError ? (
        <p className="mt-4 text-caption text-status-error" role="alert">
          {shownError}
        </p>
      ) : null}

      <ul className="grid w-full gap-3">
        {items.map((item) => {
          return (
            <li
              className="flex items-center justify-between gap-4 rounded-xl border border-line-light px-4 py-3"
              key={item.memberUuid}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProfileAvatar
                  nickname={item.nickname}
                  size={48}
                  src={item.profileImage}
                />
                <div className="min-w-0">
                  <p className="truncate text-heading-sm text-text-primary">
                    {item.nickname}
                  </p>
                  {item.profileIntro ? (
                    <p className="truncate text-caption text-text-secondary">
                      {item.profileIntro}
                    </p>
                  ) : null}
                </div>
              </div>

              {tab === "followings" ? (
                <Button
                  buttonStyle="secondary"
                  className="h-10 shrink-0 border-brand-primary px-4 text-brand-primary"
                  disabled={pendingUuid === item.memberUuid}
                  onClick={() => void handleUnfollow(item.memberUuid)}
                  size="sm"
                >
                  언팔로우
                </Button>
              ) : (
                <Button
                  buttonStyle="secondary"
                  className="h-10 shrink-0 border-brand-primary px-4 text-brand-primary"
                  disabled={pendingUuid === item.memberUuid}
                  onClick={() => void handleFollow(item.memberUuid)}
                  size="sm"
                >
                  팔로우
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {!loading && items.length === 0 ? (
        <div className="mt-6">
          <StatusMessage>
            {tab === "followers"
              ? "아직 팔로워가 없습니다."
              : "아직 팔로잉한 회원이 없습니다."}
          </StatusMessage>
        </div>
      ) : null}

      {nextPage < totalPages ? (
        <div className="mt-6 flex justify-center">
          <Button
            buttonStyle="secondary"
            disabled={loading}
            onClick={() => void loadMore()}
          >
            더 보기
          </Button>
        </div>
      ) : null}
    </MyPageCard>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`border-b-2 pb-3 text-heading-sm transition ${
        active
          ? "border-brand-primary text-brand-primary"
          : "border-transparent text-text-secondary hover:text-text-primary"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
