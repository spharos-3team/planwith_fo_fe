import type {
  CancelSubscriptionResult,
  CreatorRevenueSummary,
  CreatorSubscribersSummary,
  JoinedCreatorMembership,
  MembershipApplicationRequest,
  MembershipApplicationResult,
  MembershipApplicationValidation,
  MyCreatorMembership,
  SettlementRequestResult,
} from "@/features/membership/types";
import { rawApiClient } from "@/utils/apiClient";

const MEMBERSHIP_API_PREFIX = "/api/planwith-fo-membership";

export function getMyCreatorMembership() {
  return rawApiClient<MyCreatorMembership>(
    `${MEMBERSHIP_API_PREFIX}/memberships/me`
  );
}

export function listJoinedCreatorMemberships() {
  return rawApiClient<JoinedCreatorMembership[]>(
    `${MEMBERSHIP_API_PREFIX}/memberships/me/subscriptions`
  );
}

export function listMyMembershipSubscribers() {
  return rawApiClient<CreatorSubscribersSummary>(
    `${MEMBERSHIP_API_PREFIX}/memberships/me/subscribers`
  );
}

export function getMyMembershipRevenue() {
  return rawApiClient<CreatorRevenueSummary>(
    `${MEMBERSHIP_API_PREFIX}/memberships/me/revenue`
  );
}

export function validateMembershipApplication(
  request: MembershipApplicationRequest
) {
  return rawApiClient<MembershipApplicationValidation>(
    `${MEMBERSHIP_API_PREFIX}/memberships/applications/validate`,
    { method: "POST", body: JSON.stringify(request) }
  );
}

export function applyMembership(request: MembershipApplicationRequest) {
  return rawApiClient<MembershipApplicationResult>(
    `${MEMBERSHIP_API_PREFIX}/memberships/applications`,
    { method: "POST", body: JSON.stringify(request) }
  );
}

export function cancelMembershipSubscription(subscriptionUuid: string) {
  return rawApiClient<CancelSubscriptionResult>(
    `${MEMBERSHIP_API_PREFIX}/memberships/me/subscriptions/${subscriptionUuid}/cancel`,
    { method: "POST" }
  );
}

export function requestMembershipSettlement(settlementAmount: number) {
  return rawApiClient<SettlementRequestResult>(
    `${MEMBERSHIP_API_PREFIX}/memberships/me/settlements`,
    {
      method: "POST",
      body: JSON.stringify({ settlementAmount }),
    }
  );
}
