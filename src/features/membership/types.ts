export interface JoinedCreatorMembership {
  subscriptionUuid: string;
  membershipUuid: string;
  creatorUuid: string;
  membershipName: string;
  monthlyPrice: number;
  priceUnit: string;
  status: "ACTIVE" | "INACTIVE" | string;
  startedAt: string;
  endedAt: string | null;
}

export interface SubscribedCreatorListItem extends JoinedCreatorMembership {
  creatorNickname: string;
  creatorProfileImage: string | null;
}

export interface MyCreatorMembership {
  hasMembership: boolean;
  membershipUuid: string | null;
  membershipName: string | null;
  monthlyPrice: number | null;
  priceUnit: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE" | null;
  rejectReason: string | null;
}

export interface CreatorSubscribersSummary {
  subscriberCount: number;
  subscribers: Array<{
    subscriptionUuid: string;
    memberUuid: string;
    status: "ACTIVE" | "INACTIVE" | string;
    startedAt: string;
    endedAt: string | null;
  }>;
}

export interface CreatorSubscriberListItem {
  subscriptionUuid: string;
  memberUuid: string;
  status: "ACTIVE" | "INACTIVE" | string;
  startedAt: string;
  endedAt: string | null;
  subscriberNickname: string;
  subscriberProfileImage: string | null;
}

export interface CreatorRevenueSummary {
  revenueUuid: string | null;
  totalRevenue: number;
  availableRevenue: number;
  reservedRevenue: number;
  settledRevenue: number;
}

export interface MembershipApplicationRequest {
  membershipName: string;
  description: string;
  monthlyPrice: number;
  priceUnit: "TOKEN";
}

export interface MembershipApplicationValidation {
  eligible: boolean;
  gradeCode: string;
  monthlyPrice: number;
  priceUnit: string;
}

export interface MembershipApplicationResult {
  membershipUuid: string;
  creatorUuid: string;
  membershipName: string;
  monthlyPrice: number;
  priceUnit: string;
  status: string;
  revenueUuid: string;
}

export interface CancelSubscriptionResult {
  subscriptionUuid: string;
  status: string;
  endedAt: string;
}

export interface SettlementRequestResult {
  settlementUuid: string;
  status: string;
  settlementAmount: number;
  availableRevenue: number;
  reservedRevenue: number;
  requestedAt: string;
}
