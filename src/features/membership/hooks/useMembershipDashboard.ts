import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  CreatorSubscriberListItem,
  SubscribedCreatorListItem,
} from "@/features/membership/types";
import { getPublicProfile } from "@/services/member/mypage";
import {
  getMyCreatorMembership,
  getMyMembershipRevenue,
  listJoinedCreatorMemberships,
  listMyMembershipSubscribers,
} from "@/services/membership/membership";

export const membershipQueryKeys = {
  me: ["memberships", "me"] as const,
  subscriptions: ["memberships", "me", "subscriptions"] as const,
  subscribers: ["memberships", "me", "subscribers"] as const,
  revenue: ["memberships", "me", "revenue"] as const,
};

export function useMembershipDashboard(isExplorerOrHigher: boolean) {
  const membershipQuery = useQuery({
    queryKey: membershipQueryKeys.me,
    queryFn: getMyCreatorMembership,
  });
  const subscriptionsQuery = useQuery({
    queryKey: membershipQueryKeys.subscriptions,
    queryFn: listJoinedCreatorMemberships,
  });
  const isApprovedCreator = Boolean(
    isExplorerOrHigher &&
    membershipQuery.data?.hasMembership &&
    membershipQuery.data.status === "APPROVED"
  );
  const subscribersQuery = useQuery({
    queryKey: membershipQueryKeys.subscribers,
    queryFn: listMyMembershipSubscribers,
    enabled: isApprovedCreator,
  });
  const revenueQuery = useQuery({
    queryKey: membershipQueryKeys.revenue,
    queryFn: getMyMembershipRevenue,
    enabled: isApprovedCreator,
  });

  const activeSubscriptions = useMemo(
    () =>
      (subscriptionsQuery.data ?? []).filter(
        (subscription) => subscription.status === "ACTIVE"
      ),
    [subscriptionsQuery.data]
  );
  const activeSubscribers = useMemo(
    () =>
      (subscribersQuery.data?.subscribers ?? []).filter(
        (subscriber) => subscriber.status === "ACTIVE"
      ),
    [subscribersQuery.data?.subscribers]
  );

  const creatorProfileQueries = useQueries({
    queries: activeSubscriptions.map((subscription) => ({
      queryKey: ["members", subscription.creatorUuid, "public-profile"],
      queryFn: () => getPublicProfile(subscription.creatorUuid),
    })),
  });
  const subscriberProfileQueries = useQueries({
    queries: activeSubscribers.map((subscriber) => ({
      queryKey: ["members", subscriber.memberUuid, "public-profile"],
      queryFn: () => getPublicProfile(subscriber.memberUuid),
    })),
  });

  const subscribedCreators = useMemo<SubscribedCreatorListItem[]>(
    () =>
      activeSubscriptions.map((subscription, index) => {
        const profile = creatorProfileQueries[index]?.data;
        return {
          ...subscription,
          creatorNickname: profile?.nickname ?? subscription.membershipName,
          creatorProfileImage: profile?.profileImage ?? null,
        };
      }),
    [activeSubscriptions, creatorProfileQueries]
  );
  const subscriberItems = useMemo<CreatorSubscriberListItem[]>(
    () =>
      activeSubscribers.map((subscriber, index) => {
        const profile = subscriberProfileQueries[index]?.data;
        return {
          ...subscriber,
          subscriberNickname: profile?.nickname ?? subscriber.memberUuid,
          subscriberProfileImage: profile?.profileImage ?? null,
        };
      }),
    [activeSubscribers, subscriberProfileQueries]
  );

  const error =
    membershipQuery.error ??
    subscriptionsQuery.error ??
    subscribersQuery.error ??
    revenueQuery.error;

  return {
    error,
    membership: membershipQuery.data,
    revenue: revenueQuery.data,
    subscribers: subscribersQuery.data,
    subscriberItems: subscribersQuery.data ? subscriberItems : undefined,
    subscribedCreators: subscriptionsQuery.data
      ? subscribedCreators
      : undefined,
    subscriptions: subscriptionsQuery.data,
  };
}
