export interface AgreementItem {
  termUuid: string;
  agreed: boolean;
}

export interface TermItem {
  termUuid: string;
  title: string;
  termType: string;
  version: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface TermDetail extends TermItem {
  content: string;
}

export interface MemberMe {
  memberUuid: string;
  email: string;
  phoneNumber: string;
  name: string;
  loginType: "LOCAL" | "GOOGLE" | "NAVER" | "KAKAO" | string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface MemberProfile {
  memberUuid: string;
  nickname: string;
  profileImage: string | null;
  profileIntro: string | null;
  grade: string;
  profileBadge: boolean;
  profileSpecialBorder: boolean;
}

export interface LocalSignupRequest {
  email: string;
  password: string;
  phoneNumber: string;
  name: string;
  nickname: string;
  profileImage?: string | null;
  profileIntro?: string | null;
  agreements: AgreementItem[];
}

export interface LocalSignupResponse {
  memberUuid: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface SocialLoginResponse {
  isNewMember: boolean;
  tokenType: string | null;
  accessToken: string | null;
  accessTokenExpiresIn: number | null;
  user: {
    userId: string;
    roles: string[];
    scopes: string[];
  } | null;
}

export interface SocialSignupRequest {
  authorizationCode: string;
  redirectUri?: string | null;
  state?: string | null;
  nickname: string;
  profileImage?: string | null;
  profileIntro?: string | null;
  phoneNumber: string;
  name: string;
  agreements: AgreementItem[];
}
