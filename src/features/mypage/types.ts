import type { MemberMe, MemberProfile } from "@/features/auth/types";

export interface MemberAgreement {
  termUuid: string;
  title: string;
  termType: string;
  version: string;
  required: boolean;
  agreed: boolean;
  agreedAt: string | null;
}

export interface UpdateMyPageRequest {
  phoneNumber?: string;
  name?: string;
  nickname?: string;
  profileImage?: string | null;
  profileIntro?: string | null;
  agreements?: Array<{
    termUuid: string;
    agreed: boolean;
  }>;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateMyPageResult {
  member: MemberMe;
  profile: MemberProfile;
  agreements: MemberAgreement[];
}

export interface PublicProfile extends MemberProfile {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean | null;
}

export interface FollowSummary {
  followUuid: string;
  isActive: boolean;
}

export interface PagedProfiles {
  content: MemberProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type MyPageSection = "profile" | "followers" | "payments";
