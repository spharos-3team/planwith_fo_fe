export type MeetingStatus = "RECRUITING" | "FULL" | "COMPLETED" | "DISBANDED";

export type MeetingRole = "HOST" | "VICE_HOST" | "MEMBER";

export type ParticipationStatus =
  "PENDING" | "APPROVED" | "REJECTED" | "LEFT" | "KICKED";

export type MyMeetingScope = "hosted" | "joined" | "pending";

export interface MeetingListItem {
  meetingUuid: string;
  hostMemberUuid?: string | null;
  hostNickname?: string | null;
  title: string;
  coverImage: string | null;
  intro: string | null;
  maxMemberCount: number;
  currentMemberCount: number;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  status: MeetingStatus | string;
}

export interface PagedMeetings {
  content: MeetingListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MyMeetings extends PagedMeetings {
  canCreate: boolean;
}

export interface ListMeetingsQuery {
  destination?: string;
  from?: string;
  to?: string;
  status?: MeetingStatus;
  page?: number;
  size?: number;
}

export interface ListMyMeetingsQuery {
  scope: MyMeetingScope;
  status?: MeetingStatus;
  page?: number;
  size?: number;
}

export interface MeetingDetail {
  meetingUuid: string;
  memberUuid: string;
  scheduleUuid: string | null;
  title: string;
  intro: string | null;
  coverImage: string | null;
  maxMemberCount: number;
  currentMemberCount: number;
  status: MeetingStatus | string;
  createdAt: string;
  myParticipation: ParticipationStatus | string | null;
  myRole: MeetingRole | string | null;
  canApply: boolean;
  canEnterChat: boolean;
  canViewMembers: boolean;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface MeetingApplication {
  memberUuid: string;
  message: string | null;
  status: ParticipationStatus | string;
  role: MeetingRole | string;
  joinAt: string | null;
  joinedAt: string | null;
}

export interface MeetingParticipation {
  meetingUuid: string;
  memberUuid: string | null;
  status: ParticipationStatus | string | null;
  role: MeetingRole | string | null;
}

export interface ApplyMeetingPayload {
  message?: string | null;
}

export interface CreateMeetingPayload {
  scheduleUuid: string;
  title: string;
  intro: string;
  maxMemberCount: number;
}

export interface UpdateMeetingPayload {
  scheduleUuid?: string;
  title?: string;
  intro?: string;
  maxMemberCount?: number;
}

export interface MeetingWriteResult {
  meetingUuid: string;
  memberUuid: string;
  scheduleUuid: string | null;
  title: string;
  intro: string | null;
  maxMemberCount: number;
  currentMemberCount: number;
  status: MeetingStatus | string;
  coverImage: string | null;
  createdAt: string;
}

export interface MeetingMember {
  memberUuid: string;
  role: MeetingRole | string;
  status: ParticipationStatus | string;
  joinedAt: string | null;
  nickname: string | null;
  profileImageUrl: string | null;
}
