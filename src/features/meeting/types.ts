export type MeetingStatus = "RECRUITING" | "FULL" | "COMPLETED" | "DISBANDED";

export type MyMeetingScope = "hosted" | "joined" | "pending";

export interface MeetingListItem {
  meetingUuid: string;
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
